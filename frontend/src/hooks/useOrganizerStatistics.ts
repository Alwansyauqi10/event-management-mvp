import { api } from "@/lib/axios";
import type {
  GetOrganizerStatisticsParams,
  OrganizerStatisticsResponse,
} from "@/services/event.service";
import { useQuery } from "@tanstack/react-query";

export function useOrganizerStatistics(params: GetOrganizerStatisticsParams) {
  return useQuery({
    queryKey: [
      "organizer-statistics",
      params.period,
      params.year,
      params.month,
    ],
    queryFn: async () => {
      const response = await api.get<{
        message: string;
        data: OrganizerStatisticsResponse;
      }>("/organizer/dashboard/statistics", { params });

      return response.data.data;
    },
  });
}
