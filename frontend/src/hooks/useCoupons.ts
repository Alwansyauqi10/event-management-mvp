import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export type UserCoupon = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: string;
  startAt: string;
  endAt: string;
  usedAt: string | null;
  createdAt: string;
  status: "ACTIVE" | "USED" | "EXPIRED" | "UPCOMING";
};

export const useCoupons = () => {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const response = await api.get("/referral/coupons");
      return response.data.coupons as UserCoupon[];
    },
  });
};
