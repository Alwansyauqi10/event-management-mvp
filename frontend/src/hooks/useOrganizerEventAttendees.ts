import { getOrganizerEventAttendees } from "@/services/event.service";
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
    queryFn: () => getOrganizerEventAttendees(eventId, { page, limit }),
    placeholderData: (previousData) => previousData,
  });
};
