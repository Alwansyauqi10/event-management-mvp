
import type { Request, Response } from "express";
import {
  checkInTransactionService,
  getCheckInAttendeesService,
} from "../services/checkIn.service.js";

export const getCheckInAttendeesController = async (
  req: Request,
  res: Response,
) => {
  const organizerId = res.locals.user?.id;
  const eventId = req.params.eventId;

  if (!organizerId) {
    res.status(401).json({
      message: "Silakan login terlebih dahulu",
    });
    return;
  }

  if (
    typeof eventId !== "string" ||
    !/^[1-9]\d*$/.test(eventId)
  ) {
    res.status(400).json({
      message: "ID event tidak valid",
    });
    return;
  }

  const result = await getCheckInAttendeesService(
    BigInt(organizerId),
    BigInt(eventId),
  );

  res.status(200).json({
    message: "Daftar peserta check-in berhasil diambil",
    data: result,
  });
};

export const checkInTransactionController = async (
  req: Request,
  res: Response,
) => {
  const organizerId = res.locals.user?.id;
  const transactionId = req.params.transactionId;

  if (!organizerId) {
    res.status(401).json({
      message: "Silakan login terlebih dahulu",
    });
    return;
  }

  if (
    typeof transactionId !== "string" ||
    !/^[1-9]\d*$/.test(transactionId)
  ) {
    res.status(400).json({
      message: "ID transaksi tidak valid",
    });
    return;
  }

  const result = await checkInTransactionService({
    organizerId: BigInt(organizerId),
    transactionId,
  });

  res.status(200).json({
    message: "Peserta berhasil di-check-in",
    data: result,
  });
};
