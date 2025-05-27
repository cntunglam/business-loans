import { Button, IconButton, Tooltip } from "@mui/joy";
import { StatusEnum } from "@roshi/shared";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FC, useCallback, useMemo } from "react";
import { useDeleteLoanOffer } from "../../api/useLoanOfferApi";
import { LenderDashboardApplication, useGetLoanRequestsQueryKey } from "../../api/useLoanRequestApi";
import { OpenDialog } from "../../context/DialogContainer";
import { useModals } from "../../hooks/useModals";
import CalendarIcon from "../icons/calendarIcon";
import CalendarTickIcon from "../icons/calendarTickIcon";
import CallIcon from "../icons/callIcon";
import CloseCircleIcon from "../icons/closeCircleIcon";
import DartIcon from "../icons/dartIcon";
import EyeIcon from "../icons/eyeIcon";
import { Flex } from "../shared/flex";
import { RsTooltip } from "../shared/rsTooltip";
import { AppointmentReviewModal } from "../userDashboard/appointmentScheduling/appointmentReviewModal";
import { ScheduleAppointmentModal } from "../userDashboard/appointmentScheduling/scheduleAppointmentModal";
import { ApproveLoanModal } from "./approveLoanModal";
import { CloseLoanModal } from "./closeLoanModal";
import { ContactInformationModal } from "./contactInformationModal";
import { OfferPreview } from "./offerPreview";
import { RejectLoanModal } from "./rejectLoanModal";

interface Props {
  application: LenderDashboardApplication;
}

export const OfferActions: FC<Props> = ({ application }) => {
  const queryClient = useQueryClient();
  const refetch = useCallback(() => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        return query.queryKey[0] === useGetLoanRequestsQueryKey;
      },
    });
  }, [queryClient]);
  const deleteLoanOffer = useDeleteLoanOffer();

  const loanResponse = useMemo(() => {
    return application?.loanResponses && application?.loanResponses.length > 0 ? application.loanResponses[0] : null;
  }, [application]);

  const { openModal, renderModal } = useModals(
    application.id,
    {
      close: (onClose) =>
        loanResponse && <CloseLoanModal onClose={onClose} loanRequestId={application.id} loanResponse={loanResponse} />,
      appointment: (onClose) =>
        loanResponse && <AppointmentReviewModal offer={loanResponse} isApplicant={false} onClose={onClose} />,
      schedule: (onClose) => loanResponse && <ScheduleAppointmentModal loanResponse={loanResponse} onClose={onClose} />,
      offerPreview: (onClose) =>
        loanResponse?.loanOffer && (
          <OfferPreview isClosedDeal={false} onClose={onClose} offer={loanResponse.loanOffer} />
        ),
      contactBorrower: (onClose) =>
        loanResponse && <ContactInformationModal onClose={onClose} loanResponseId={loanResponse.id} />,
      approve: (onClose) => (
        <ApproveLoanModal loanResponse={loanResponse || undefined} onClose={onClose} id={application.id} />
      ),
      reject: (onClose) => <RejectLoanModal loanResponseId={loanResponse?.id} onClose={onClose} id={application.id} />,
    },
    () => refetch()
  );

  return (
    <Flex x yc wrap>
      {renderModal()}
      {!loanResponse ? (
        <Flex x fullwidth gap1 p={1}>
          <Button
            sx={{ border: "1px solid #1AC577", background: "#F2FFF9", color: "#1AC577" }}
            variant="soft"
            fullWidth
            onClick={() => {
              openModal("approve");
            }}
          >
            Offer
          </Button>
          <Button
            sx={{ border: "1px solid #CC2A18", background: "#FFF6F5", color: "#CC2A18" }}
            variant="soft"
            color="danger"
            fullWidth
            onClick={() => openModal("reject")}
          >
            Reject
          </Button>
        </Flex>
      ) : (
        <Flex
          x
          yc
          gap1
          p={1}
          sx={{ flexWrap: { xs: "wrap", sm: "nowrap" }, justifyContent: { xs: "flex-end", md: "flex-start" } }}
        >
          {loanResponse.acceptedAt && loanResponse.outcomeStatus === StatusEnum.PENDING && (
            <RsTooltip title="Reveal contact information">
              <IconButton
                sx={{ background: "none" }}
                variant="soft"
                color="secondary"
                onClick={() => openModal("contactBorrower")}
              >
                <CallIcon />
              </IconButton>
            </RsTooltip>
          )}

          {loanResponse?.loanOffer && (
            <>
              <RsTooltip title="View offer information">
                <IconButton
                  sx={{ background: "none" }}
                  variant="soft"
                  color="link"
                  onClick={() => openModal("offerPreview")}
                >
                  <EyeIcon />
                </IconButton>
              </RsTooltip>
            </>
          )}

          {loanResponse.outcomeStatus === StatusEnum.PENDING && loanResponse.acceptedAt && (
            <Flex x gap1 yc sx={{ flexDirection: { xs: "column", sm: "row", md: "row" } }}>
              {loanResponse?.appointment ? (
                <Tooltip
                  title={format(loanResponse?.appointment?.scheduledTime as Date, "dd/MM/yy HH:mm")}
                  placement="top"
                >
                  <IconButton
                    sx={{ background: "none" }}
                    variant="soft"
                    color="primary"
                    onClick={() => openModal("appointment")}
                  >
                    <CalendarTickIcon color="primary" />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Set Appointment" placement="top">
                  <IconButton
                    sx={{ background: "none" }}
                    variant="soft"
                    color="primary"
                    onClick={() => openModal("schedule")}
                  >
                    <CalendarIcon color="primary" />
                  </IconButton>
                </Tooltip>
              )}
            </Flex>
          )}

          {!loanResponse.acceptedAt && loanResponse.outcomeStatus === StatusEnum.PENDING && (
            <Tooltip title="Discard Offer">
              <IconButton
                sx={{ background: "none" }}
                variant="soft"
                color="error"
                onClick={() =>
                  OpenDialog({
                    type: "discard",
                    title: "Discard Offer",
                    body: "Are you sure you want to discard this offer? This offer will be removed permanently.",
                    submit: () => deleteLoanOffer.mutateAsync(loanResponse.id).then(() => refetch()),
                  })
                }
              >
                <CloseCircleIcon />
              </IconButton>
            </Tooltip>
          )}

          {loanResponse.acceptedAt && loanResponse.outcomeStatus === StatusEnum.PENDING && (
            <Tooltip title="Close offer">
              <IconButton sx={{ background: "none" }} variant="soft" color="error" onClick={() => openModal("close")}>
                <DartIcon />
              </IconButton>
            </Tooltip>
          )}
        </Flex>
      )}
    </Flex>
  );
};
