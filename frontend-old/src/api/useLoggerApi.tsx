import { getAllLogsSchema, getLogs } from '@roshi/backend';
import { AwaitedRT } from '@roshi/shared';
import { z } from 'zod';
import { useDeepState } from '../hooks/useDeepState';
import { useInfiniteQueryAxios } from '../hooks/useInfiniteQueryAxios';

export const useGetAllLogs = () => {
  const [params, setParams, clearState] = useDeepState<z.infer<typeof getAllLogsSchema>>({
    limit: 50
  });

  const query = useInfiniteQueryAxios<AwaitedRT<typeof getLogs>>({
    queryKey: ['useGetAllLogs', params],
    apiRoute: '/logger',
    params: params
  });
  return [query, params, setParams, clearState] as const;
};
