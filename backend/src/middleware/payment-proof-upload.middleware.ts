
import multer from "multer";

const paymentProofUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      callback(
        new Error("Bukti pembayaran harus berformat JPG, PNG, atau WEBP"),
      );
      return;
    }

    callback(null, true);
  },
});

export const uploadPaymentProof =
  paymentProofUpload.single("paymentProof");
