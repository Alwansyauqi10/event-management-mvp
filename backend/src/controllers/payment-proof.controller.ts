
import type { Request, Response, NextFunction } from "express";
import { uploadPaymentProofService } from "../services/payment-proof.service.js";
import { ApiError } from "../utils/api-error.js";

export const uploadPaymentProofController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const transactionId = req.params.transactionId;
    const userId = String(res.locals.user?.id ?? "");

    if (typeof transactionId !== "string" || !req.file) {
      throw new ApiError(
        "ID transaksi dan file bukti pembayaran wajib diisi",
        400,
      );
    }

    const result = await uploadPaymentProofService({
      transactionId,
      userId,
      fileBuffer: req.file.buffer,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
