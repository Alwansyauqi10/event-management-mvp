
import { api } from "@/lib/axios";

export interface EventReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface ReviewEventInfo {
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

export interface EventReviewsResponse {
  event: ReviewEventInfo;
  averageRating: number;
  totalReviews: number;
  reviews: EventReview[];
}

export interface OrganizerReviewsResponse {
  organizer: {
    id: string;
    name: string;
  };
  averageRating: number;
  totalReviews: number;
  reviews: (EventReview & {
    event: {
      id: string;
      name: string;
    };
  })[];
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const createEventReview = async (
  transactionId: string,
  input: { rating: number; comment?: string },
): Promise<EventReview> => {
  const response = await api.post<ApiResponse<EventReview>>(
    `/event-reviews/transactions/${transactionId}`,
    input,
  );

  return response.data.data;
};

export const getEventReviews = async (
  eventId: string,
): Promise<EventReviewsResponse> => {
  const response = await api.get<ApiResponse<EventReviewsResponse>>(
    `/event-reviews/events/${eventId}`,
  );

  return response.data.data;
};

export const getOrganizerReviews = async (
  organizerId: string,
): Promise<OrganizerReviewsResponse> => {
  const response = await api.get<ApiResponse<OrganizerReviewsResponse>>(
    `/event-reviews/organizers/${organizerId}`,
  );

  return response.data.data;
};
