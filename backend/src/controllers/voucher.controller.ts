
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  createVoucherService,
  getEventVouchersService,
  updateVoucherService,
  deactivateVoucherService,
  VoucherServiceError,
} from "../services/voucher.service.js";

const serializeBigInt = <T,>(value: T): T =>
  JSON.parse(
    JSON.stringify(value, (_key, item) =>
      typeof item === "bigint" ? item.toString() : item,
    ),
  ) as T;

const getOrganizerId = (res: Response): string | null => {
  const user: unknown = res.locals.user;

  if (!user || typeof user !== "object" || !("id" in user)) {
    return null;
  }

  const id = user.id;

  if (
    typeof id !== "string" &&
    typeof id !== "number" &&
    typeof id !== "bigint"
  ) {
    return null;
  }

  const organizerId = String(id);
  return /^[1-9]\d*$/.test(organizerId) ? organizerId : null;
};

const handleError = (
  error: unknown,
  res: Response,
  next: NextFunction,
) => {
  if (error instanceof VoucherServiceError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  if (error instanceof z.ZodError) {
    return res.status(400).json({
      message: "Data voucher tidak valid",
      errors: error.issues,
    });
  }

  return next(error);
};

export const createVoucherController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organizerId = getOrganizerId(res);

    if (!organizerId) {
      return res.status(401).json({
        message: "Identitas organizer tidak ditemukan",
      });
    }

    const voucher = await createVoucherService(organizerId, req.body);

    return res.status(201).json({
      message: "Voucher berhasil dibuat",
      data: serializeBigInt(voucher),
    });
  } catch (error: unknown) {
    return handleError(error, res, next);
  }
};

export const getEventVouchersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organizerId = getOrganizerId(res);
    const eventId = req.params.eventId;

    if (!organizerId) {
      return res.status(401).json({
        message: "Identitas organizer tidak ditemukan",
      });
    }

    if (
      typeof eventId !== "string" ||
      !/^[1-9]\d*$/.test(eventId)
    ) {
      return res.status(400).json({
        message: "Event ID tidak valid",
      });
    }

    const vouchers = await getEventVouchersService(
      organizerId,
      eventId,
    );

    return res.status(200).json({
      message: "Berhasil mengambil voucher event",
      data: serializeBigInt(vouchers),
    });
  } catch (error: unknown) {
    return handleError(error, res, next);
  }
};

export const updateVoucherController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organizerId = getOrganizerId(res);
    const voucherId = req.params.voucherId;

    if (!organizerId) {
      return res.status(401).json({
        message: "Identitas organizer tidak ditemukan",
      });
    }

    if (
      typeof voucherId !== "string" ||
      !/^[1-9]\d*$/.test(voucherId)
    ) {
      return res.status(400).json({
        message: "Voucher ID tidak valid",
      });
    }

    const voucher = await updateVoucherService(
      organizerId,
      voucherId,
      req.body,
    );

    return res.status(200).json({
      message: "Voucher berhasil diperbarui",
      data: serializeBigInt(voucher),
    });
  } catch (error: unknown) {
    return handleError(error, res, next);
  }
};

export const deactivateVoucherController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organizerId = getOrganizerId(res);
    const voucherId = req.params.voucherId;

    if (!organizerId) {
      return res.status(401).json({
        message: "Identitas organizer tidak ditemukan",
      });
    }

    if (
      typeof voucherId !== "string" ||
      !/^[1-9]\d*$/.test(voucherId)
    ) {
      return res.status(400).json({
        message: "Voucher ID tidak valid",
      });
    }

    const voucher = await deactivateVoucherService(
      organizerId,
      voucherId,
    );

    return res.status(200).json({
      message: "Voucher berhasil dinonaktifkan",
      data: serializeBigInt(voucher),
    });
  } catch (error: unknown) {
    return handleError(error, res, next);
  }
};
