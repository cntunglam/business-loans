import { getApplicantInfo } from "@roshi/backend";
import { AwaitedRT } from "@roshi/shared";
import { useQuery } from "@tanstack/react-query";
import { useAxios } from "./useAxios";

export const useGetApplicantInfo = (id: string) => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["useGetApplicantInfo", id],
    queryFn: () => axios.get<AwaitedRT<typeof getApplicantInfo>>("/applicant/" + id).then((res) => res.data.data),
  });
};
