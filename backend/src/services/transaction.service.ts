
import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { CHECKOUT_CONFIG } from "../config/checkout.config.js";

type CreateTransactionInput = {
  eventId: string;
  tickets: {
    ticketId: string;
    quantity: number;
  }[];
};

export const createTransactionService = async (
  userId: string,
  input: CreateTransactionInput,
) => {
  if (!input.eventId || !Array.isArray(input.tickets) || input.tickets.length === 0) {
    throw new ApiError("Event dan tiket wajib dipilih", 400);
  }

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

  const totalQuantity = tickets.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQuantity > CHECKOUT_CONFIG.MAX_TICKETS_PER_TRANSACTION) {
    throw new ApiError("Jumlah tiket melebihi batas transaksi", 400);
  }

  if (!/^\d+$/.test(input.eventId) || !/^\d+$/.test(userId)) {
    throw new ApiError("ID event atau pengguna tidak valid", 400);
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
        pointDiscount: 0n,
        voucherDiscount: 0n,
        couponDiscount: 0n,
        totalAmount: subTotal,
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
        paymentProofDeadline: transaction.paymentProofDeadline?.toISOString(),
      },
    };
  });
};
