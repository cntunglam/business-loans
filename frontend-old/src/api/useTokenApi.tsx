import type { generateAPIToken, getMyAPITokens } from '@roshi/backend';
import { AwaitedRT } from '@roshi/shared';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAxios } from './useAxios';

export const useGetMyAPITokens = () => {
  const axios = useAxios();
  return useQuery({
    queryKey: ['useGetMyAPITokens'],
    queryFn: () => axios.get<AwaitedRT<typeof getMyAPITokens>>('/token/me').then((res) => res.data.data)
  });
};

export const useDeleteAPIToken = () => {
  const axios = useAxios({ successToast: true });
  return useMutation({
    mutationFn: (id: string) => axios.delete(`/token/${id}`).then((res) => res.data)
  });
};

export const useGenerateAPIToken = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: (name: string) => axios.post<AwaitedRT<typeof generateAPIToken>>('/token', { name }).then((res) => res.data)
  });
};
