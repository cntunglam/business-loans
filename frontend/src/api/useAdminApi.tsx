import type {
  addCompanySchema,
  addUserSchema,
  getAllAppointments,
  getAllClosedLeads,
  getAllClosedLeadsSchema,
  getAllLeads,
  getAllLeadsSchema,
  getAllUsers,
  getAllUsersSchema,
  getCompanies,
  getCompaniesSchema,
  getLeadById,
  getTemplate,
  getTemplateSchema,
  getUserByPhone,
  updateCompanySchema,
  updateLoanRequestSchema,
  updateLoanResponseSchema,
  updateUserSchema,
} from "@roshi/backend";
import { AwaitedRT } from "@roshi/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useDeepState } from "../hooks/useDeepState";
import { useMutationWithState } from "../hooks/useMutationWithState";
import { useAxios } from "./useAxios";

export const useGetCompanies = (params?: z.infer<typeof getCompaniesSchema>, options?: { enabled: boolean }) => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["useGetCompanies"],
    queryFn: () => axios.get<AwaitedRT<typeof getCompanies>>("admin/company", { params }).then((res) => res.data.data),
    enabled: options?.enabled,
  });
};

export const useUpdateCompany = () => {
  const axios = useAxios({ successToast: true });
  return useMutation({
    mutationFn: (args: { id: string } & z.infer<typeof updateCompanySchema>) =>
      axios.put(`admin/company/${args.id}`, args).then((res) => res.data),
  });
};

export const useAddCompany = () => {
  const axios = useAxios({ successToast: true });
  return useMutationWithState<z.infer<typeof addCompanySchema>>((state) =>
    axios.post(`admin/company`, state).then((res) => res.data)
  );
};

export const useGetUsers = (initialParams?: Partial<z.infer<typeof getAllUsersSchema>>) => {
  const axios = useAxios();

  const [params, setParams, clearState] = useDeepState<Partial<z.infer<typeof getAllUsersSchema>>>(initialParams || {});
  const query = useQuery({
    queryKey: ["useGetUsers", initialParams, params],
    queryFn: () => axios.get<AwaitedRT<typeof getAllUsers>>("admin/user", { params }).then((res) => res.data.data),
  });
  return { query, params, setParams, clearParams: clearState };
};

export const useUpdateUser = () => {
  const axios = useAxios({ successToast: true });
  return useMutation({
    mutationFn: (args: { id: string } & z.infer<typeof updateUserSchema>) =>
      axios.put(`admin/user/${args.id}`, args).then((res) => res.data),
  });
};

export const useAddUser = () => {
  const axios = useAxios({ successToast: true });
  return useMutationWithState<z.infer<typeof addUserSchema>>((state) =>
    axios.post(`admin/user`, state).then((res) => res.data)
  );
};

export type AdminLead = NonNullable<ReturnType<typeof useGetAllLeadsAdmin>["query"]["data"]>[number];
export const useGetAllLeadsAdmin = (defaultParams?: Partial<z.infer<typeof getAllLeadsSchema>>) => {
  const axios = useAxios();
  const [params, setParams, clearState] = useDeepState<Partial<z.infer<typeof getAllLeadsSchema>>>({
    ...defaultParams,
  });
  const query = useQuery({
    queryKey: ["useGetAllLeadsAdmin", params],
    queryFn: () => axios.get<AwaitedRT<typeof getAllLeads>>("admin/leads", { params }).then((res) => res.data.data),
  });

  return { query, params, setParams, clearParams: clearState };
};

export const useGetLeadById = (id?: string) => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["useGetLeadById", id],
    queryFn: () => axios.get<AwaitedRT<typeof getLeadById>>(`admin/leads/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useUpdateLoanRequestAdmin = () => {
  const axios = useAxios({ successToast: true });
  return useMutation({
    mutationFn: (args: { id: string } & z.infer<typeof updateLoanRequestSchema>) =>
      axios.put(`admin/loan-request/${args.id}`, args).then((res) => res.data),
  });
};

export const useUpdateLoanResponseAdmin = () => {
  const axios = useAxios({ successToast: true });
  return useMutation({
    mutationFn: (args: { id: string } & z.infer<typeof updateLoanResponseSchema>) =>
      axios.put(`admin/loan-response/${args.id}`, args).then((res) => res.data),
  });
};

export const useGetAllAppointmentsAdmin = () => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["useGetAllAppointmentsAdmin"],
    queryFn: () => axios.get<AwaitedRT<typeof getAllAppointments>>("admin/appointment").then((res) => res.data.data),
  });
};

export const useGetUserByPhone = (phone: string) => {
  const axios = useAxios({ noErrorToast: true });
  return useQuery({
    queryKey: ["useGetUserByPhone", phone],
    queryFn: () => axios.get<AwaitedRT<typeof getUserByPhone>>(`admin/user/${phone}`).then((res) => res.data.data),
  });
};

export const useGetTemplate = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: (body: z.infer<typeof getTemplateSchema>) =>
      axios.post<AwaitedRT<typeof getTemplate>>(`admin/template`, body).then((res) => res.data),
  });
};

export const useGetAllClosedLeads = (defaultParams?: Partial<z.infer<typeof getAllClosedLeadsSchema>>) => {
  const axios = useAxios();
  const [params, setParams, clearState] = useDeepState<Partial<z.infer<typeof getAllClosedLeadsSchema>>>({
    ...defaultParams,
  });
  const query = useQuery({
    queryKey: ["useGetAllClosedLeads", params],
    queryFn: () =>
      axios.get<AwaitedRT<typeof getAllClosedLeads>>("admin/closed", { params }).then((res) => res.data.data),
  });

  return { query, params, setParams, clearParams: clearState };
};

export const useConvertToNormalLoanRequest = () => {
  const axios = useAxios({ successToast: true });
  return useMutation({
    mutationFn: (id: string) => axios.put(`admin/loan-request/${id}/convert-to-normal`).then((res) => res.data),
  });
};
