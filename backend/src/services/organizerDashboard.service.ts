import { prisma } from "../lib/prisma.js";
import {
  AcceptTransactionParams,
  GetOrganizerTransactionDetailParams,
  GetOrganizerTransactionsParams,
  RejectTransactionParams,
} from "../types/organizerDashboard.js";
import { ApiError } from "../utils/api-error.js";
import { sendTransactionStatusEmail } from "../utils/transaction-email.js";

export const organizerDashboardService = async (userId: string) => {
  const organizerId = BigInt(userId);

  const eventWhere = {
    organizerId,
    deletedAt: null,
  };

  const transactionWhere = {
    event: {
      organizerId,
      deletedAt: null,
    },
  };

  const [totalEvents, eventStatuses, transactionStatuses, recentEvents] =
    await Promise.all([
      // Total event milik organizer
      prisma.event.count({
        where: eventWhere,
      }),

      // Jumlah event per status
      prisma.event.groupBy({
        by: ["status"],
        where: eventWhere,
        _count: {
          _all: true,
        },
      }),

      // Jumlah transaksi untuk semua event milik organizer
      prisma.eventTransaction.groupBy({
        by: ["status"],
        where: transactionWhere,
        _count: {
          _all: true,
        },
      }),

      // Lima event terbaru milik organizer
      prisma.event.findMany({
        where: eventWhere,
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          name: true,
          location: true,
          startDate: true,
          status: true,
          category: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              eventTransactions: true,
            },
          },
        },
      }),
    ]);

  const eventsByStatus = Object.fromEntries(
    eventStatuses.map((item) => [item.status, item._count._all]),
  );

  const transactionsByStatus = Object.fromEntries(
    transactionStatuses.map((item) => [item.status, item._count._all]),
  );

  return {
    summary: {
      totalEvents,
      eventsByStatus,
      transactionsByStatus,
    },
    recentEvents: recentEvents.map((event) => ({
      ...event,
      id: event.id.toString(),
      totalTransactions: event._count.eventTransactions,
      _count: undefined,
    })),
  };
};

export const getOrganizerTransactionsService = async ({
  userId,
  status,
  page,
  limit,
}: GetOrganizerTransactionsParams) => {
  const organizerId = BigInt(userId);

  const where = {
    event: {
      organizerId,
      deletedAt: null,
    },
    ...(status ? { status } : {}),
  };

  const [transactions, total] = await Promise.all([
    prisma.eventTransaction.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        transactionCode: true,
        status: true,
        subTotal: true,
        pointDiscount: true,
        voucherDiscount: true,
        couponDiscount: true,
        totalAmount: true,
        createdAt: true,
        paymentProofDeadline: true,
        adminConfirmationDeadline: true,

        user: {
          select: {
            name: true,
            email: true,
          },
        },

        event: {
          select: {
            id: true,
            name: true,
            startDate: true,
          },
        },

        items: {
          select: {
            ticketId: true,
            price: true,
            quantity: true,
            subTotal: true,
            ticket: {
              select: {
                name: true,
              },
            },
          },
        },

        paymentProof: {
          select: {
            fileUrl: true,
            uploadedAt: true,
          },
        },
      },
    }),

    prisma.eventTransaction.count({
      where,
    }),
  ]);

  return {
    transactions: transactions.map((transaction) => ({
      ...transaction,
      id: transaction.id.toString(),
      subTotal: transaction.subTotal.toString(),
      pointDiscount: transaction.pointDiscount.toString(),
      voucherDiscount: transaction.voucherDiscount.toString(),
      couponDiscount: transaction.couponDiscount.toString(),
      totalAmount: transaction.totalAmount.toString(),

      event: {
        ...transaction.event,
        id: transaction.event.id.toString(),
      },

      items: transaction.items.map((item) => ({
        ...item,
        ticketId: item.ticketId.toString(),
        price: item.price.toString(),
        subTotal: item.subTotal.toString(),
      })),
    })),

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getOrganizerTransactionDetailService = async ({
  userId,
  transactionId,
}: GetOrganizerTransactionDetailParams) => {
  if (!/^[1-9]\d*$/.test(transactionId)) {
    throw new ApiError("ID transaksi tidak valid", 400);
  }

  const organizerId = BigInt(userId);
  const id = BigInt(transactionId);

  const transaction = await prisma.eventTransaction.findFirst({
    where: {
      id,
      event: {
        organizerId,
        deletedAt: null,
      },
    },
    select: {
      id: true,
      transactionCode: true,
      status: true,
      subTotal: true,
      pointDiscount: true,
      voucherDiscount: true,
      couponDiscount: true,
      totalAmount: true,
      createdAt: true,
      paymentProofDeadline: true,
      adminConfirmationDeadline: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      event: {
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          location: true,
        },
      },
      items: {
        select: {
          ticketId: true,
          price: true,
          quantity: true,
          subTotal: true,
          ticket: {
            select: {
              name: true,
            },
          },
        },
      },
      paymentProof: {
        select: {
          fileUrl: true,
          uploadedAt: true,
        },
      },
    },
  });

  if (!transaction) {
    throw new ApiError("Transaksi tidak ditemukan", 404);
  }

  return {
    ...transaction,
    id: transaction.id.toString(),
    subTotal: transaction.subTotal.toString(),
    pointDiscount: transaction.pointDiscount.toString(),
    voucherDiscount: transaction.voucherDiscount.toString(),
    couponDiscount: transaction.couponDiscount.toString(),
    totalAmount: transaction.totalAmount.toString(),
    event: {
      ...transaction.event,
      id: transaction.event.id.toString(),
    },
    items: transaction.items.map((item) => ({
      ...item,
      ticketId: item.ticketId.toString(),
      price: item.price.toString(),
      subTotal: item.subTotal.toString(),
    })),
  };
};

export const acceptOrganizerTransactionService = async ({
  userId,
  transactionId,
}: AcceptTransactionParams) => {
  if (!/^[1-9]\d*$/.test(transactionId)) {
    throw new ApiError("ID transaksi tidak valid", 400);
  }

  const organizerId = BigInt(userId);
  const id = BigInt(transactionId);

  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.eventTransaction.findFirst({
      where: {
        id,
        event: {
          organizerId,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        userId: true,
        transactionCode: true,
        status: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new ApiError("Transaksi tidak ditemukan", 404);
    }

    if (transaction.status !== "WAITING_FOR_ADMIN_CONFIRMATION") {
      throw new ApiError(
        "Transaksi tidak dapat diterima karena statusnya bukan menunggu konfirmasi",
        400,
      );
    }

    const updatedTransaction = await tx.eventTransaction.updateMany({
      where: {
        id,
        status: "WAITING_FOR_ADMIN_CONFIRMATION",
        event: {
          organizerId,
          deletedAt: null,
        },
      },
      data: {
        status: "DONE",
      },
    });

    if (updatedTransaction.count !== 1) {
      throw new ApiError(
        "Status transaksi sudah berubah. Silakan muat ulang data",
        409,
      );
    }

    await tx.notification.create({
      data: {
        userId: transaction.userId,
        transactionId: transaction.id,
        type: "TRANSACTION_ACCEPTED",
        title: "Transaksi Diterima",
        message: `Transaksi ${transaction.transactionCode} untuk acara ${transaction.event.name} telah diterima.`,
      },
    });

    return {
      id: transaction.id.toString(),
      status: "DONE" as const,
      email: transaction.user.email,
      customerName: transaction.user.name,
      eventName: transaction.event.name,
      transactionCode: transaction.transactionCode,
    };
  });

  try {
    await sendTransactionStatusEmail({
      to: result.email,
      customerName: result.customerName,
      eventName: result.eventName,
      transactionCode: result.transactionCode,
      status: result.status,
    });
  } catch (error) {
    console.error("Gagal mengirim email transaksi diterima:", error);
  }

  return {
    id: result.id,
    status: result.status,
  };
};


export const rejectOrganizerTransactionService = async ({
  userId,
  transactionId,
}: RejectTransactionParams) => {
  if (!/^[1-9]\d*$/.test(transactionId)) {
    throw new ApiError("ID transaksi tidak valid", 400);
  }

  const organizerId = BigInt(userId);
  const id = BigInt(transactionId);

  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.eventTransaction.findFirst({
      where: {
        id,
        event: {
          organizerId,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        userId: true,
        eventId: true,
        transactionCode: true,
        status: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new ApiError("Transaksi tidak ditemukan", 404);
    }

    if (transaction.status !== "WAITING_FOR_ADMIN_CONFIRMATION") {
      throw new ApiError(
        "Transaksi tidak dapat ditolak karena statusnya bukan menunggu konfirmasi",
        400,
      );
    }

    // Ubah status secara kondisional untuk mencegah refund dan
    // pemulihan stok dilakukan dua kali.
    const updatedTransaction = await tx.eventTransaction.updateMany({
      where: {
        id,
        status: "WAITING_FOR_ADMIN_CONFIRMATION",
        event: {
          organizerId,
          deletedAt: null,
        },
      },
      data: {
        status: "REJECTED",
      },
    });

    if (updatedTransaction.count !== 1) {
      throw new ApiError(
        "Status transaksi sudah berubah. Silakan muat ulang data",
        409,
      );
    }

    // 1. Pulihkan stok tiket.
    const items = await tx.transactionItem.findMany({
      where: {
        transactionId: transaction.id,
      },
      select: {
        ticketId: true,
        quantity: true,
      },
    });

    const totalQuantity = items.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    for (const item of items) {
      await tx.ticket.update({
        where: {
          id: item.ticketId,
        },
        data: {
          availableQuantity: {
            increment: item.quantity,
          },
        },
      });
    }

    // 2. Pulihkan kuota kursi event.
    if (totalQuantity > 0) {
      await tx.event.update({
        where: {
          id: transaction.eventId,
        },
        data: {
          availableSeats: {
            increment: totalQuantity,
          },
        },
      });
    }

    // 3. Kembalikan poin yang sebelumnya digunakan.
    const pointDebits = await tx.pointTransaction.findMany({
      where: {
        userId: transaction.userId,
        type: "DEBIT",
        referenceType: "EVENT_TRANSACTION",
        referenceId: transaction.id,
      },
      select: {
        amount: true,
        expiredAt: true,
      },
    });

    // Cek apakah refund poin untuk transaksi ini sudah pernah dibuat.
    const existingRefund = await tx.pointTransaction.findFirst({
      where: {
        userId: transaction.userId,
        type: "REFUND",
        referenceType: "EVENT_TRANSACTION_REFUND",
        referenceId: transaction.id,
      },
      select: {
        id: true,
      },
    });

    if (!existingRefund) {
      for (const debit of pointDebits) {
        await tx.pointTransaction.create({
          data: {
            userId: transaction.userId,
            type: "REFUND",
            amount: debit.amount,
            remainingAmount: debit.amount,
            referenceType: "EVENT_TRANSACTION_REFUND",
            referenceId: transaction.id,
            expiredAt: debit.expiredAt,
          },
        });
      }
    }

    // 4. Buat notifikasi untuk customer.
    await tx.notification.create({
      data: {
        userId: transaction.userId,
        transactionId: transaction.id,
        type: "TRANSACTION_REJECTED",
        title: "Transaksi Ditolak",
        message: `Transaksi ${transaction.transactionCode} untuk acara ${transaction.event.name} telah ditolak.`,
      },
    });

    return {
      id: transaction.id.toString(),
      status: "REJECTED" as const,
      email: transaction.user.email,
      customerName: transaction.user.name,
      eventName: transaction.event.name,
      transactionCode: transaction.transactionCode,
    };
  });

  // Email dikirim setelah transaksi database berhasil.
  try {
    await sendTransactionStatusEmail({
      to: result.email,
      customerName: result.customerName,
      eventName: result.eventName,
      transactionCode: result.transactionCode,
      status: result.status,
    });
  } catch (error) {
    console.error("Gagal mengirim email transaksi ditolak:", error);
  }

  return {
    id: result.id,
    status: result.status,
  };
};


export const getOrganizerEventsService = async (
  organizerId: bigint,
  page: number,
  limit: number,
) => {
  const where = {
    organizerId,
    deletedAt: null,
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: {
            eventTransactions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    }),

    prisma.event.count({ where }),
  ]);

  return {
    events,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getOrganizerEventAttendeesService = async (
  organizerId: bigint,
  eventId: bigint,
  page = 1,
  limit = 10,
) => {
  // Pastikan halaman dan limit valid.
  const currentPage = Math.max(1, Math.floor(page) || 1);
  const pageSize = Math.min(50, Math.max(1, Math.floor(limit) || 10));

  // Pastikan event memang milik organizer yang login.
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      organizerId,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
    },
  });

  if (!event) {
    return null;
  }

  // Ambil seluruh transaksi DONE untuk menghitung statistik
  // dan menggabungkan transaksi dari customer yang sama.
  const transactions = await prisma.eventTransaction.findMany({
    where: {
      eventId,
      status: "DONE",
      user: {
        deletedAt: null,
      },
    },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      totalAmount: true,
      items: {
        select: {
          quantity: true,
        },
      },
    },
  });

  const attendeesMap = new Map<
    string,
    {
      userId: string;
      name: string;
      email: string;
      ticketQuantity: number;
      totalPaid: bigint;
    }
  >();

  for (const transaction of transactions) {
    const userId = transaction.user.id.toString();
    const existing = attendeesMap.get(userId);

    const ticketQuantity = transaction.items.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    if (existing) {
      existing.ticketQuantity += ticketQuantity;
      existing.totalPaid += transaction.totalAmount;
    } else {
      attendeesMap.set(userId, {
        userId,
        name: transaction.user.name,
        email: transaction.user.email,
        ticketQuantity,
        totalPaid: transaction.totalAmount,
      });
    }
  }

  // Susun peserta secara konsisten sebelum pagination.
  const allAttendees = Array.from(attendeesMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "id"),
  );

  const totalAttendees = allAttendees.length;
  const totalPages = Math.ceil(totalAttendees / pageSize);
  const skip = (currentPage - 1) * pageSize;

  // Pagination hanya diterapkan pada daftar yang ditampilkan.
  const paginatedAttendees = allAttendees
    .slice(skip, skip + pageSize)
    .map((attendee) => ({
      ...attendee,
      totalPaid: attendee.totalPaid.toString(),
    }));

  return {
    event: {
      ...event,
      id: event.id.toString(),
    },
    data: paginatedAttendees,
    meta: {
      totalAttendees,
      totalTickets: allAttendees.reduce(
        (total, attendee) => total + attendee.ticketQuantity,
        0,
      ),
      totalRevenue: allAttendees
        .reduce((total, attendee) => total + attendee.totalPaid, 0n)
        .toString(),
      page: currentPage,
      limit: pageSize,
      totalPages,
    },
  };
};

type StatisticsPeriod = "daily" | "monthly" | "yearly";

type OrganizerStatisticsParams = {
  period: StatisticsPeriod;
  year?: number;
  month?: number;
};

export const organizerDashboardStatisticsService = async (
  userId: string,
  params: OrganizerStatisticsParams,
) => {
  const organizerId = BigInt(userId);
  const now = new Date();

  const year = params.year ?? now.getUTCFullYear();
  const month = params.month ?? now.getUTCMonth() + 1;

  if (
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 9999 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    throw new Error("Tahun atau bulan tidak valid");
  }

  const where: {
    event: {
      organizerId: bigint;
      deletedAt: null;
    };
    createdAt?: {
      gte: Date;
      lt: Date;
    };
  } = {
    event: {
      organizerId,
      deletedAt: null,
    },
  };

  if (params.period === "daily") {
    where.createdAt = {
      gte: new Date(Date.UTC(year, month - 1, 1)),
      lt: new Date(Date.UTC(year, month, 1)),
    };
  } else if (params.period === "monthly") {
    where.createdAt = {
      gte: new Date(Date.UTC(year, 0, 1)),
      lt: new Date(Date.UTC(year + 1, 0, 1)),
    };
  }

  const transactions = await prisma.eventTransaction.findMany({
    where,
    select: {
      createdAt: true,
      status: true,
      totalAmount: true,
    },
  });

  const statistics = new Map<
    string,
    { transactions: number; revenue: bigint }
  >();

  const getKey = (date: Date) => {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");

    if (params.period === "daily") return `${y}-${m}-${d}`;
    if (params.period === "monthly") return `${y}-${m}`;
    return String(y);
  };

  for (const transaction of transactions) {
    const key = getKey(transaction.createdAt);
    const current = statistics.get(key) ?? {
      transactions: 0,
      revenue: 0n,
    };

    current.transactions += 1;

    if (transaction.status === "DONE") {
      current.revenue += transaction.totalAmount;
    }

    statistics.set(key, current);
  }

  // Siapkan seluruh hari dalam bulan yang dipilih.
  if (params.period === "daily") {
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      if (!statistics.has(key)) {
        statistics.set(key, { transactions: 0, revenue: 0n });
      }
    }
  }

  // Siapkan seluruh bulan dalam tahun yang dipilih.
  if (params.period === "monthly") {
    for (let m = 1; m <= 12; m++) {
      const key = `${year}-${String(m).padStart(2, "0")}`;

      if (!statistics.has(key)) {
        statistics.set(key, { transactions: 0, revenue: 0n });
      }
    }
  }

  const sortedStatistics = [...statistics.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return {
    period: params.period,
    year,
    ...(params.period === "daily" ? { month } : {}),
    data: sortedStatistics.map(([date, value]) => ({
      date,
      transactions: value.transactions,
      revenue: value.revenue.toString(),
    })),
  };
};
