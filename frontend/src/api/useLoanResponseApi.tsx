import { contactBorrower, getLoanResponseByIds } from "@roshi/backend";
import { useQuery } from "@tanstack/react-query";
import { useAxios } from "./useAxios";

export const useContactBorrower = (id: string) => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["useContactBorrower", id],
    queryFn: () =>
      axios.get<ReturnType<typeof contactBorrower>>(`/loan-response/${id}/contact-borrower`).then((res) => res.data),
  });
};

export const useGetLoanResponseByIds = (loanResponseIds: string[]) => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["useGetLoanResponseByIds", loanResponseIds],
    queryFn: () =>
      axios
        .get<ReturnType<typeof getLoanResponseByIds>>(`/loan-response/ids`, { params: { loanResponseIds } })
        .then((res) => res.data),
  });
};
