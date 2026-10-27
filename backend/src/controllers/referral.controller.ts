import { Request, Response } from "express";
import { getMyCouponsService } from "../services/coupon.service.js";
import {
  pointHistoryService,
  pointService,
} from "../services/referral.service.js";
import { getMyCouponsService } from "../services/coupon.service.js";

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

export const userCouponsController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user?.id;

    if (!userId) {
      res.status(401).json({
        message: "Silakan login terlebih dahulu",
      });
      return;
    }

    const coupons = await getUserCouponsService(userId.toString());

    res.status(200).json({
      message: "Kupon berhasil diakses",
      coupons,
    });
  } catch (error) {
    console.error("Gagal mengambil kupon:", error);

    res.status(500).json({
      message: "Gagal mengambil kupon",
    });
  }
};

export const myCouponsController = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;

  const coupons = await getMyCouponsService(userId);

  res.status(200).json(coupons);
};
