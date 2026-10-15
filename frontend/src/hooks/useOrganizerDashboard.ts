import { getOrganizerDashboard } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useOrganizerDashboard = () => {
  return useQuery({
    queryKey: ["organizer", "dashboard"],
    queryFn: getOrganizerDashboard,
  });
};
