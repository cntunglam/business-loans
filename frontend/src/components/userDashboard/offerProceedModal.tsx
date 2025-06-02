import { Button, Link as JoyLink, Typography } from "@mui/joy";
import { calculateEMI } from "@roshi/shared";
import { FC } from "react";
import { useTranslation } from 'react-i18next';
import { loanResponse } from "../../api/useLoanRequestApi";
import { formatToDisplayString } from "../../utils/utils";
import { formatApplicationData } from "../shared/applicationDataFormatter";
import { Flex } from "../shared/flex";
import { FlexGrid } from "../shared/flexGrid";
import { RsModal } from "../shared/rsModal";
import { TitleAndValue } from "../shared/titleAndValue";

interface Props {
  loanResponse: loanResponse;
  refetch: () => void;
  onClose: () => void;
  onBookAppointment: () => void;
}

export const OfferProceedModal: FC<Props> = ({ loanResponse, onClose, onBookAppointment }: Props) => {
  const { t } = useTranslation();
  return (
    <RsModal onClose={onClose} fullscreenOnMobile={false} disableClickOutside={true}>
      <FlexGrid container spacing={2}>
        <FlexGrid xs>
          <img
            src={loanResponse?.lender?.logo}
            alt="lender-logo"
            width={"100%"}
            style={{ objectFit: "contain", maxHeight: "100px" }}
          />
        </FlexGrid>
        {loanResponse?.lender?.description && (
          <FlexGrid md={9}>
            <Typography level="body-sm">{loanResponse?.lender?.description}</Typography>
          </FlexGrid>
        )}
      </FlexGrid>
      <>
        <FlexGrid container spacing={4} sx={{ flexGrow: 1, mt: 2 }} yc>
          <TitleAndValue
            title={t("form:offer-proceed.apply")}
            value={formatApplicationData({ property: "amount", value: loanResponse?.loanOffer?.amount })}
          />
          <TitleAndValue
            title={t("form:offer-proceed.monthly")}
            value={formatApplicationData({
              property: "interestRate",
              value: loanResponse?.loanOffer?.monthlyInterestRate,
            })}
          />
          <TitleAndValue
            title={t("form:offer-proceed.tenure")}
            value={formatApplicationData({ property: "term", value: loanResponse?.loanOffer?.term })}
          />
          <TitleAndValue
            title={t("form:offer-proceed.instalment")}
            value={`$${formatToDisplayString(
              calculateEMI(
                Number(loanResponse?.loanOffer?.amount),
                Number(loanResponse.loanOffer?.monthlyInterestRate) / 100,
                Number(loanResponse.loanOffer?.term)
              ),
              2
            )}`}
          />
          <TitleAndValue
            title={t("form:offer-proceed.processing")}
            value={formatApplicationData({
              property: "amount",
              value:
                loanResponse.loanOffer &&
                loanResponse.loanOffer.amount * (loanResponse.loanOffer.variableUpfrontFees / 100 || 0) +
                  loanResponse.loanOffer.fixedUpfrontFees,
            })}
          />
        </FlexGrid>
        <Flex y xc gap2 mt={4}>
          <Button onClick={() => onBookAppointment()} sx={{ width: "200px" }}>
             {t("form:offer-proceed.appointment")}
          </Button>

          <JoyLink color="neutral" onClick={onClose}>
            {t("form:offer-proceed.go-back")}
          </JoyLink>
        </Flex>
      </>
    </RsModal>
  );
};
