import { api } from "@/lib/axios";
import type {
  OrganizerTransactionResponse,
  TransactionStatus,
} from "@/types/organizerDashboard";
import { useQuery } from "@tanstack/react-query";

type UseOrganizerTransactionsParams = {
  page: number;
  limit: number;
  status?: TransactionStatus;
};

export const useOrganizerTransactions = ({
  page,
  limit,
  status,
}: UseOrganizerTransactionsParams) => {
  return useQuery({
    queryKey: ["organizer", "transactions", { page, limit, status }],
    queryFn: async () => {
      const response = await api.get<OrganizerTransactionResponse>(
        "/organizer/transactions",
        { params: { page, limit, status } },
      );

      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};
