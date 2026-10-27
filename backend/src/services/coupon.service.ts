
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";

export const getMyCouponsService = async (userId: string) => {
  if (!/^[1-9]\d*$/.test(userId)) {
    throw new ApiError("ID pengguna tidak valid", 400);
  }

  const now = new Date();

  const coupons = await prisma.coupon.findMany({
    where: {
      userId: BigInt(userId),
      usedAt: null,
      startAt: { lte: now },
      endAt: { gt: now },
    },
    orderBy: {
      endAt: "asc",
    },
    select: {
      id: true,
      discountType: true,
      discountValue: true,
      startAt: true,
      endAt: true,
    },
  });

  return coupons.map((coupon) => ({
    id: coupon.id.toString(),
    discountType: coupon.discountType,
    discountValue: coupon.discountValue.toString(),
    startAt: coupon.startAt.toISOString(),
    endAt: coupon.endAt.toISOString(),
  }));
};
