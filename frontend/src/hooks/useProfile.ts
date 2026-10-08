import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { UpdateProfileSchema } from "@/schema/auth";
import type { AxiosError } from "axios";
import { toast } from "sonner";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  profilePicture: string | null;
  referralCode: string;
};

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/auth/profile");

      return response.data.user as UserProfile;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileSchema) => {
      const response = await api.put("/auth/edit-profile", data);

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
      toast.success("Profile berhasil diperbarui!");
    },

    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui profile");
    },
  });
};
