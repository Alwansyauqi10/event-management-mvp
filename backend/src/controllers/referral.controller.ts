import { Request, Response } from "express";
import { pointService } from "../services/referral.service.js";

export const pointController = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;

  const result = await pointService(userId);

  res.status(200).json(result);
};
