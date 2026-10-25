import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type {
  ChangePasswordSchema,
  LoginSchema,
  RegisterSchema,
  UpdateProfileSchema,
} from "@/schema/auth";
import { useNavigate } from "react-router";
import type { AxiosError } from "axios";
import { toast } from "sonner";

export const useRegister = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: RegisterSchema) => {
      await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
        ...(data.referralCode?.trim()
          ? { referralCode: data.referralCode.trim() }
          : {}),
      });
    },
    onSuccess: () => {
      toast.success("Register success!");

      navigate("/login");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Register failed!");
    },
  });
};

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: LoginSchema) => {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      return response.data;
    },
    onSuccess: async (data) => {
      localStorage.setItem("accessToken", data.accessToken);

      // Hapus cache profil dari akun sebelumnya
      queryClient.removeQueries({
        queryKey: ["profile"],
      });

      toast.success("Login success!");

      if (data.user.role === "CUSTOMER") {
        navigate("/", { replace: true });
      } else if (data.user.role === "ORGANIZER") {
        navigate("/organizer/dashboard", { replace: true });
      }
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Login failed!");
    },
  });
};
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileSchema) => {
      const response = await api.put("/auth/edit-profile", {
        name: data.name,
        phone: data.phone,
      });

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

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordSchema) => {
      const response = await api.put("/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      return response.data;
    },

    onSuccess: () => {
      toast.success("Password berhasil diubah!");
    },

    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Gagal mengubah password");
    },
  });
};
