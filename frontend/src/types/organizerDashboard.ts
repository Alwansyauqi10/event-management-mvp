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
