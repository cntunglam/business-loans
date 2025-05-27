import { getSingpassApplyUrl, getSingpassMyInfo } from "@roshi/backend";
import { AwaitedRT } from "@roshi/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAxios } from "./useAxios";

export const useSingpassLogin = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: () => axios.get<AwaitedRT<typeof getSingpassApplyUrl>>("/spass/apply").then((res) => res.data.data),
  });
};

export const useSingpassFetchPersons = ({
  code,
  codeVerifier,
  visitorId,
}: {
  code?: string;
  codeVerifier?: string;
  visitorId?: string;
}) => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["singpass", code, codeVerifier],
    queryFn: () =>
      axios
        .get<AwaitedRT<typeof getSingpassMyInfo>>("/spass/fetch-persons", { params: { code, codeVerifier, visitorId } })
        .then((res) => res.data.data),
    enabled: !!code && !!codeVerifier,
  });
};
