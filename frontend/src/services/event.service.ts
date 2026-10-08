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

export const getEventById = async (
  id: string,
): Promise<EventDetailResponse> => {
  const response = await api.get<EventDetailResponse>(
    `/events/${id}`,
  );

  return response.data;
};