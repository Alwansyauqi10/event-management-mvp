import type {
  GetOrganizerTransactionsParams,
  OrganizerDashboardResponse,
  OrganizerTransaction,
  OrganizerTransactionResponse,
  TransactionStatus,
} from "@/types/organizerDashboard";
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000",
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

    if (error.response?.status === 401 && !isPublicAuthRequest) {
      localStorage.removeItem("accessToken");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export const getOrganizerDashboard =
  async (): Promise<OrganizerDashboardResponse> => {
    const response = await api.get<OrganizerDashboardResponse>(
      "/organizer/dashboard",
    );

    return response.data;
  };

export const getOrganizerTransactions = async (
  params: GetOrganizerTransactionsParams,
): Promise<OrganizerTransactionResponse> => {
  const response = await api.get<OrganizerTransactionResponse>(
    "/organizer/transactions",
    { params },
  );

  return response.data;
};

export const getOrganizerTransactionDetail = async (
  transactionId: string,
): Promise<{ message: string; data: OrganizerTransaction }> => {
  const response = await api.get<{
    message: string;
    data: OrganizerTransaction;
  }>(`/organizer/transactions/${transactionId}`);

  return response.data;
};

export const acceptOrganizerTransaction = async (transactionId: string) => {
  const response = await api.put<{
    message: string;
    data: {
      id: string;
      status: TransactionStatus;
    };
  }>(`/organizer/transactions/${transactionId}/accept`);

  return response.data;
};
