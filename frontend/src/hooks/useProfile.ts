import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  profilePicture: string | null;
  referralCode: string;
};

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/auth/profile");

      return response.data.user as UserProfile;
    },
  });
};
