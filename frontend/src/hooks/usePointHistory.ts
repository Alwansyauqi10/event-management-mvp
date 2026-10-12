import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export type PointHistoryItem = {
  id: string;
  type: "CREDIT" | "DEBIT" | "REFUND" | "REFERRAL";
  amount: string;
  remainingAmount: string;
  createdAt: string;
  expiredAt: string | null;
};

export const usePointHistory = () => {
  return useQuery({
    queryKey: ["point-history"],
    queryFn: async () => {
      const response = await api.get("/referral/points/history");

      return response.data.history as PointHistoryItem[];
    },
  });
};
