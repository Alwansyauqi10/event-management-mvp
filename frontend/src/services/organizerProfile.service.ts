
import { api } from "../lib/axios";

export type OrganizerProfile = {
  id: string;
  name: string;
  profilePicture: string | null;
  createdAt: string;
  stats: {
    totalPublishedEvents: number;
    completedEvents: number;
    upcomingEvents: number;
    averageRating: number | null;
    totalReviews: number;
  };
};

export type OrganizerPublicEvent = {
  id: string;
  name: string;
  description: string;
  location: string;
  image: string | null;
  startDate: string;
  endDate: string;
  availableSeats: number;
  category: {
    id: string;
    name: string;
  };
};

type OrganizerProfileResponse = {
  data: OrganizerProfile;
};

type OrganizerEventsResponse = {
  data: OrganizerPublicEvent[];
};

export const getOrganizerPublicProfile = async (
  id: string,
): Promise<OrganizerProfile> => {
  const response = await api.get<OrganizerProfileResponse>(
    `/organizers/${id}`,
  );

  return response.data.data;
};

export const getOrganizerPublicEvents = async (
  id: string,
): Promise<OrganizerPublicEvent[]> => {
  const response = await api.get<OrganizerEventsResponse>(
    `/organizers/${id}/events`,
  );

  return response.data.data;
};
