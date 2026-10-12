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
