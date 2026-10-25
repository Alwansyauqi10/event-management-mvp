import { api } from "@/lib/axios";
import {
  getEventById,
  getEventCategories,
  type UpdateEventPayload,
} from "@/services/event.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type UpdateOrganizerEventParams = {
  eventId: string;
  payload: UpdateEventPayload;
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
    mutationFn: async ({ eventId, payload }: UpdateOrganizerEventParams) => {
      const formData = new FormData();

      formData.append("name", payload.name);
      formData.append("categoryId", payload.categoryId);
      formData.append("location", payload.location);
      formData.append("startDate", payload.startDate);
      formData.append("endDate", payload.endDate);
      formData.append("description", payload.description);
      formData.append("tickets", JSON.stringify(payload.tickets));

      if (payload.image) {
        formData.append("image", payload.image);
      }

      const response = await api.patch(
        `/events/organizer/${eventId}`,
        formData,
      );

      return response.data;
    },

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["organizer-events"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["organizer", "edit-event", variables.eventId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["organizer-dashboard"],
        }),
      ]);
    },
  });
};
