import type { Request, Response } from "express";
import {
  acceptOrganizerTransactionService,
  getOrganizerTransactionDetailService,
  getOrganizerTransactionsService,
  organizerDashboardService,
  rejectOrganizerTransactionService,
} from "../services/organizerDashboard.service.js";
import { organizerTransactionQuerySchema } from "../validator/organizer.validator.js";

export const organizerDashboardController = async (
  _req: Request,
  res: Response,
) => {
  const userId = res.locals.user.id as string;

  const result = await organizerDashboardService(userId);

  res.status(200).json({
    message: "Organizer dashboard berhasil diakses",
    data: result,
  });
};
export const getOrganizerTransactionsController = async (
  req: Request,
  res: Response,
) => {
  const parsedQuery = organizerTransactionQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    res.status(400).json({
      message: "Parameter query tidak valid",
      errors: parsedQuery.error.flatten(),
    });
    return;
  }

  const userId = res.locals.user.id as string;

  const result = await getOrganizerTransactionsService({
    userId,
    ...parsedQuery.data,
  });

  res.status(200).json({
    message: "Daftar transaksi organizer berhasil diambil",
    data: result,
  });
};

export const getOrganizerTransactionDetailController = async (
  req: Request,
  res: Response,
) => {
  const transactionId = String(req.params.transactionId);
  const userId = res.locals.user.id as string;

  const transaction = await getOrganizerTransactionDetailService({
    userId,
    transactionId,
  });

  res.status(200).json({
    message: "Detail transaksi berhasil diambil",
    data: transaction,
  });
};
export const acceptOrganizerTransactionController = async (
  req: Request,
  res: Response,
) => {
  // const transactionId = String(req.params.transactionId);
  // const userId = res.locals.user.id as string;

  const transaction = await acceptOrganizerTransactionService({
    userId: res.locals.user.id as string,
    transactionId: String(req.params.transactionId),
  });

  res.status(200).json({
    message: "Transaksi berhasil diterima",
    data: transaction,
  });
};
export const rejectOrganizerTransactionController = async (
  req: Request,
  res: Response,
) => {
  const result = await rejectOrganizerTransactionService({
    userId: res.locals.user.id,
    transactionId: String(req.params.transactionId),
  });

  res.status(200).send({
    message: "Transaksi berhasil ditolak",
    data: result,
  });
};
