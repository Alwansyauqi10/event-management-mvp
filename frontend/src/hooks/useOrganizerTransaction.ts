import { getOrganizerTransactions, type TransactionStatus } from "@/lib/axios";

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
    queryFn: () => getOrganizerTransactions({ page, limit, status }),
    placeholderData: (previousData) => previousData,
  });
};
