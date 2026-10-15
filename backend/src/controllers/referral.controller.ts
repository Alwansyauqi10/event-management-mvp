import { Request, Response } from "express";
import {
  pointHistoryService,
  pointService,
} from "../services/referral.service.js";

export const pointController = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;

  const result = await pointService(userId);

  res.status(200).json(result);
};
export const pointHistoryController = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;

  const history = await pointHistoryService(userId);

  res.status(200).json({
    message: "Riwayat poin berhasil diakses",
    history,
  });
};
