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
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return pointTransactions.map((transaction) => ({
    id: transaction.id.toString(),
    type: transaction.type,
    amount: transaction.amount.toString(),
    remainingAmount: transaction.remainingAmount.toString(),
    createdAt: transaction.createdAt,
    expiredAt: transaction.expiredAt,
  }));
};

export const getUserCouponsService = async (userId: string) => {
  const now = new Date();

  const coupons = await prisma.coupon.findMany({
    where: {
      userId: BigInt(userId),
    },
    select: {
      id: true,
      code: true,
      discountType: true,
      discountValue: true,
      startAt: true,
      endAt: true,
      usedAt: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return coupons.map((coupon) => {
    let status: "ACTIVE" | "USED" | "EXPIRED" | "UPCOMING";

    if (coupon.usedAt) {
      status = "USED";
    } else if (now < coupon.startAt) {
      status = "UPCOMING";
    } else if (now > coupon.endAt) {
      status = "EXPIRED";
    } else {
      status = "ACTIVE";
    }

    return {
      ...coupon,
      id: coupon.id.toString(),
      discountValue: coupon.discountValue.toString(),
      status,
    };
  });
};
