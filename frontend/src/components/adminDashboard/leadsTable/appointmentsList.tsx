import { SearchOff } from "@mui/icons-material";
import { Chip } from "@mui/joy";
import {
  AppointmentStatusEnum,
  AppointmentStatusEnumColors,
  AppointmentStatusEnumLabels,
  formatWithoutTz,
  Prisma,
} from "@roshi/shared";
import { FC, useEffect, useState } from "react";
import { Flex } from "../../shared/flex";
import { FlexGrid } from "../../shared/flexGrid";
import { PageMessage } from "../../shared/pageMessage";
import { RsModal } from "../../shared/rsModal";
import { AppointmentReviewModal } from "../../userDashboard/appointmentScheduling/appointmentReviewModal";

interface Props {
  loanResponses: Prisma.LoanResponseGetPayload<{
    select: {
      id: true;
      appointment: {
        select: {
          id: true;
          scheduledTime: true;
          status: true;
          openingHours: { include: { store: true } };
        };
      };
      lender: { select: { id: true; name: true; logo: true } };
      acceptedAt: true;
      outcomeStatus: true;
      status: true;
      closedDealOffer: true;
    };
  }>[];
  onClose: () => void;
  refetch: () => void;
}

export const AppointmentsList: FC<Props> = ({ loanResponses, onClose }) => {
  const [appointmentPreview, setAppointmentPreview] = useState<Props["loanResponses"][0]>();
  useEffect(() => {
    if (loanResponses.length === 1) {
      setAppointmentPreview(loanResponses[0]);
    }
  }, [loanResponses]);
  return (
    <>
      {appointmentPreview && (
        <AppointmentReviewModal
          isApplicant={false}
          offer={appointmentPreview}
          onClose={() => {
            if (loanResponses.length === 1) {
              return onClose();
            }
            setAppointmentPreview(undefined);
          }}
        />
      )}
      <RsModal onClose={onClose} title="Appointments" fullscreenOnMobile>
        {loanResponses.length === 0 ? (
          <PageMessage icon={<SearchOff />} text="No appointments found" />
        ) : (
          <Flex y gap1>
            {loanResponses.map((lr) => (
              <FlexGrid container key={lr.id} spacing={1} pointer hover onClick={() => setAppointmentPreview(lr)}>
                <FlexGrid xs>{lr.lender.name}</FlexGrid>
                <FlexGrid xs>
                  <Chip color={AppointmentStatusEnumColors[lr.appointment!.status as AppointmentStatusEnum]}>
                    {AppointmentStatusEnumLabels[lr.appointment!.status as AppointmentStatusEnum]}
                  </Chip>
                </FlexGrid>
                <FlexGrid xs={4} x xe>
                  {lr.appointment?.scheduledTime
                    ? formatWithoutTz(lr.appointment.scheduledTime, "dd MMM HH:mm")
                    : "Not scheduled"}
                </FlexGrid>
              </FlexGrid>
            ))}
          </Flex>
        )}
      </RsModal>
    </>
  );
};
