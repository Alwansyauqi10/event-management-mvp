import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { LoginSchema, RegisterSchema } from "@/schema/auth";
import { useNavigate } from "react-router";
import type { AxiosError } from "axios";

export const useRegister = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: RegisterSchema) => {
      await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
    },
    onSuccess: () => {
      alert("Register success!");
      navigate("/login");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      alert(error.response?.data.message || "Register failed!");
    },
  });
};

export const useLogin = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: LoginSchema) => {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      alert("Login success!");
      navigate("/profile");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      alert(error.response?.data.message || "Login failed!");
    },
  });
};
