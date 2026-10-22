import { api } from "../lib/axios";

type GetEventsParams = {
  search?: string;
  category?: string;
  location?: string;
  page?: number;
  limit?: number;
};

export type Event = {
  id: string;
  organizerId: string;
  categoryId: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  availableSeats: number;
  tickets?: Ticket[];
  status: string;
  image: string | null;
  category: {
    id: string;
    name: string;
  };
};

export type EventsResponse = {
  data: Event[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type EventDetailResponse = {
  data: Event;
};

export type LocationsResponse = {
  data: string[];
};

// Category Event
export type EventCategory = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type EventCategoriesResponse = {
  data: EventCategory[];
};

export const getEvents = async (
  params: GetEventsParams = {},
): Promise<EventsResponse> => {
  const response = await api.get<EventsResponse>("/events", {
    params,
  });

  return response.data;
};

export const getEventLocations = async (): Promise<LocationsResponse> => {
  const response = await api.get<LocationsResponse>("/events/locations");

  return response.data;
};

export const getEventCategories =
  async (): Promise<EventCategoriesResponse> => {
    const response =
      await api.get<EventCategoriesResponse>("/events/categories");

    return response.data;
  };

export const getEventById = async (
  id: string,
): Promise<EventDetailResponse> => {
  const response = await api.get<EventDetailResponse>(`/events/${id}`);

  return response.data;
};

// Tickets
export type Ticket = {
  id: string;
  eventId: string;
  name: string;
  price: string;
  quantity: number;
  availableQuantity: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type EventTicketsResponse = {
  data: Ticket[];
};

export const getEventTickets = async (
  eventId: string,
): Promise<EventTicketsResponse> => {
  const response = await api.get<EventTicketsResponse>(
    `/events/${eventId}/tickets`,
  );

  return response.data;
};

// Create Event
export const createEvent = async (formData: FormData) => {
  const response = await api.post("/events", formData);
  return response.data;
};

export type OrganizerEvent = Event & {
  _count: {
    eventTransactions: number;
  };
};

export type OrganizerEventsResponse = {
  data: OrganizerEvent[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const getOrganizerEvents = async (
  params: { page?: number; limit?: number } = {},
): Promise<OrganizerEventsResponse> => {
  const response = await api.get<OrganizerEventsResponse>("/organizer/events", {
    params,
  });

  return response.data;
};

export type OrganizerEventAttendee = {
  userId: string;
  name: string;
  email: string;
  ticketQuantity: number;
  totalPaid: string;
};

export type OrganizerEventAttendeesResponse = {
  event: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  data: OrganizerEventAttendee[];
  meta: {
    totalAttendees: number;
    totalTickets: number;
    totalRevenue: string;
  };
};

export const getOrganizerEventAttendees = async (
  eventId: string,
): Promise<OrganizerEventAttendeesResponse> => {
  const response = await api.get<OrganizerEventAttendeesResponse>(
    `/organizer/events/${eventId}/attendees`,
  );

  return response.data;
};

export type StatisticsPeriod = "daily" | "monthly" | "yearly";

export type OrganizerStatisticsItem = {
  date: string;
  transactions: number;
  revenue: string;
};

export type OrganizerStatisticsResponse = {
  period: StatisticsPeriod;
  year: number;
  month?: number;
  data: OrganizerStatisticsItem[];
};

export type GetOrganizerStatisticsParams = {
  period: StatisticsPeriod;
  year?: number;
  month?: number;
};

export const getOrganizerStatistics = async (
  params: GetOrganizerStatisticsParams,
): Promise<OrganizerStatisticsResponse> => {
  const response = await api.get<{
    message: string;
    data: OrganizerStatisticsResponse;
  }>("/organizer/dashboard/statistics", { params });

  return response.data.data;
};
export const deleteOrganizerEvent = async (eventId: string) => {
  const response = await api.delete(`/events/organizer/${eventId}`);

  return response.data;
};

export type UpdateEventTicket = {
  id?: string;
  name: string;
  price: string;
  quantity: number;
};

export type UpdateEventPayload = {
  name: string;
  categoryId: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  tickets: UpdateEventTicket[];
  image?: File;
};
export const updateOrganizerEvent = async (
  eventId: string,
  payload: UpdateEventPayload,
) => {
  const formData = new FormData();

  formData.append("name", payload.name);
  formData.append("categoryId", payload.categoryId);
  formData.append("location", payload.location);
  formData.append("startDate", payload.startDate);
  formData.append("endDate", payload.endDate);
  formData.append("description", payload.description);
  formData.append("tickets", JSON.stringify(payload.tickets));

  if (payload.image) {
    formData.append("image", payload.image);
  }

  const response = await api.patch(`/events/organizer/${eventId}`, formData);

  return response.data;
};
