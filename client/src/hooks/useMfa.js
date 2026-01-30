import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store";
import { toast } from "sonner";
import {
  SETUP_MFA_ROUTE,
  VERIFY_MFA_ROUTE,
  DISABLE_MFA_ROUTE,
} from "@/utils/constant";

export const useMfa = () => {
  const { setUserInfo } = useAppStore();

  const setupMfa = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(SETUP_MFA_ROUTE);
      return data;
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to load QR code"),
  });

  const verifyMfa = useMutation({
    mutationFn: async (code) => {
      const { data } = await api.post(VERIFY_MFA_ROUTE, { code });
      return data;
    },
    onSuccess: (data) => {
      setUserInfo(data.user);
      toast.success("MFA Enabled successfully!");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Invalid code"),
  });

  const disableMfa = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(DISABLE_MFA_ROUTE);
      return data;
    },
    onSuccess: (data) => {
      setUserInfo(data.user);
      toast.success("MFA has been disabled.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to disable MFA"),
  });

  return { setupMfa, verifyMfa, disableMfa };
};
