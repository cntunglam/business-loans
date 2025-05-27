import type { closeLoanOfferSchema, createLoanOfferSchema } from "@roshi/backend";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useAxios } from "./useAxios";
export const useCreateLoanOffer = () => {
  const axios = useAxios({ successToast: true });
  return useMutation({
    mutationFn: (args: z.infer<typeof createLoanOfferSchema>) =>
      axios.post(`/loan-offer`, args).then((res) => res.data),
  });
};

export const useDeleteLoanOffer = () => {
  const axios = useAxios({ successToast: true });
  return useMutation({
    mutationFn: (id: string) => axios.delete(`/loan-offer/${id}`).then((res) => res.data),
  });
};

export const useCloseLoanOffer = () => {
  const axios = useAxios({ successToast: true });
  return useMutation({
    mutationFn: (args: z.infer<typeof closeLoanOfferSchema> & { id: string }) =>
      axios.post(`/loan-offer/${args.id}/close`, args).then((res) => res.data),
  });
};

export const useRemoveOutcome = () => {
  const axios = useAxios({ successToast: true });
  return useMutation({
    mutationFn: (id: string) =>
      axios.put(`/loan-offer/${id}/remove-outcome`).then((res) => res.data),
  });
};
