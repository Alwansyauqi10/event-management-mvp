import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export const usePoints = () => {
  return useQuery({
    queryKey: ["points"],
    queryFn: async () => {
      const response = await api.get("/referral/points");
      return response.data.points as string;
    },
  });
};
