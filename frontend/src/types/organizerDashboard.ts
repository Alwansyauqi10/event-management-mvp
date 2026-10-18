export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELED" | "COMPLETED";

export type TransactionStatus =
  | "WAITING_FOR_PAYMENT"
  | "WAITING_FOR_ADMIN_CONFIRMATION"
  | "DONE"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELED";

export type OrganizerEvent = {
  id: string;
  name: string;
  location: string;
  startDate: string;
  status: EventStatus;
  category: {
    name: string;
  };
  totalTransactions: number;
};

export type OrganizerDashboardData = {
  summary: {
    totalEvents: number;
    eventsByStatus: Partial<Record<EventStatus, number>>;
    transactionsByStatus: Partial<Record<TransactionStatus, number>>;
  };
  recentEvents: OrganizerEvent[];
};

export type OrganizerDashboardResponse = {
  message: string;
  data: OrganizerDashboardData;
};

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
    endDate: string;
    location: string;
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

export type GetOrganizerTransactionsParams = {
  page: number;
  limit: number;
  status?: TransactionStatus;
};
