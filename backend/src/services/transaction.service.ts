
import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { CHECKOUT_CONFIG } from "../config/checkout.config.js";
import {
  Prisma,
  PointTransactionType,
} from "../generated/prisma/client.js";

type CreateTransactionInput = {
  eventId: string;
  tickets: {
    ticketId: string;
    quantity: number;
  }[];
  pointsToUse?: string | number;
};

const POINT_REFERENCE_TYPE = "EVENT_TRANSACTION";
const POINT_REFUND_REFERENCE_TYPE = "EVENT_TRANSACTION_REFUND";

const parsePointsToUse = (value: string | number | undefined): bigint => {
  const rawValue = value ?? "0";

  if (
    (typeof rawValue === "number" && !Number.isSafeInteger(rawValue)) ||
    !/^\d+$/.test(String(rawValue))
  ) {
    throw new ApiError("Jumlah poin tidak valid", 400);
  }

  return BigInt(rawValue);
};

const deductPoints = async (
  tx: Prisma.TransactionClient,
  userId: bigint,
  transactionId: bigint,
  pointsToUse: bigint,
): Promise<void> => {
  if (pointsToUse === 0n) return;

  const now = new Date();

  const pointLots = await tx.pointTransaction.findMany({
    where: {
      userId,
      type: {
        in: [
          PointTransactionType.CREDIT,
          PointTransactionType.REFERRAL,
          PointTransactionType.REFUND,
        ],
      },
      remainingAmount: { gt: 0n },
      OR: [{ expiredAt: null }, { expiredAt: { gt: now } }],
    },
    orderBy: { createdAt: "asc" },
  });

  // Poin dengan tanggal kedaluwarsa terdekat dipakai terlebih dahulu.
  pointLots.sort((a, b) => {
    if (a.expiredAt === null && b.expiredAt === null) {
      return a.createdAt.getTime() - b.createdAt.getTime();
    }
    if (a.expiredAt === null) return 1;
    if (b.expiredAt === null) return -1;

    return (
      a.expiredAt.getTime() - b.expiredAt.getTime() ||
      a.createdAt.getTime() - b.createdAt.getTime()
    );
  });

  const availablePoints = pointLots.reduce(
    (total, lot) => total + lot.remainingAmount,
    0n,
  );

  if (availablePoints < pointsToUse) {
    throw new ApiError("Saldo poin tidak mencukupi", 400);
  }

  let remainingToDeduct = pointsToUse;

  for (const lot of pointLots) {
    if (remainingToDeduct === 0n) break;

    const deduction =
      lot.remainingAmount < remainingToDeduct
        ? lot.remainingAmount
        : remainingToDeduct;

    // Conditional update mencegah saldo yang sama dipakai dua checkout.
    const updated = await tx.pointTransaction.updateMany({
      where: {
        id: lot.id,
        userId,
        remainingAmount: lot.remainingAmount,
      },
      data: {
        remainingAmount: { decrement: deduction },
      },
    });

    if (updated.count !== 1) {
      throw new ApiError(
        "Saldo poin berubah. Silakan ulangi checkout",
        409,
      );
    }

    // Simpan debit per lot supaya refund bisa mempertahankan expiredAt.
    await tx.pointTransaction.create({
      data: {
        userId,
        type: PointTransactionType.DEBIT,
        amount: deduction,
        remainingAmount: 0n,
        referenceType: POINT_REFERENCE_TYPE,
        referenceId: transactionId,
        expiredAt: lot.expiredAt,
      },
    });

    remainingToDeduct -= deduction;
  }

  if (remainingToDeduct !== 0n) {
    throw new ApiError("Saldo poin tidak berhasil diproses", 409);
  }
};

export const createTransactionService = async (
  userId: string,
  input: CreateTransactionInput,
) => {
  if (
    !input.eventId ||
    !Array.isArray(input.tickets) ||
    input.tickets.length === 0
  ) {
    throw new ApiError("Event dan tiket wajib dipilih", 400);
  }

  if (!/^\d+$/.test(input.eventId) || !/^\d+$/.test(userId)) {
    throw new ApiError("ID event atau pengguna tidak valid", 400);
  }

  const pointsToUse = parsePointsToUse(input.pointsToUse);

  const quantities = new Map<string, number>();

  for (const item of input.tickets) {
    if (
      typeof item.ticketId !== "string" ||
      !/^\d+$/.test(item.ticketId) ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1
    ) {
      throw new ApiError("Data tiket atau kuantitas tidak valid", 400);
    }

    quantities.set(
      item.ticketId,
      (quantities.get(item.ticketId) ?? 0) + item.quantity,
    );
  }

  const tickets = [...quantities.entries()].map(([ticketId, quantity]) => ({
    ticketId,
    quantity,
  }));

  const totalQuantity = tickets.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  if (totalQuantity > CHECKOUT_CONFIG.MAX_TICKETS_PER_TRANSACTION) {
    throw new ApiError("Jumlah tiket melebihi batas transaksi", 400);
  }

  const eventId = BigInt(input.eventId);
  const customerId = BigInt(userId);
  const now = new Date();
  const paymentDeadline = new Date(
    now.getTime() + CHECKOUT_CONFIG.PAYMENT_EXPIRY_MINUTES * 60 * 1000,
  );

  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findFirst({
      where: {
        id: eventId,
        status: "PUBLISHED",
        deletedAt: null,
        startDate: { gt: now },
      },
      select: {
        id: true,
        name: true,
        availableSeats: true,
      },
    });

    if (!event) {
      throw new ApiError("Event tidak tersedia untuk dibeli", 404);
    }

    const customer = await tx.user.findFirst({
      where: {
        id: customerId,
        role: "CUSTOMER",
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!customer) {
      throw new ApiError("Akun customer tidak ditemukan", 404);
    }

    const ticketIds = tickets.map((item) => BigInt(item.ticketId));

    const databaseTickets = await tx.ticket.findMany({
      where: {
        id: { in: ticketIds },
        eventId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        price: true,
        availableQuantity: true,
      },
    });

    if (databaseTickets.length !== tickets.length) {
      throw new ApiError("Ada tiket yang tidak valid untuk event ini", 400);
    }

    const ticketById = new Map(
      databaseTickets.map((ticket) => [ticket.id.toString(), ticket]),
    );

    let subTotal = 0n;

    const items = tickets.map((item) => {
      const ticket = ticketById.get(item.ticketId);

      if (!ticket || ticket.availableQuantity < item.quantity) {
        throw new ApiError(
          `Stok tiket ${ticket?.name ?? item.ticketId} tidak mencukupi`,
          400,
        );
      }

      const itemSubtotal = ticket.price * BigInt(item.quantity);
      subTotal += itemSubtotal;

      return {
        ticketId: ticket.id,
        price: ticket.price,
        quantity: item.quantity,
        subTotal: itemSubtotal,
      };
    });

    if (event.availableSeats < totalQuantity) {
      throw new ApiError("Sisa kursi event tidak mencukupi", 400);
    }

    const pointValue = BigInt(CHECKOUT_CONFIG.POINT_VALUE_IN_RUPIAH);
    const pointDiscount = pointsToUse * pointValue;

    if (pointDiscount > subTotal) {
      throw new ApiError("Diskon poin melebihi subtotal", 400);
    }

    // Batasi diskon total sesuai konfigurasi.
    const maxDiscount =
      (subTotal * BigInt(CHECKOUT_CONFIG.MAX_TOTAL_DISCOUNT_PERCENT)) / 100n;

    if (pointDiscount > maxDiscount) {
      throw new ApiError("Diskon poin melebihi batas maksimum", 400);
    }

    const totalAmount = subTotal - pointDiscount;

    // Cadangkan stok tiket secara kondisional agar tidak overselling.
    for (const item of tickets) {
      const reserved = await tx.ticket.updateMany({
        where: {
          id: BigInt(item.ticketId),
          eventId,
          deletedAt: null,
          availableQuantity: { gte: item.quantity },
        },
        data: {
          availableQuantity: { decrement: item.quantity },
        },
      });

      if (reserved.count !== 1) {
        throw new ApiError(
          "Stok tiket berubah. Silakan ulangi checkout",
          409,
        );
      }
    }

    const reservedSeats = await tx.event.updateMany({
      where: {
        id: eventId,
        availableSeats: { gte: totalQuantity },
        status: "PUBLISHED",
        deletedAt: null,
      },
      data: {
        availableSeats: { decrement: totalQuantity },
      },
    });

    if (reservedSeats.count !== 1) {
      throw new ApiError(
        "Sisa kursi event berubah. Silakan ulangi checkout",
        409,
      );
    }

    const transaction = await tx.eventTransaction.create({
      data: {
        transactionCode: `TRX-${randomUUID()}`,
        userId: customerId,
        eventId,
        status: "WAITING_FOR_PAYMENT",
        subTotal,
        pointDiscount,
        voucherDiscount: 0n,
        couponDiscount: 0n,
        totalAmount,
        paymentProofDeadline: paymentDeadline,
        items: {
          create: items,
        },
      },
      include: {
        event: {
          select: { id: true, name: true },
        },
        items: {
          include: {
            ticket: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    // Potong poin di transaksi DB yang sama. Jika gagal, checkout rollback.
    await deductPoints(tx, customerId, transaction.id, pointsToUse);

    return {
      message: "Transaksi berhasil dibuat",
      transaction: {
        id: transaction.id.toString(),
        transactionCode: transaction.transactionCode,
        status: transaction.status,
        event: {
          id: transaction.event.id.toString(),
          name: transaction.event.name,
        },
        items: transaction.items.map((item) => ({
          ticketId: item.ticketId.toString(),
          ticketName: item.ticket.name,
          price: item.price.toString(),
          quantity: item.quantity,
          subTotal: item.subTotal.toString(),
        })),
        subTotal: transaction.subTotal.toString(),
        pointDiscount: transaction.pointDiscount.toString(),
        voucherDiscount: transaction.voucherDiscount.toString(),
        couponDiscount: transaction.couponDiscount.toString(),
        totalAmount: transaction.totalAmount.toString(),
        paymentProofDeadline:
          transaction.paymentProofDeadline?.toISOString() ?? null,
      },
    };
  });
};

export const getCustomerTransactionStatusService = async ({
  userId,
  transactionId,
}: {
  userId: string;
  transactionId: string;
}) => {
  if (!/^[1-9]\d*$/.test(transactionId) || !/^[1-9]\d*$/.test(userId)) {
    throw new ApiError("ID transaksi tidak valid", 400);
  }

  const transaction = await prisma.eventTransaction.findFirst({
    where: {
      id: BigInt(transactionId),
      userId: BigInt(userId),
    },
    select: {
      id: true,
      transactionCode: true,
      status: true,
      paymentProofDeadline: true,
    },
  });

  if (!transaction) {
    throw new ApiError("Transaksi tidak ditemukan", 404);
  }

  return {
    ...transaction,
    id: transaction.id.toString(),
  };
};

export const getMyTransactionsService = async (userId: string) => {
  if (!/^[1-9]\d*$/.test(userId)) {
    throw new ApiError("ID pengguna tidak valid", 400);
  }

  const transactions = await prisma.eventTransaction.findMany({
    where: {
      userId: BigInt(userId),
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      transactionCode: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      paymentProofDeadline: true,
      checkedInAt: true,
      review: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
        },
      },
      event: {
        select: {
          id: true,
          name: true,
          startDate: true,
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
    },
  });

  return transactions.map((transaction) => ({
    ...transaction,
    id: transaction.id.toString(),
    totalAmount: transaction.totalAmount.toString(),
    checkedInAt: transaction.checkedInAt?.toISOString() ?? null,
    review: transaction.review
      ? {
          ...transaction.review,
          id: transaction.review.id.toString(),
        }
      : null,
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
  }));
};
