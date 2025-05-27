import { Button } from "@mui/joy";
import { FC, useState } from "react";
import { useGetLoanResponses } from "../../../api/useLoanRequestApi";
import { ApproveLoanModal } from "../../lenderDashboard/approveLoanModal";
import { LoadingPage } from "../../shared/loadingPage";
import { RsModal } from "../../shared/rsModal";
import { LoanResponsesList } from "../loanResponsesList";

interface Props {
  loanRequestId: string;
  onClose: () => void;
  refetch: () => void;
}

export const LoanResponsesModal: FC<Props> = ({ loanRequestId, onClose, refetch }) => {
  const [isAddingOffer, setIsAddingOffer] = useState(false);
  const { data: loanResponses = [], isLoading, refetch: refetchLoanResponses } = useGetLoanResponses(loanRequestId);

  const onRefresh = () => {
    refetchLoanResponses();
    refetch();
  };

  return (
    <RsModal title={"Loan Responses"} onClose={onClose} fullscreenOnMobile>
      {isAddingOffer && <ApproveLoanModal isAdmin id={loanRequestId} onClose={() => setIsAddingOffer(false)} />}

      {isLoading && <LoadingPage variant="overlay" />}

      <LoanResponsesList showActions loanResponses={loanResponses} refetch={onRefresh} />
      <Button variant="soft" onClick={() => setIsAddingOffer(true)} sx={{ width: "150px", mt: 2 }}>
        Add offer
      </Button>
    </RsModal>
  );
};
