import { SearchOff } from "@mui/icons-material";
import { NonNullRT } from "@roshi/shared";
import { FC } from "react";
import { useGetLoanResponses } from "../../api/useLoanRequestApi";
import { PageMessage } from "../shared/pageMessage";
import { LoanResponseEntry } from "./loanResponseEntry";

interface Props {
  loanResponses: NonNullRT<typeof useGetLoanResponses>;
  showActions?: boolean;
  refetch: () => void;
}
export const LoanResponsesList: FC<Props> = ({ loanResponses, refetch, showActions }) => {
  return (
    <>
      {loanResponses.length === 0 && <PageMessage text="No offers" icon={<SearchOff />} />}
      {loanResponses.map((response) => (
        <LoanResponseEntry key={response.id} response={response} refetch={refetch} showActions={showActions} />
      ))}
    </>
  );
};
