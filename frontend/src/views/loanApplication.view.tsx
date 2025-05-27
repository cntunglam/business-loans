import { Box, ListItemDecorator } from "@mui/joy";
import { LoanRequestTypeEnum } from "@roshi/shared";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ApplyModal } from "../components/application/applyModal/applyModal";
import { LoanApplication } from "../components/application/loanApplication";
import { useVisitorContext } from "../context/visitorContext";

interface Props {
  loanRequestType: LoanRequestTypeEnum;
}

export const LoanApplicationView = ({ loanRequestType }: Props) => {
  const [params] = useSearchParams();
  const { init, currentStepIndex } = useVisitorContext();
  const [isSingpassModalOpen, setIsSingpassModalOpen] = useState(false);
  const referer = params.get("referer");

  useEffect(() => {
    init(loanRequestType, referer || undefined).then((data) => {
      if (!data?.singpassData && !currentStepIndex) {
        setIsSingpassModalOpen(true);
      }
    });
  }, []);

  return (
    <>
      {isSingpassModalOpen && (
        <ApplyModal
          singpassOnly={loanRequestType === LoanRequestTypeEnum.ZERO_INTEREST}
          loanRequestType={loanRequestType}
          onClose={() => setIsSingpassModalOpen(false)}
        />
      )}
      <LoanApplication />
    </>
  );
};

export const GreenDot = () => (
  <ListItemDecorator sx={{ justifyContent: "center" }}>
    <Box sx={{ height: 6, width: 6, background: "#1AC577", borderRadius: "100%" }}></Box>
  </ListItemDecorator>
);
