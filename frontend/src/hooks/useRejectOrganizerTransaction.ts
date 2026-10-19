import { rejectOrganizerTransaction } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useRejectOrganizerTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectOrganizerTransaction,

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
