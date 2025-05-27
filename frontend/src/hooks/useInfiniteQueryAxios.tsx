import { PaginatedApiResponse } from "@roshi/shared";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAxios } from "../api/useAxios";

export const useInfiniteQueryAxios = <TResponse extends PaginatedApiResponse<unknown>, TParams = unknown>(queryParams: {
  queryKey: unknown[];
  apiRoute: string;
  params?: TParams;
}) => {
  const axios = useAxios();
  const query = useInfiniteQuery({
    queryKey: queryParams.queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios
        .get<PaginatedApiResponse<TResponse["data"][number]>>(queryParams.apiRoute, {
          params: { ...queryParams.params, page: pageParam },
        })
        .then((res) => res.data);
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.totalPages > lastPage.meta.page ? lastPage.meta.page + 1 : undefined,
  });

  const res = useMemo(
    () => ({
      ...query,
      data: query.data?.pages.flatMap((page) => page.data),
      totalItems: query.data?.pages[0]?.meta.totalItems || 0,
    }),
    [query]
  );

  return res;
};
