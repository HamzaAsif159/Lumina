import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { UPDATE_PROFILE_ROUTE } from "@/utils/constant";

export const useProfile = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.put(UPDATE_PROFILE_ROUTE, payload);
      return res.data;
    },
  });
};
