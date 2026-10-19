import { getOrganizerTransactionDetail } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useOrganizerTransactionDetail = (transactionId: string) => {
  return useQuery({
    queryKey: ["organizer", "transaction", transactionId],
    queryFn: () => getOrganizerTransactionDetail(transactionId),
    enabled: Boolean(transactionId),
  });
};
