import type { Request, Response } from "express";
import {
  acceptOrganizerTransactionService,
  getOrganizerEventAttendeesService,
  getOrganizerEventsService,
  getOrganizerTransactionDetailService,
  getOrganizerTransactionsService,
  organizerDashboardService,
  organizerDashboardStatisticsService,
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
export const getOrganizerEventsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const organizerId = res.locals.user?.id;

    if (!organizerId) {
      res.status(401).json({
        message: "Silakan login terlebih dahulu",
      });
      return;
    }

    const page =
      typeof req.query.page === "string" ? Number(req.query.page) : 1;

    const limit =
      typeof req.query.limit === "string" ? Number(req.query.limit) : 8;

    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      res.status(400).json({
        message: "Parameter page atau limit tidak valid",
      });
      return;
    }

    const result = await getOrganizerEventsService(
      BigInt(organizerId),
      page,
      limit,
    );

    const serializedEvents = result.events.map((event) => ({
      ...event,
      id: event.id.toString(),
      organizerId: event.organizerId.toString(),
      categoryId: event.categoryId.toString(),
      category: {
        ...event.category,
        id: event.category.id.toString(),
      },
      _count: {
        eventTransactions: event._count.eventTransactions,
      },
    }));

    res.status(200).json({
      data: serializedEvents,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error("Get organizer events error:", error);

    res.status(500).json({
      message: "Gagal mengambil event organizer",
    });
  }
};

export const getOrganizerEventAttendeesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const organizerId = res.locals.user?.id;
    const { eventId } = req.params;

    if (!organizerId) {
      res.status(401).json({
        message: "Silakan login terlebih dahulu",
      });
      return;
    }

    if (typeof eventId !== "string" || !/^[1-9]\d*$/.test(eventId)) {
      res.status(400).json({
        message: "ID event tidak valid",
      });
      return;
    }

    const result = await getOrganizerEventAttendeesService(
      BigInt(organizerId),
      BigInt(eventId),
    );

    if (!result) {
      res.status(404).json({
        message: "Event tidak ditemukan",
      });
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Get organizer event attendees error:", error);

    res.status(500).json({
      message: "Gagal mengambil daftar peserta event",
    });
  }
};
export const organizerDashboardStatisticsController = async (
  req: Request,
  res: Response,
) => {
  const userId = res.locals.user.id as string;

  const period = req.query.period;
  const yearParam = req.query.year;
  const monthParam = req.query.month;

  if (period !== "daily" && period !== "monthly" && period !== "yearly") {
    return res.status(400).json({
      message: "Period harus daily, monthly, atau yearly",
    });
  }

  const parseInteger = (value: unknown): number | undefined => {
    if (value === undefined) return undefined;
    if (typeof value !== "string" || !/^\d+$/.test(value)) {
      return Number.NaN;
    }

    return Number(value);
  };

  const year = parseInteger(yearParam);
  const month = parseInteger(monthParam);

  if (
    (year !== undefined &&
      (!Number.isInteger(year) || year < 2000 || year > 9999)) ||
    (month !== undefined &&
      (!Number.isInteger(month) || month < 1 || month > 12))
  ) {
    return res.status(400).json({
      message: "Parameter year atau month tidak valid",
    });
  }

  if (period === "daily" && month === undefined) {
    return res.status(400).json({
      message: "Parameter month wajib diisi untuk period daily",
    });
  }

  try {
    const result = await organizerDashboardStatisticsService(userId, {
      period,
      ...(year !== undefined ? { year } : {}),
      ...(month !== undefined ? { month } : {}),
    });

    return res.status(200).json({
      message: "Statistik organizer berhasil diambil",
      data: result,
    });
  } catch (error) {
    console.error("Organizer statistics error:", error);

    return res.status(500).json({
      message: "Gagal mengambil statistik organizer",
    });
  }
};
