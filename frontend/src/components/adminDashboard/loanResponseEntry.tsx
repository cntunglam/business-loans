import { MoreHoriz, PrecisionManufacturing } from "@mui/icons-material";
import { Chip, Dropdown, Menu, MenuButton, MenuItem } from "@mui/joy";
import { LoanResponseStatusEnum, NonNullRT, StatusEnum } from "@roshi/shared";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useUpdateLoanResponseAdmin } from "../../api/useAdminApi";
import { useDeleteLoanOffer, useRemoveOutcome } from "../../api/useLoanOfferApi";
import { useGetLoanResponses } from "../../api/useLoanRequestApi";
import { OpenDialog } from "../../context/DialogContainer";
import { formatRejectionReason } from "../../utils/rsUtils";
import { CloseLoanModal } from "../lenderDashboard/closeLoanModal";
import { formatApplicationData } from "../shared/applicationDataFormatter";
import { FlexGrid } from "../shared/flexGrid";
import { RsTooltip } from "../shared/rsTooltip";
import { ScheduleAppointmentModal } from "../userDashboard/appointmentScheduling/scheduleAppointmentModal";

interface Props {
  response: NonNullRT<typeof useGetLoanResponses>[number];
  showActions?: boolean;
  refetch: () => void;
}

export const LoanResponseEntry = ({ response, refetch, showActions }: Props) => {
  const [schedulingAppointment, setSchedulingAppointment] = useState(false);
  const [closingLead, setClosingLead] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const updateLoanResponse = useUpdateLoanResponseAdmin();
  const deleteOffer = useDeleteLoanOffer();
  const removeOutcome = useRemoveOutcome();

  const hasAcctiveAppointment = response.appointment && !response.appointment.cancelledAt;

  return (
    <>
      {schedulingAppointment && (
        <ScheduleAppointmentModal
          loanResponse={response}
          onClose={() => {
            setSchedulingAppointment(false);
            refetch();
          }}
        />
      )}
      {closingLead && (
        <CloseLoanModal
          onClose={() => {
            setClosingLead(false);
            refetch();
          }}
          loanResponse={response}
          loanRequestId={response.loanRequestId}
        />
      )}
      <FlexGrid container yc spacing={1} mb={0.5}>
        <FlexGrid xs={4}>{response.lender.name}</FlexGrid>

        <FlexGrid xs>
          {response.status === LoanResponseStatusEnum.ACCEPTED && response.outcomeStatus === StatusEnum.PENDING && (
            <Chip
              onClick={
                hasAcctiveAppointment
                  ? () => setSearchParams({ modal: "appointments", id: searchParams.get("id") || "" })
                  : undefined
              }
              color={response.acceptedAt ? "success" : "warning"}
              startDecorator={response.isAuto ? <PrecisionManufacturing /> : undefined}
            >
              {hasAcctiveAppointment ? "Scheduled" : response.acceptedAt ? "Accepted" : "Offer given"}
            </Chip>
          )}
          {response.status === LoanResponseStatusEnum.REJECTED && response.outcomeStatus === StatusEnum.PENDING && (
            <Chip color="danger">Rejected</Chip>
          )}
          {response.outcomeStatus !== StatusEnum.PENDING && (
            <RsTooltip title={formatRejectionReason(response)}>
              <Chip color={response.outcomeStatus === StatusEnum.APPROVED ? "primary" : "danger"}>
                {response.outcomeStatus === StatusEnum.APPROVED ? "Won" : "Lost"}
              </Chip>
            </RsTooltip>
          )}
        </FlexGrid>

        {response.status === LoanResponseStatusEnum.REJECTED && (
          <FlexGrid xs={5}>{formatRejectionReason(response)}</FlexGrid>
        )}
        {response.status === LoanResponseStatusEnum.ACCEPTED && (
          <FlexGrid xs={2} y xc>
            {formatApplicationData({ property: "amount", value: response.loanOffer?.amount })} -{" "}
            {formatApplicationData({ property: "interestRate", value: response.loanOffer?.monthlyInterestRate })}
          </FlexGrid>
        )}
        {response.status === LoanResponseStatusEnum.ACCEPTED && (
          <FlexGrid xs={2} y xe>
            {formatApplicationData({ property: "term", value: response.loanOffer?.term })}
          </FlexGrid>
        )}

        {showActions && (
          <FlexGrid xs={1} xe>
            <Dropdown>
              <MenuButton size="sm">
                <MoreHoriz />
              </MenuButton>
              {response.outcomeStatus === StatusEnum.PENDING && (
                <Menu>
                  {response.acceptedAt && (
                    <MenuItem
                      onClick={() => {
                        setClosingLead(true);
                      }}
                    >
                      Set outcome
                    </MenuItem>
                  )}
                  {response.acceptedAt && !hasAcctiveAppointment && (
                    <MenuItem onClick={() => setSchedulingAppointment(true)}>Schedule appointment</MenuItem>
                  )}
                  {response.status === LoanResponseStatusEnum.ACCEPTED && (
                    <MenuItem
                      onClick={() =>
                        OpenDialog({
                          type: "confirm",
                          title: response.acceptedAt ? "Cancel accepted offer?" : "Accept offer?",
                          body: response.acceptedAt
                            ? "Are you sure you want to cancel this offer that was accepted? Lender may have already seen the phone number and contacted the borrower"
                            : "Are you sure you want to accept this offer on behalf of the borrower? This will reveal the phone number to the lender.",
                          submit: () =>
                            updateLoanResponse
                              .mutateAsync({ id: response.id, isAccepted: !response.acceptedAt })
                              .then(() => refetch()),
                        })
                      }
                    >
                      {response.acceptedAt ? "Undo accept offer" : "Accept offer"}
                    </MenuItem>
                  )}
                  <MenuItem
                    onClick={() =>
                      OpenDialog({
                        type: "confirm",
                        title: "Delete offer?",
                        body: "Are you sure you want to delete this offer?",
                        submit: () => deleteOffer.mutateAsync(response.id).then(() => refetch()),
                      })
                    }
                  >
                    Cancel offer
                  </MenuItem>
                </Menu>
              )}
              {response.outcomeStatus !== StatusEnum.PENDING && (
                <Menu>
                  <MenuItem
                    onClick={() =>
                      OpenDialog({
                        type: "confirm",
                        title: "Cancel outcome?",
                        body: "Are you sure you want to remove outcome of this offer?",
                        submit: () => removeOutcome.mutateAsync(response.id).then(() => refetch()),
                      })
                    }
                  >
                    Cancel outcome
                  </MenuItem>
                </Menu>
              )}
            </Dropdown>
          </FlexGrid>
        )}
      </FlexGrid>
    </>
  );
};
