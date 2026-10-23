
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";

interface CheckInParams {
  organizerId: bigint;
  transactionId: string;
}

export const getCheckInAttendeesService = async (
  organizerId: bigint,
  eventId: bigint,
) => {
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
    throw new ApiError("Event tidak ditemukan", 404);
  }

  const transactions = await prisma.eventTransaction.findMany({
    where: {
      eventId,
      status: "DONE",
      user: {
        deletedAt: null,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      checkedInAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        select: {
          quantity: true,
          ticket: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return {
    event: {
      ...event,
      id: event.id.toString(),
    },
    data: transactions.map((transaction) => ({
      transactionId: transaction.id.toString(),
      userId: transaction.user.id.toString(),
      name: transaction.user.name,
      email: transaction.user.email,
      ticketQuantity: transaction.items.reduce(
        (total, item) => total + item.quantity,
        0,
      ),
       ticketDetails: transaction.items.map((item) => ({
        name: item.ticket.name,
        quantity: item.quantity,
      })),
      status: transaction.checkedInAt
        ? "CHECKED_IN"
        : "NOT_CHECKED_IN",
      checkedInAt: transaction.checkedInAt?.toISOString() ?? null,
    })),
    meta: {
      totalTransactions: transactions.length,
      checkedInCount: transactions.filter(
        (transaction) => transaction.checkedInAt !== null,
      ).length,
      notCheckedInCount: transactions.filter(
        (transaction) => transaction.checkedInAt === null,
      ).length,
    },
  };
};

export const checkInTransactionService = async ({
  organizerId,
  transactionId,
}: CheckInParams) => {
  if (!/^[1-9]\d*$/.test(transactionId)) {
    throw new ApiError("ID transaksi tidak valid", 400);
  }

  const id = BigInt(transactionId);

  return prisma.$transaction(async (tx) => {
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
        status: true,
        checkedInAt: true,
        event: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new ApiError("Transaksi tidak ditemukan", 404);
    }

    if (transaction.status !== "DONE") {
      throw new ApiError(
        "Transaksi belum memenuhi syarat untuk check-in",
        400,
      );
    }

    if (transaction.checkedInAt) {
      throw new ApiError("Transaksi sudah di-check-in", 409);
    }

    const checkedInAt = new Date();

    const updated = await tx.eventTransaction.updateMany({
      where: {
        id,
        status: "DONE",
        checkedInAt: null,
        event: {
          organizerId,
          deletedAt: null,
        },
      },
      data: {
        checkedInAt,
      },
    });

    if (updated.count !== 1) {
      throw new ApiError(
        "Check-in gagal atau transaksi sudah diproses",
        409,
      );
    }

    return {
      transactionId: transaction.id.toString(),
      eventName: transaction.event.name,
      attendeeName: transaction.user.name,
      status: "CHECKED_IN",
      checkedInAt: checkedInAt.toISOString(),
    };
  });
};
