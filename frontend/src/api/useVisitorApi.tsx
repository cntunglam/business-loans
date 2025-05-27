import {
  handleSubmitPhone,
  handleSubmitPhoneSchema,
  initializeVisitor,
  initializeVisitorSchema,
  saveStepProgressHandler,
  saveStepSchema,
} from "@roshi/backend";
import { AwaitedRT } from "@roshi/shared";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useAxios } from "./useAxios";

// Initialize visitor session
export const useInitializeVisitor = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: (args: z.infer<typeof initializeVisitorSchema>) =>
      axios.post<AwaitedRT<typeof initializeVisitor>>("/visitor/initialize", args).then((res) => res.data.data),
  });
};

// Save step progress
export const useSaveStepProgress = () => {
  const axios = useAxios({ noErrorToast: true });
  return useMutation({
    mutationFn: (args: z.infer<typeof saveStepSchema>) =>
      axios.post<AwaitedRT<typeof saveStepProgressHandler>>("/visitor/step", args).then((res) => res.data.data),
  });
};

// Finalize loan request (requires authentication)
export const useFinalizeLoanRequest = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: ({
      visitorId,
      override,
      affiliateVisitorId,
    }: {
      visitorId: string;
      override?: boolean;
      affiliateVisitorId?: string;
    }) => axios.post("/visitor/finalize", { visitorId, override, affiliateVisitorId }).then((res) => res.data.data),
  });
};

// check phone existence
export const useCheckPhoneExistence = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: (args: z.infer<typeof handleSubmitPhoneSchema>) =>
      axios.post<AwaitedRT<typeof handleSubmitPhone>>("/visitor/check-phone", { ...args }).then((res) => res.data.data),
  });
};
