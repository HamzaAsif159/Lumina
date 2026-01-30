// hooks/useLogout.js
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { LOGOUT_ROUTE } from "@/utils/constant";

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await api.post(LOGOUT_ROUTE);
      return res.data;
    },
  });
};
