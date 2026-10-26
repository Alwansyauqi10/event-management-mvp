import { api } from "@/lib/axios";
import type { OrganizerEventAttendeesResponse } from "@/services/event.service";
import { useQuery } from "@tanstack/react-query";

type UseOrganizerEventAttendeesParams = {
  eventId: string;
  page: number;
  limit: number;
};

export const useOrganizerEventAttendees = ({
  eventId,
  page,
  limit,
}: UseOrganizerEventAttendeesParams) => {
  return useQuery({
    queryKey: ["organizer", "event-attendees", { eventId, page, limit }],
    queryFn: async () => {
      const response = await api.get<OrganizerEventAttendeesResponse>(
        `/organizer/events/${eventId}/attendees`,
        { params: { page, limit } },
      );

      return response.data;
    },
    enabled: Boolean(eventId),
    placeholderData: (previousData) => previousData,
  });
};
