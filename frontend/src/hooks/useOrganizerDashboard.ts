import { api } from "@/lib/axios";
import type { OrganizerDashboardResponse } from "@/types/organizerDashboard";
import { useQuery } from "@tanstack/react-query";

export const useOrganizerDashboard = () => {
  return useQuery({
    queryKey: ["organizer", "dashboard"],
    queryFn: async () => {
      const response = await api.get<OrganizerDashboardResponse>(
        "/organizer/dashboard",
      );

      return response.data;
    },
  });
};
