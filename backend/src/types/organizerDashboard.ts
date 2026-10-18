import { TransactionStatus } from "../generated/prisma/enums.js";

export type GetOrganizerTransactionsParams = {
  userId: string;
  status?: TransactionStatus;
  page: number;
  limit: number;
};

export type GetOrganizerTransactionDetailParams = {
  userId: string;
  transactionId: string;
};

export type AcceptTransactionParams = {
  userId: string;
  transactionId: string;
};
