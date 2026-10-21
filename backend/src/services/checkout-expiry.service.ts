
import cron from "node-cron";
import { prisma } from "../lib/prisma.js";

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

        // Jika status sudah berubah, stok tidak boleh dikembalikan lagi.
        if (updated.count !== 1) return;

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
              id: (
                await tx.eventTransaction.findUniqueOrThrow({
                  where: { id: transaction.id },
                  select: { eventId: true },
                })
              ).eventId,
            },
            data: {
              availableSeats: {
                increment: totalQuantity,
              },
            },
          });
        }
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
