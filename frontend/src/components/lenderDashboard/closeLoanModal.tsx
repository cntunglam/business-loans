import { Option, Select } from "@mui/joy";
import { Prisma } from "@roshi/shared";
import { StatusEnum } from "@roshi/shared/models/databaseEnums";
import { FC, useState } from "react";
import { Flex } from "../shared/flex";
import { RsModal } from "../shared/rsModal";
import { ApproveLoanModal } from "./approveLoanModal";
import { RejectLoanModal } from "./rejectLoanModal";

interface Props {
  onClose: () => void;
  loanResponse: Prisma.LoanResponseGetPayload<{ select: { id: true; loanOffer: true } }>;
  loanRequestId: string;
}

export const CloseLoanModal: FC<Props> = ({ onClose, loanRequestId, loanResponse }) => {
  const [option, setOption] = useState<StatusEnum.APPROVED | StatusEnum.REJECTED | undefined>(undefined);
  return (
    <RsModal onClose={onClose} title="Close loan request" minWidth="500px" padding="sm">
      <Flex y gap2 my={2}>
        <Select
          sx={{ padding: "10px 12px" }}
          placeholder="What was the outcome?"
          value={option}
          onChange={(_, val) => setOption(val || undefined)}
        >
          <Option value={StatusEnum.APPROVED}>Approved</Option>
          <Option value={StatusEnum.REJECTED}>Rejected</Option>
        </Select>
        {option === StatusEnum.APPROVED && (
          <ApproveLoanModal
            onSuccess={() => onClose()}
            loanResponse={loanResponse}
            onClose={() => setOption(undefined)}
            id={loanRequestId}
            disableClickOutside
          />
        )}
        {option === StatusEnum.REJECTED && (
          <RejectLoanModal
            onSuccess={() => onClose()}
            loanResponseId={loanResponse?.id}
            onClose={() => setOption(undefined)}
            id={loanRequestId}
            disableClickOutside
          />
        )}
      </Flex>
    </RsModal>
  );
};
