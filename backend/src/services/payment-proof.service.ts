
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { CHECKOUT_CONFIG } from "../config/checkout.config.js";

type UploadPaymentProofInput = {
  transactionId: string;
  userId: string;
  fileBuffer: Buffer;
};

const uploadToCloudinary = (fileBuffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "event-management/payment-proofs",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Upload bukti pembayaran gagal"));
          return;
        }

        resolve(result.secure_url);
      },
    );

    stream.end(fileBuffer);
  });
};

export const uploadPaymentProofService = async ({
  transactionId,
  userId,
  fileBuffer,
}: UploadPaymentProofInput) => {
  if (!/^\d+$/.test(transactionId) || !/^\d+$/.test(userId)) {
    throw new ApiError("ID transaksi atau pengguna tidak valid", 400);
  }

  const id = BigInt(transactionId);
  const customerId = BigInt(userId);

  const transaction = await prisma.eventTransaction.findFirst({
    where: {
      id,
      userId: customerId,
    },
    select: {
      id: true,
      status: true,
      paymentProofDeadline: true,
      paymentProof: {
        select: { id: true },
      },
    },
  });

  if (!transaction) {
    throw new ApiError("Transaksi tidak ditemukan", 404);
  }

  if (transaction.status !== "WAITING_FOR_PAYMENT") {
    throw new ApiError("Transaksi tidak sedang menunggu pembayaran", 409);
  }

  if (
    !transaction.paymentProofDeadline ||
    transaction.paymentProofDeadline <= new Date()
  ) {
    throw new ApiError("Batas waktu pembayaran telah berakhir", 410);
  }

  if (transaction.paymentProof) {
    throw new ApiError("Bukti pembayaran sudah diunggah", 409);
  }

  const fileUrl = await uploadToCloudinary(fileBuffer);

  const now = new Date();
  const adminDeadline = new Date(
    now.getTime() + CHECKOUT_CONFIG.ADMIN_CONFIRMATION_HOURS * 60 * 60 * 1000,
  );

  try {
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.eventTransaction.updateMany({
        where: {
          id,
          userId: customerId,
          status: "WAITING_FOR_PAYMENT",
          paymentProofDeadline: { gt: now },
        },
        data: {
          status: "WAITING_FOR_ADMIN_CONFIRMATION",
          adminConfirmationDeadline: adminDeadline,
        },
      });

      if (updated.count !== 1) {
        throw new ApiError(
          "Transaksi sudah berubah atau batas pembayaran telah berakhir",
          409,
        );
      }

      const proof = await tx.paymentProof.create({
        data: {
          transactionId: id,
          fileUrl,
        },
      });

      return {
        message: "Bukti pembayaran berhasil diunggah",
        paymentProof: {
          id: proof.id.toString(),
          transactionId: proof.transactionId.toString(),
          fileUrl: proof.fileUrl,
          uploadedAt: proof.uploadedAt.toISOString(),
        },
        status: "WAITING_FOR_ADMIN_CONFIRMATION",
        adminConfirmationDeadline: adminDeadline.toISOString(),
      };
    });
  } catch (error) {
    // Database gagal setelah upload? Hapus file Cloudinary agar tidak yatim.
    try {
      const url = new URL(fileUrl);
      const segments = url.pathname.split("/");
      const uploadIndex = segments.indexOf("upload");
      const publicIdWithExtension = segments.slice(uploadIndex + 2).join("/");
      const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");

      if (uploadIndex !== -1 && publicId) {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
        });
      }
    } catch (cleanupError) {
      console.error("Gagal membersihkan file bukti pembayaran:", cleanupError);
    }

    throw error;
  }
};
