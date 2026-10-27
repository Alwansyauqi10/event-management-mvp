import { prisma } from "../lib/prisma.js";

export const pointService = async (userId: string) => {
  const now = new Date();

  const pointTransactions = await prisma.pointTransaction.findMany({
    where: {
      userId: BigInt(userId),
      remainingAmount: {
        gt: 0,
      },
      OR: [{ expiredAt: null }, { expiredAt: { gt: now } }],
    },
    select: {
      remainingAmount: true,
    },
  });

  const totalPoints = pointTransactions.reduce(
    (total, transaction) => total + transaction.remainingAmount,
    0n,
  );

  return {
    points: totalPoints.toString(),
    message: "Saldo poin berhasil diakses",
  };
};

export const pointHistoryService = async (userId: string) => {
  const pointTransactions = await prisma.pointTransaction.findMany({
    where: {
      userId: BigInt(userId),
    },
    select: {
      id: true,
      type: true,
      amount: true,
      remainingAmount: true,
      createdAt: true,
      expiredAt: true,
      referenceType: true,
      referenceId: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  type HistoryItem = {
    id: string;
    type: "CREDIT" | "DEBIT" | "REFUND" | "REFERRAL";
    amount: bigint;
    remainingAmount: bigint;
    createdAt: Date;
    expiredAt: Date | null;
    referenceType: string | null;
    referenceId: bigint | null;
  };

  const historyMap = new Map<string, HistoryItem>();

  for (const transaction of pointTransactions) {
    // Gabungkan DEBIT yang berasal dari transaksi checkout yang sama.

    if (
      (transaction.type === "DEBIT" &&
        transaction.referenceType === "EVENT_TRANSACTION") ||
      (transaction.type === "REFUND" &&
        transaction.referenceType === "EVENT_TRANSACTION_REFUND")
    ) {
      if (transaction.referenceId === null) {
        // Jika tidak ada referensi transaksi, tampilkan record secara terpisah.
        const key = `POINT-${transaction.id.toString()}`;

        historyMap.set(key, {
          id: transaction.id.toString(),
          type: transaction.type,
          amount: transaction.amount,
          remainingAmount: transaction.remainingAmount,
          createdAt: transaction.createdAt,
          expiredAt: transaction.expiredAt,
          referenceType: transaction.referenceType,
          referenceId: transaction.referenceId,
        });

        continue;
      }

      const key = `${transaction.type}-${transaction.referenceId.toString()}`;
      const existing = historyMap.get(key);

      if (existing) {
        existing.amount += transaction.amount;
        existing.createdAt =
          transaction.createdAt > existing.createdAt
            ? transaction.createdAt
            : existing.createdAt;
      } else {
        historyMap.set(key, {
          id: key,
          type: transaction.type,
          amount: transaction.amount,
          remainingAmount: 0n,
          createdAt: transaction.createdAt,
          expiredAt: null,
          referenceType: transaction.referenceType,
          referenceId: transaction.referenceId,
        });
      }

      continue;
    }

    // Riwayat lainnya tetap ditampilkan sebagai record tersendiri.
    const key = `POINT-${transaction.id.toString()}`;

    historyMap.set(key, {
      id: transaction.id.toString(),
      type: transaction.type,
      amount: transaction.amount,
      remainingAmount: transaction.remainingAmount,
      createdAt: transaction.createdAt,
      expiredAt: transaction.expiredAt,
      referenceType: transaction.referenceType,
      referenceId: transaction.referenceId,
    });
  }

  return [...historyMap.values()]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount.toString(),
      remainingAmount: transaction.remainingAmount.toString(),
      createdAt: transaction.createdAt,
      expiredAt: transaction.expiredAt,
    }));
};
