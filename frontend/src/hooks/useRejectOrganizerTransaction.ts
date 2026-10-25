import { api } from "@/lib/axios";
import type { TransactionStatus } from "@/types/organizerDashboard";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useRejectOrganizerTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await api.put<{
        message: string;
        data: {
          id: string;
          status: TransactionStatus;
        };
      }>(`/organizer/transactions/${transactionId}/reject`);

      return response.data;
    },

    onSuccess: async (response) => {
      toast.success(response.message);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["organizer", "transaction"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["organizer", "transactions"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["organizer", "dashboard"],
        }),
      ]);
    },
    onError: () => {
      toast.error("Gagal menerima transaksi. Silakan coba lagi.");
    },
  });
};
