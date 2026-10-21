import {
  getOrganizerStatistics,
  type GetOrganizerStatisticsParams,
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
    queryFn: () => getOrganizerStatistics(params),
  });
}
