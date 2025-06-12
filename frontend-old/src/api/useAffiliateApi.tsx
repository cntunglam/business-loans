import type { getAffiliateVisitor, getReferralLinksHandler } from '@roshi/backend';
import { AwaitedRT } from '@roshi/shared';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAxios } from './useAxios';

export type ReferralLink = NonNullable<ReturnType<typeof useGetReferralLinks>['data']>[number];

export const useCreateReferralLink = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: (args: { name: string; targetUrl: string }) => axios.post('/affiliate/referral-links', args).then((res) => res.data)
  });
};

export const useDeleteReferralLink = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: (id: string) => axios.delete(`/affiliate/referral-links/${id}`).then((res) => res.data)
  });
};

export const useGetReferralLinks = (name?: string) => {
  const axios = useAxios();
  return useQuery({
    queryKey: ['useGetReferralLinks', name],
    queryFn: () =>
      axios.get<AwaitedRT<typeof getReferralLinksHandler>>('/affiliate/referral-links', { params: { name } }).then((res) => res.data.data)
  });
};

export const useRecordReferralLinkVisit = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: (referralCode: string) => axios.post(`/affiliate/referral-links/${referralCode}`).then((res) => res.data.data)
  });
};

export const useGetAffiliateVisitor = (affiliateVisitorId: string | null) => {
  const axios = useAxios();
  return useQuery({
    queryKey: ['useGetAffiliateVisitor', affiliateVisitorId],
    enabled: !!affiliateVisitorId,
    queryFn: () =>
      axios
        .get<AwaitedRT<typeof getAffiliateVisitor>>(`/affiliate/visitor/${affiliateVisitorId}`)
        .then((res) => res.data.data?.affiliateVisitor)
  });
};
