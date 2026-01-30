import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { LOGIN_ROUTE, SIGN_UP_ROUTE } from "@/utils/constant";

export const useSignup = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post(SIGN_UP_ROUTE, payload);
      return res.data;
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post(LOGIN_ROUTE, payload);
      return res.data;
    },
  });
};
