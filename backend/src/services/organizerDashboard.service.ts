import { TransactionStatus } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";

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

type GetOrganizerTransactionsParams = {
  userId: string;
  status?: TransactionStatus;
  page: number;
  limit: number;
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
