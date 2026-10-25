
import type { Request, Response, NextFunction } from "express";
import { createTransactionService, getCustomerTransactionStatusService, getMyTransactionsService } from "../services/transaction.service.js";

export const createTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = String(res.locals.user?.id ?? "");

    const result = await createTransactionService(userId, req.body);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getCustomerTransactionStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = String(res.locals.user?.id ?? "");
    const transactionId = String(req.params.transactionId);

    const transaction = await getCustomerTransactionStatusService({
      userId,
      transactionId,
    });

    res.status(200).json({
      message: "Status transaksi berhasil diambil",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyTransactionsController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = String(res.locals.user?.id ?? "");

    const transactions = await getMyTransactionsService(userId);

    res.status(200).json({
      message: "Riwayat transaksi berhasil diambil",
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};
