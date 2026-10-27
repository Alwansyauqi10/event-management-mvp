
import { api } from "@/lib/axios";

export interface CreateTransactionInput {
  eventId: string;
  tickets: { ticketId: string; quantity: number }[];
  pointsToUse?: string | number;
  voucherCode?: string;
  couponId?: string;

}

export interface CreatedTransaction {
  id: string;
  transactionCode: string;
  status: string;
  subTotal: string;
  pointDiscount: string;
  voucherDiscount: string;
  couponDiscount: string;
  totalAmount: string;
  paymentProofDeadline: string | null;
  event: {
    id: string;
    name: string;
  };
  items: {
    ticketId: string;
    ticketName: string;
    price: string;
    quantity: number;
    subTotal: string;
  }[];
}

export interface CreateTransactionResponse {
  message: string;
  transaction: CreatedTransaction;
}

export interface UploadPaymentProofResponse {
  message: string;
  [key: string]: unknown;
}

export const createTransaction = async (
  input: CreateTransactionInput,
): Promise<CreateTransactionResponse> => {
  const response = await api.post<CreateTransactionResponse>(
    "/transactions",
    input,
  );

  return response.data;
};

export const uploadPaymentProof = async (
  transactionId: string,
  file: File,
): Promise<UploadPaymentProofResponse> => {
  const formData = new FormData();
  formData.append("paymentProof", file);

  const response = await api.post<UploadPaymentProofResponse>(
    `/transactions/${transactionId}/payment-proof`,
    formData,
  );

  return response.data;
};

export interface TransactionStatus {
  id: string;
  transactionCode: string;
  status:
    | "WAITING_FOR_PAYMENT"
    | "WAITING_FOR_ADMIN_CONFIRMATION"
    | "DONE"
    | "REJECTED"
    | "EXPIRED"
    | "CANCELED"
    | string;
  paymentProofDeadline: string | null;
}

export interface TransactionStatusResponse {
  message: string;
  data: TransactionStatus;
}

export const getTransactionStatus = async (
  transactionId: string,
): Promise<TransactionStatus> => {
  const response = await api.get<TransactionStatusResponse>(
    `/transactions/${transactionId}/status`,
  );

  return response.data.data;
};

export interface MyTransactionItem {
  ticketId: string;
  price: string;
  quantity: number;
  subTotal: string;
  ticket: {
    name: string;
  };
}

export interface MyTransaction {
  id: string;
  transactionCode: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  paymentProofDeadline: string | null;
  checkedInAt: string | null;
  review: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
  } | null;
  event: {
    id: string;
    name: string;
    startDate: string;
    location: string;
  };
  items: MyTransactionItem[];
}

export interface MyTransactionsResponse {
  message: string;
  data: MyTransaction[];
}

export const getMyTransactions = async (): Promise<MyTransaction[]> => {
  const response = await api.get<MyTransactionsResponse>(
    "/transactions/my-transactions",
  );

  return response.data.data;
};

export interface AvailableCoupon {
  id: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: string;
  startAt: string;
  endAt: string;
}

export const getMyCoupons = async (): Promise<AvailableCoupon[]> => {
  const response = await api.get<AvailableCoupon[]>("/referral/my-coupons");
  return response.data;
};
