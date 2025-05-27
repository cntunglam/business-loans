import type { getCurrentUserHandler } from "@roshi/backend";
import { AwaitedRT } from "@roshi/shared";
import { ApiResponse } from "@roshi/shared/models/api.model";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useUserContext } from "../context/userContext";
import { KEYS } from "../data/constants";
import { useAxios } from "./useAxios";

export const useSendOTP = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: (args: { email: string }) => axios.post("/account/generate-otp", args).then((res) => res.data),
  });
};

export const useSendWhatsappOTP = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: (args: { phone: string }) => axios.post("/account/generate-whatsapp-otp", args).then((res) => res.data),
  });
};

export const useOTPLogin = () => {
  const axios = useAxios();
  const { refetch } = useUserContext();
  return useMutation({
    mutationFn: async (args: { email: string; otp: string; phone?: string }) => {
      const res = await axios.post<ApiResponse<string>>("/account/otp-login", args).then((res) => res.data);
      localStorage.setItem(KEYS.AUTH_TOKEN, res.data);
      await refetch?.();
      return true;
    },
  });
};

export const useGetCurrentUser = ({ enabled = true }: { enabled?: boolean }) => {
  const axios = useAxios({ noErrorToast: true });
  return useQuery({
    queryKey: ["useGetCurrentUser"],
    queryFn: () => axios.get<AwaitedRT<typeof getCurrentUserHandler>>("/account/me").then((res) => res.data.data),
    retry: 0,
    enabled,
  });
};

export const useOTPLoginWithPhone = () => {
  const axios = useAxios();
  const { refetch } = useUserContext();
  return useMutation({
    mutationFn: async (args: { phone: string; otp: string }) => {
      const res = await axios.post<ApiResponse<string>>("/account/otp-login-with-phone", args).then((res) => res.data);
      localStorage.setItem(KEYS.AUTH_TOKEN, res.data);
      await refetch?.();
      return true;
    },
  });
};
