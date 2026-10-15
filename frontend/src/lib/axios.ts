import type { OrganizerDashboardResponse } from "@/types/organizerDashboard";
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

export type TransactionStatus =
  | "WAITING_FOR_PAYMENT"
  | "WAITING_FOR_ADMIN_CONFIRMATION"
  | "DONE"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELED";

export type OrganizerTransaction = {
  id: string;
  transactionCode: string;
  status: TransactionStatus;
  subTotal: string;
  pointDiscount: string;
  voucherDiscount: string;
  couponDiscount: string;
  totalAmount: string;
  createdAt: string;
  paymentProofDeadline: string | null;
  adminConfirmationDeadline: string | null;
  user: {
    name: string;
    email: string;
  };
  event: {
    id: string;
    name: string;
    startDate: string;
  };
  items: {
    ticketId: string;
    price: string;
    quantity: number;
    subTotal: string;
    ticket: {
      name: string;
    };
  }[];
  paymentProof: {
    fileUrl: string;
    uploadedAt: string;
  } | null;
};

export type OrganizerTransactionResponse = {
  message: string;
  data: {
    transactions: OrganizerTransaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

type GetOrganizerTransactionsParams = {
  page: number;
  limit: number;
  status?: TransactionStatus;
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
