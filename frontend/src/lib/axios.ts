import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestPath = error.config?.url?.split("?")[0];

    const publicAuthPaths = [
      "/auth/register",
      "/auth/login",
      "/auth/forgot-password",
      "/auth/reset-password",
    ];

    const isPublicAuthRequest = publicAuthPaths.includes(requestPath ?? "");
    const isProfileRequest = requestPath === "/auth/profile";

    if (
      error.response?.status === 401 &&
      !isPublicAuthRequest &&
      !isProfileRequest
    ) {
      localStorage.removeItem("accessToken");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
