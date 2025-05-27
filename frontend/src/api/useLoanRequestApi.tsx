import type {
  createGuarantorSchema,
  getActivityLogsByLoanRequestId,
  getClosedLoanRequests,
  getClosedLoanRequestsSchema,
  getLoanRequestById,
  getLoanRequests,
  getLoanRequestsSchema,
  getLoanResponsesByLoanRequestId,
  getMyLoanRequest,
  getPartnerOffers,
} from "@roshi/backend";
import { AwaitedRT, NonNullRT } from "@roshi/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useAxios } from "./useAxios";

export type loanResponse = NonNullRT<typeof useGetMyLoanRequest>["loanResponses"][0];
export const useGetMyLoanRequest = ({ enabled, code }: { enabled?: boolean; code?: string } = {}) => {
  const axios = useAxios({ noErrorToast: true });
  return useQuery({
    queryKey: ["useGetMyLoanRequest", code],
    queryFn: () =>
      axios
        .get<AwaitedRT<typeof getMyLoanRequest>>("/loan-request/me", { headers: { "X-Short-Url": code } })
        .then((res) => res.data.data),
    enabled,
  });
};

export const useGetLoanRequestById = (id: string) => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["useGetLoanRequestById", id],
    queryFn: () => axios.get<AwaitedRT<typeof getLoanRequestById>>(`/loan-request/${id}`).then((res) => res.data.data),
  });
};

export const useDeleteMyLoanRequest = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: () => axios.delete(`/loan-request`).then((res) => res.data),
  });
};

export const useRestoreMyLoanRequest = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: (args: { id: string }) => axios.post(`/loan-request/${args.id}/restore`).then((res) => res.data),
  });
};

export const useGetPartnerOffers = () => {
  const axios = useAxios({ noErrorToast: true });
  return useQuery({
    queryKey: ["useGetPartnerOffers"],
    queryFn: () =>
      axios.get<AwaitedRT<typeof getPartnerOffers>>("/loan-request/partner-offers").then((res) => res.data.data),
  });
};

export type LenderDashboardClosedApplication = NonNullable<
  NonNullable<ReturnType<typeof useGetClosedLoanRequests>["data"]>["data"][number]
>;
export const useGetClosedLoanRequests = (
  params: z.infer<typeof getClosedLoanRequestsSchema>,
  options?: { enabled?: boolean }
) => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["useGetClosedLoanRequests", params],
    queryFn: () =>
      axios.get<AwaitedRT<typeof getClosedLoanRequests>>("/loan-request/closed", { params }).then((res) => res.data),
    enabled: options?.enabled,
  });
};

//Used for invalidating queries
export const useGetLoanRequestsQueryKey = "useGetLoanRequests";
export type LenderDashboardApplication = NonNullable<ReturnType<typeof useGetLoanRequests>["data"]>["data"][number];
export const useGetLoanRequests = (params?: z.infer<typeof getLoanRequestsSchema>, options?: { enabled: boolean }) => {
  const axios = useAxios();
  return useQuery({
    queryKey: [useGetLoanRequestsQueryKey, params],
    queryFn: () => axios.get<AwaitedRT<typeof getLoanRequests>>("/loan-request", { params }).then((res) => res.data),
    enabled: options?.enabled,
  });
};

// Guarantor
export const useCreateGuarantor = () => {
  const axios = useAxios({ skipDateTransformation: true });
  return useMutation({
    mutationFn: (application: z.infer<typeof createGuarantorSchema>) =>
      axios.post("/loan-request/guarantor", application).then((res) => res.data),
  });
};

export const useDeleteGuarantor = () => {
  const axios = useAxios({ skipDateTransformation: true });
  return useMutation({
    mutationFn: () => axios.delete(`/loan-request/guarantor`).then((res) => res.data),
  });
};

export const useAssignCustomerSupport = (loanRequestId: string) => {
  const axios = useAxios();
  return useMutation({
    mutationFn: (application: { customerSupportId: string }) =>
      axios.put(`/loan-request/${loanRequestId}/assign-customer-support`, application).then((res) => res.data),
  });
};

const useGettingActivityLogsQueryKey = "useGettingActivityLogs";
export const useGetActivityLogs = (id: string, options?: { enabled: boolean }) => {
  const axios = useAxios();
  return useQuery({
    queryKey: [useGettingActivityLogsQueryKey, id],
    queryFn: () =>
      axios
        .get<ReturnType<typeof getActivityLogsByLoanRequestId>>(`/loan-request/${id}/activity-logs`)
        .then((res) => res.data)
        .then((res) => res.data),
    enabled: options?.enabled,
  });
};

const useGetLoanResponsesQueryKey = "useGetLoanResponses";
export const useGetLoanResponses = (id: string, options?: { enabled: boolean }) => {
  const axios = useAxios();
  return useQuery({
    queryKey: [useGetLoanResponsesQueryKey, id],
    queryFn: () =>
      axios
        .get<ReturnType<typeof getLoanResponsesByLoanRequestId>>(`/loan-request/${id}/loan-responses`)
        .then((res) => res.data)
        .then((res) => res.data),
    enabled: options?.enabled,
  });
};
