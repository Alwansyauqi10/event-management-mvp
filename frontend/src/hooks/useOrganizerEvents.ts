import { api } from "@/lib/axios";
import type { OrganizerEventsResponse } from "@/services/event.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type UseOrganizerEventsParams = {
  page: number;
  limit: number;
};

export const useOrganizerEvents = ({
  page,
  limit,
}: UseOrganizerEventsParams) => {
  return useQuery({
    queryKey: ["organizer-events", { page, limit }],
    queryFn: async () => {
      const response = await api.get<OrganizerEventsResponse>(
        "/organizer/events",
        { params: { page, limit } },
      );

      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useDeleteOrganizerEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const response = await api.delete(`/events/organizer/${eventId}`);

      return response.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["organizer-events"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["organizer-dashboard"],
        }),
      ]);
    },
  });
};
