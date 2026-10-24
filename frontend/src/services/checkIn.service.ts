import { api } from "@/lib/axios";

export interface CheckInAttendee {
  transactionId: string;
  userId: string;
  name: string;
  email: string;
  ticketQuantity: number;
  status: "CHECKED_IN" | "NOT_CHECKED_IN";
  checkedInAt: string | null;
}

export interface CheckInEvent {
  id: string;
  name: string;
  location: string | null;
  startDate: string;
  endDate: string;
  categoryId: string | number;
  category: {
    name: string;
  } | null;
}

export interface CheckInAttendeesResponse {
  event: CheckInEvent;
  data: CheckInAttendee[];
  meta: {
    totalTransactions: number;
    checkedInCount: number;
    notCheckedInCount: number;
  };
}

export interface CheckInTicketDetail {
  name: string;
  quantity: number;
}

export interface CheckInAttendee {
  transactionId: string;
  userId: string;
  name: string;
  email: string;
  ticketQuantity: number;
  ticketDetails: CheckInTicketDetail[];
  status: "CHECKED_IN" | "NOT_CHECKED_IN";
  checkedInAt: string | null;
}

export const getCheckInAttendees = async (
  eventId: string,
): Promise<CheckInAttendeesResponse> => {
  const response = await api.get(
    `/organizer/events/${eventId}/check-in-attendees`,
  );

  return response.data.data;
};

export const checkInTransaction = async (
  transactionId: string,
) => {
  const response = await api.post(
    `/organizer/transactions/${transactionId}/check-in`,
  );

  return response.data;
};
