
import { api } from "@/lib/axios";

export type VoucherDiscountType = "PERCENTAGE" | "FIXED";

export interface CreateVoucherInput {
  eventId: string;
  code: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscount?: number;
  quota: number;
  startAt: string;
  endAt: string;
}

export type UpdateVoucherInput = Omit<CreateVoucherInput, "eventId">;

export interface Voucher {
  id: string;
  eventId: string;
  code: string;
  discountType: VoucherDiscountType;
  discountValue: number | string;
  maxDiscount: number | string | null;
  quota: number;
  usedQuantity: number;
  startAt: string;
  endAt: string;
  deletedAt: string | null;
  createdAt: string;
}

interface VoucherResponse {
  message: string;
  data: Voucher;
}

interface VouchersResponse {
  message: string;
  data: Voucher[];
}

export const createVoucher = async (
  input: CreateVoucherInput,
): Promise<Voucher> => {
  const response = await api.post<VoucherResponse>("/vouchers", input);
  return response.data.data;
};

export const getEventVouchers = async (
  eventId: string,
): Promise<Voucher[]> => {
  const response = await api.get<VouchersResponse>(
    `/vouchers/events/${eventId}`,
  );
  return response.data.data;
};

export const updateVoucher = async (
  voucherId: string,
  input: UpdateVoucherInput,
): Promise<Voucher> => {
  const response = await api.patch<VoucherResponse>(
    `/vouchers/${voucherId}`,
    input,
  );
  return response.data.data;
};

export const deactivateVoucher = async (
  voucherId: string,
): Promise<Voucher> => {
  const response = await api.delete<VoucherResponse>(
    `/vouchers/${voucherId}`,
  );
  return response.data.data;
};
