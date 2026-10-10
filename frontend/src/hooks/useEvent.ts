import { useQuery } from "@tanstack/react-query";

import { getEventById } from "../services/event.service";

export const useEventById = (id: string) => {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventById(id),
    enabled: Boolean(id),
  });
};