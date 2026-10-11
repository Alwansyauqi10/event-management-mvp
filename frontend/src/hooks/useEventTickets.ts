import { useQuery } from "@tanstack/react-query";
import { getEventTickets } from "../services/event.service";

export const useEventTickets = (eventId: string) => {
  return useQuery({
    queryKey: ["event-tickets", eventId],
    queryFn: () => getEventTickets(eventId),
    enabled: Boolean(eventId),
  });
};