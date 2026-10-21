
import type { Request, Response, NextFunction } from "express";
import { createTransactionService } from "../services/transaction.service.js";

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
