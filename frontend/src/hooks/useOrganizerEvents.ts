import {
  deleteOrganizerEvent,
  getOrganizerEvents,
} from "@/services/event.service";
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
    queryFn: () => getOrganizerEvents({ page, limit }),
    placeholderData: (previousData) => previousData,
  });
};

export const useDeleteOrganizerEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOrganizerEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["organizer-events"],
      });
    },
  });
};
