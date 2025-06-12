import type {
  getCompanyLeadSettings,
  getCompanyNotificationSettings,
  getCompanyStores,
  getOfferPreferenceSettings,
  getOfferPreferenceSettingsQuerySchema,
  updateCompanyLeadSettings,
  updateCompanyLeadSettingsSchema,
  updateNotificationSettings,
  updateNotificationSettingsSchema,
  updateOfferPreferenceSettings
} from '@roshi/backend';
import { AwaitedRT, OfferPreferenceSettingsSchema } from '@roshi/shared';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { useAxios } from './useAxios';

export const useGetCompanyStores = (companyId: string) => {
  const axios = useAxios();
  return useQuery({
    queryKey: ['useGetCompanyStores', companyId],
    queryFn: () => axios.get<AwaitedRT<typeof getCompanyStores>>(`/company/${companyId}/store`).then((res) => res.data.data)
  });
};

export const useUpdateNotificationSettings = () => {
  const axios = useAxios({ successToast: true });
  return useMutation({
    mutationFn: (args: z.infer<typeof updateNotificationSettingsSchema>) =>
      axios.put<AwaitedRT<typeof updateNotificationSettings>>('/company/notification', args).then((res) => res.data)
  });
};

export const useGetCompanyNotificationSettings = () => {
  const axios = useAxios();
  return useQuery({
    queryKey: ['useGetCompanyNotificationSettings'],
    queryFn: () => axios.get<AwaitedRT<typeof getCompanyNotificationSettings>>('/company/notification').then((res) => res.data.data)
  });
};

export const useGetCompanyLeadSettings = () => {
  const axios = useAxios();
  return useQuery({
    queryKey: ['useGetCompanyLeadSettings'],
    queryFn: () => axios.get<AwaitedRT<typeof getCompanyLeadSettings>>('/company/lead-settings').then((res) => res.data.data)
  });
};

export const useUpdateCompanyLeadSettings = () => {
  const axios = useAxios({ successToast: true });
  return useMutation({
    mutationFn: (args: z.infer<typeof updateCompanyLeadSettingsSchema>) =>
      axios.put<AwaitedRT<typeof updateCompanyLeadSettings>>('/company/lead-settings', args).then((res) => res.data)
  });
};

export const useGetOfferPreferenceSettings = (params: z.infer<typeof getOfferPreferenceSettingsQuerySchema>) => {
  const axios = useAxios();
  return useQuery({
    queryKey: ['useGetOfferPreferenceSettings', params],
    queryFn: () =>
      axios.get<AwaitedRT<typeof getOfferPreferenceSettings>>('/company/preference-settings', { params }).then((res) => res.data.data)
  });
};

export const useUpdateOfferPreferenceSettings = () => {
  const axios = useAxios({ successToast: true });
  return useMutation({
    mutationFn: (args: z.infer<typeof OfferPreferenceSettingsSchema>) =>
      axios.put<AwaitedRT<typeof updateOfferPreferenceSettings>>('/company/preference-settings', args).then((res) => res.data)
  });
};
