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

export const useUploadProfilePicture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!allowedTypes.includes(file.type)) {
        throw new Error("Format foto harus JPG, PNG, atau WEBP");
      }

      if (file.size > 2 * 1024 * 1024) {
        throw new Error("Ukuran foto maksimal 2 MB");
      }

      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await api.put("/auth/profile-picture", formData);

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Foto profil berhasil diperbarui!");
    },

    onError: (error: AxiosError<{ message: string }> | Error) => {
      const message =
        "response" in error ? error.response?.data?.message : error.message;

      toast.error(message || "Gagal mengunggah foto profil");
    },
  });
};
