import {
  getEventById,
  getEventCategories,
  updateOrganizerEvent,
} from "@/services/event.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type UpdateOrganizerEventParams = {
  eventId: string;
  payload: Parameters<typeof updateOrganizerEvent>[1];
};

export const useEditOrganizerEvent = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ["organizer", "edit-event", eventId],
    queryFn: async () => {
      if (!eventId) {
        throw new Error("ID event tidak ditemukan.");
      }

      const [eventResponse, categoryResponse] = await Promise.all([
        getEventById(eventId),
        getEventCategories(),
      ]);

      return {
        event: eventResponse.data,
        categories: categoryResponse.data,
      };
    },
    enabled: Boolean(eventId),
  });
};

export const useUpdateOrganizerEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, payload }: UpdateOrganizerEventParams) =>
      updateOrganizerEvent(eventId, payload),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["organizer-events"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["organizer", "edit-event", variables.eventId],
        }),
      ]);
    },
  });
};
