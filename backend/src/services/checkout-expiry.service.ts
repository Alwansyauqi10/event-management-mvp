
import cron from "node-cron";
import { prisma } from "../lib/prisma.js";
import {
  Prisma,
  PointTransactionType,
} from "../generated/prisma/client.js";

const POINT_REFERENCE_TYPE = "EVENT_TRANSACTION";
const POINT_REFUND_REFERENCE_TYPE = "EVENT_TRANSACTION_REFUND";

const refundPointsForTransaction = async (
  tx: Prisma.TransactionClient,
  transactionId: bigint,
  userId: bigint,
): Promise<void> => {
  const existingRefund = await tx.pointTransaction.findFirst({
    where: {
      userId,
      type: PointTransactionType.REFUND,
      referenceType: POINT_REFUND_REFERENCE_TYPE,
      referenceId: transactionId,
    },
    select: { id: true },
  });

  // Mencegah refund ganda jika transaksi sudah pernah dikembalikan.
  if (existingRefund) return;

  const debits = await tx.pointTransaction.findMany({
    where: {
      userId,
      type: PointTransactionType.DEBIT,
      referenceType: POINT_REFERENCE_TYPE,
      referenceId: transactionId,
    },
  });

  for (const debit of debits) {
    await tx.pointTransaction.create({
      data: {
        userId,
        type: PointTransactionType.REFUND,
        amount: debit.amount,
        remainingAmount: debit.amount,
        referenceType: POINT_REFUND_REFERENCE_TYPE,
        referenceId: transactionId,
        expiredAt: debit.expiredAt,
      },
    });
  }
};

export async function expireUnpaidTransactions(): Promise<void> {
  const now = new Date();

  const expiredTransactions = await prisma.eventTransaction.findMany({
    where: {
      status: "WAITING_FOR_PAYMENT",
      paymentProofDeadline: {
        lte: now,
      },
    },
    select: {
      id: true,
      userId: true,
      eventId: true,
      couponId: true,
      voucherId: true,
    },
  });

  for (const transaction of expiredTransactions) {
    try {
      await prisma.$transaction(async (tx) => {
        // Hanya satu proses yang boleh meng-expire transaksi ini.
        const updated = await tx.eventTransaction.updateMany({
          where: {
            id: transaction.id,
            status: "WAITING_FOR_PAYMENT",
            paymentProofDeadline: {
              lte: new Date(),
            },
          },
          data: {
            status: "EXPIRED",
          },
        });

        // Jika status sudah berubah, jangan kembalikan stok atau poin lagi.
        if (updated.count !== 1) return;

        
        // Kembalikan kuota Voucher jika transaksi menggunakan Voucher.
        if (transaction.voucherId !== null) {
          await tx.voucher.updateMany({
            where: {
              id: transaction.voucherId,
              usedQuantity: { gt: 0 },
            },
            data: {
              usedQuantity: { decrement: 1 },
            },
          });
        }

        // Kembalikan Coupon jika transaksi menggunakan Coupon.
        if (transaction.couponId !== null) {
          await tx.coupon.updateMany({
            where: {
              id: transaction.couponId,
              userId: transaction.userId,
            },
            data: {
              usedAt: null,
            },
          });
        }

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

        // Refund poin tetap satu paket dengan perubahan status dan stok.
        await refundPointsForTransaction(
          tx,
          transaction.id,
          transaction.userId,
        );
      });

      console.log(
        `[Checkout Cron] Transaction ${transaction.id} processed`,
      );
    } catch (error) {
      console.error(
        `[Checkout Cron] Failed transaction ${transaction.id}:`,
        error,
      );
    }
  }
}

export function startCheckoutExpiryCron(): void {
  cron.schedule("* * * * *", async () => {
    console.log("[Checkout Cron] Checking expired transactions...");

    try {
      await expireUnpaidTransactions();
    } catch (error) {
      console.error("[Checkout Cron] Job failed:", error);
    }
  });

  console.log("[Checkout Cron] Scheduled to run every minute");
}
