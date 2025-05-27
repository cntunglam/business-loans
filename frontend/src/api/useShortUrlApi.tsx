import { getShortUrlHandler } from "@roshi/backend";
import { AwaitedRT } from "@roshi/shared";
import { useQuery } from "@tanstack/react-query";
import { useAxios } from "./useAxios";

export const useGetShortUrl = (code?: string) => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["useGetShortUrl", code],
    queryFn: () => axios.get<AwaitedRT<typeof getShortUrlHandler>>("/short-url/" + code).then((res) => res.data.data),
    enabled: !!code,
  });
};
