import { api } from "@/lib/axios";
import type { OrganizerTransaction } from "@/types/organizerDashboard";
import { useQuery } from "@tanstack/react-query";

export const useOrganizerTransactionDetail = (transactionId: string) => {
  return useQuery({
    queryKey: ["organizer", "transaction", transactionId],
    queryFn: async () => {
      const response = await api.get<{
        message: string;
        data: OrganizerTransaction;
      }>(`/organizer/transactions/${transactionId}`);

      return response.data;
    },
    enabled: Boolean(transactionId),
  });
};
