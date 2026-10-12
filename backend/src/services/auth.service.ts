import argon from "argon2";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import {
  ChangePasswordSchema,
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  UpdateProfileSchema,
} from "../validator/auth.validator.js";
import { mailer } from "../lib/mailer.js";
import { createHash, randomBytes } from "node:crypto";
import { cloudinary } from "../lib/cloudinary.js";

import { randomUUID } from "node:crypto";

// Import prisma, ApiError, argon, dan RegisterSchema
// tetap gunakan import yang sudah ada di proyekmu.

export const registerService = async (body: RegisterSchema) => {
  const now = new Date();
  const expiredAt = new Date(now);
  expiredAt.setMonth(expiredAt.getMonth() + 3);

  return prisma.$transaction(async (tx) => {
    // 1. Cek email
    const existingUser = await tx.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      throw new ApiError("Email sudah terdaftar", 400);
    }

    // 2. Validasi referral code jika diisi
    let referrer = null;

    if (body.referralCode?.trim()) {
      referrer = await tx.user.findUnique({
        where: { referralCode: body.referralCode.trim() },
      });

      if (!referrer || referrer.deletedAt) {
        throw new ApiError("Referral code tidak valid", 400);
      }
    }

    // 3. Hash password
    const hashedPassword = await argon.hash(body.password);

    // 4. Buat user baru dan referral code miliknya
    const newUser = await tx.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        phone: body.phone,
        referralCode: `REF-${randomUUID()}`,
      },
    });

    // 5. Jika memakai referral, buat kupon dan hadiah poin
    if (referrer) {
      const coupon = await tx.coupon.create({
        data: {
          userId: newUser.id,
          code: `COUPON-${randomUUID()}`,
          discountType: "PERCENTAGE",
          discountValue: 10n,
          startAt: now,
          endAt: expiredAt,
        },
      });

      // Catat relasi referral untuk kedua user
      const referral = await tx.referralUser.create({
        data: {
          referrerId: referrer.id,
          referredUserId: newUser.id,
          rewardPoint: 10000n,
          couponId: coupon.id,
        },
      });

      // Catat 10.000 poin untuk pemilik referral
      await tx.pointTransaction.create({
        data: {
          userId: referrer.id,
          type: "REFERRAL",
          amount: 10000n,
          referenceType: "REFERRAL",
          referenceId: referral.id,
          remainingAmount: 10000n,
          expiredAt,
        },
      });
    }

    // 6. Return hasil
    return { message: "register success!" };
  });
};

export const loginService = async (body: LoginSchema) => {
  //1. cek dulu email di db ada atau tidak
  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });
  //2. kalau email tidak ada throw error
  if (!user) {
    throw new ApiError("Email atau password salah", 401);
  }
  //3. cek passwordnya ada atau tidak
  const isPassMatch = await argon.verify(user.password, body.password);

  //4. kalo password salah throw error
  if (!isPassMatch) {
    throw new ApiError("Email atau password salah", 401);
  }

  //5. generate access token (jwt)
  const payload = { id: user.id.toString(), role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  //6.return message login success : data user + access token
  return {
    message: "Login success",
    accessToken,
    user: {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePicture,
    },
  };
};

export const profileService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: BigInt(userId),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      profilePicture: true,
      referralCode: true,
    },
  });
  if (!user) {
    throw new ApiError("User tidak ditemukan", 404);
  }
  return user;
};
export const updateProfileService = async (
  userId: string,
  body: UpdateProfileSchema,
) => {
  const user = await prisma.user.update({
    where: {
      id: BigInt(userId),
    },
    data: {
      name: body.name,
      phone: body.phone,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      profilePicture: true,
      referralCode: true,
    },
  });

  return user;
};

export const changePasswordService = async (
  userId: string,
  body: ChangePasswordSchema,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: BigInt(userId),
    },
  });

  if (!user) {
    throw new ApiError("User tidak ditemukan", 404);
  }

  const isPasswordMatch = await argon.verify(
    user.password,
    body.currentPassword,
  );

  if (!isPasswordMatch) {
    throw new ApiError("Password lama salah", 400);
  }
  const isSamePassword = await argon.verify(user.password, body.newPassword);

  if (isSamePassword) {
    throw new ApiError(
      "Password baru tidak boleh sama dengan password lama",
      400,
    );
  }

  const hashedPassword = await argon.hash(body.newPassword);

  await prisma.user.update({
    where: {
      id: BigInt(userId),
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: "Password berhasil diubah",
  };
};

export const forgotPasswordService = async (body: ForgotPasswordSchema) => {
  if (!body || !body.email) {
    throw new Error("Email tidak ditemukan di dalam request body");
  }
  const genericMessage =
    "Jika email terdaftar, instruksi reset password akan dikirim.";

  const user = await prisma.user.findUnique({
    where: { email: body.email },
    select: {
      id: true,
      email: true,
    },
  });

  // Jangan mengungkap apakah email terdaftar.
  if (!user) {
    return { message: genericMessage };
  }

  // Token acak untuk dikirim melalui email.
  const resetToken = randomBytes(32).toString("hex");

  // Simpan hash token, bukan token aslinya.
  const hashedToken = createHash("sha256").update(resetToken).digest("hex");

  const expiredAt = new Date(Date.now() + 15 * 60 * 1000);

  // Tandai token reset sebelumnya sebagai sudah digunakan.
  await prisma.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: hashedToken,
      expiredAt,
    },
  });

  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new Error("FRONTEND_URL belum dikonfigurasi");
  }

  const resetUrl = new URL("/reset-password", frontendUrl);
  resetUrl.searchParams.set("token", resetToken);

  await mailer.sendMail({
    from: process.env.SMTP_USER,
    to: user.email,
    subject: "Reset Password",
    text: `Untuk mengatur ulang password, buka tautan berikut: ${resetUrl.toString()}. Tautan berlaku selama 15 menit.`,
    html: `
      <h2>Reset Password</h2>
      <p>Kami menerima permintaan untuk mengatur ulang password akunmu.</p>
      <p>
        <a href="${resetUrl.toString()}">Reset Password</a>
      </p>
      <p>Tautan berlaku selama 15 menit.</p>
      <p>Jika kamu tidak meminta reset password, abaikan email ini.</p>
    `,
  });

  return { message: genericMessage };
};

type ResetPasswordInput = Pick<ResetPasswordSchema, "token" | "newPassword">;
export const resetPasswordService = async ({
  token,
  newPassword,
}: ResetPasswordInput) => {
  // Hash token dari URL agar cocok dengan token di database.
  const hashedToken = createHash("sha256").update(token).digest("hex");

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: {
      token: hashedToken,
    },
    select: {
      id: true,
      userId: true,
      expiredAt: true,
      usedAt: true,
    },
  });

  // Token tidak ditemukan.
  if (!resetToken) {
    throw new ApiError("Token reset password tidak valid", 400);
  }

  // Token sudah pernah digunakan.
  if (resetToken.usedAt !== null) {
    throw new ApiError("Token reset password sudah digunakan", 400);
  }

  // Token sudah kedaluwarsa.
  if (resetToken.expiredAt <= new Date()) {
    throw new ApiError("Token reset password sudah kedaluwarsa", 400);
  }

  // Ambil password lama yang tersimpan di database.
  const user = await prisma.user.findUnique({
    where: {
      id: resetToken.userId,
    },
    select: {
      password: true,
    },
  });

  if (!user) {
    throw new ApiError("User tidak ditemukan", 404);
  }

  // Pastikan password baru tidak sama dengan password lama.
  const isSamePassword = await argon.verify(user.password, newPassword);

  if (isSamePassword) {
    throw new ApiError(
      "Password baru tidak boleh sama dengan password lama",
      400,
    );
  }

  // Lanjutkan proses yang sudah ada:
  // hash password baru, update password,
  // dan tandai token reset sebagai terpakai.

  // Hash password baru.
  const hashedPassword = await argon.hash(newPassword);

  // Update password dan klaim token dalam satu transaksi.
  await prisma.$transaction(async (tx) => {
    // Pastikan token belum digunakan dan belum kedaluwarsa.
    const claimedToken = await tx.passwordResetToken.updateMany({
      where: {
        id: resetToken.id,
        usedAt: null,
        expiredAt: {
          gt: new Date(),
        },
      },
      data: {
        usedAt: new Date(),
      },
    });

    // Jika token sudah diklaim request lain, batalkan transaksi.
    if (claimedToken.count !== 1) {
      throw new ApiError(
        "Token reset password sudah digunakan atau kedaluwarsa",
        400,
      );
    }

    // Update password hanya jika token berhasil diklaim.
    await tx.user.update({
      where: {
        id: resetToken.userId,
      },
      data: {
        password: hashedPassword,
      },
    });
  });

  return {
    message: "Password berhasil diubah. Silakan login kembali.",
  };
};

export const updateProfilePictureService = async (
  userId: string,
  file: Express.Multer.File,
) => {
  // Upload buffer gambar ke Cloudinary.
  const imageUrl = await new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "event-management/profiles",
        resource_type: "image",
        transformation: [{ width: 500, height: 500, crop: "limit" }],
      },
      (error, result) => {
        if (error) {
          return reject(new ApiError("Gagal mengunggah foto profile", 502));
        }

        if (!result) {
          return reject(
            new ApiError("Cloudinary tidak mengembalikan hasil upload", 502),
          );
        }

        resolve(result.secure_url);
      },
    );

    uploadStream.end(file.buffer);
  });

  // Simpan URL foto ke database pengguna.
  const user = await prisma.user.update({
    where: {
      id: BigInt(userId),
    },
    data: {
      profilePicture: imageUrl,
    },
    select: {
      id: true,
      name: true,
      profilePicture: true,
    },
  });

  return {
    message: "Foto profile berhasil diperbarui",
    user: {
      ...user,
      id: user.id.toString(),
    },
  };
};
