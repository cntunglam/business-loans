import { Button, Typography } from "@mui/joy";
import { formatWithoutTz, Prisma } from "@roshi/shared";
import { FC } from "react";
import { useDeleteAppointment } from "../../../api/useAppointmentApi";
import { OpenDialog } from "../../../context/DialogContainer";
import { ASSETS } from "../../../data/assets";
import useMediaQueries from "../../../hooks/useMediaQueries";
import { Flex } from "../../shared/flex";
import { RsModal } from "../../shared/rsModal";
interface Props {
  offer: Prisma.LoanResponseGetPayload<{
    select: {
      lender: { select: { id: true; name: true; logo: true } };
      appointment: { select: { id: true; scheduledTime: true; openingHours: { select: { store: true } } } };
    };
  }>;
  isApplicant: boolean;
  onClose: () => void;
}

export const AppointmentReviewModal: FC<Props> = ({ offer, onClose, isApplicant }) => {
  const deleteAppointment = useDeleteAppointment();
  const { sm } = useMediaQueries(["sm"]);
  return (
    <RsModal onClose={onClose} minWidth="600px" fullscreenOnMobile>
      <Flex sx={{ position: "absolute", top: "12px", left: "20px" }}>
        <Typography
          sx={{
            fontWeight: "700",
            fontSize: "20px",
            cursor: "pointer",
            marginY: { md: 0, xs: "auto" },
            pl: 1.5,
          }}
        >
          Appointment Review
        </Typography>
      </Flex>
      <Flex y sx={{ gap: "10px" }} mt={1}>
        <Flex y gap1>
          <Typography level="h4" fontWeight={"700"}>
            {offer?.appointment?.openingHours?.store.name}
          </Typography>
          <Typography level="body-md">{offer?.appointment?.openingHours?.store?.address}</Typography>
        </Flex>
        {offer.appointment?.openingHours?.store.mapsEmbedUrl ? (
          <iframe src={offer.appointment?.openingHours?.store.mapsEmbedUrl} height={"275px"} style={{ border: 0 }} />
        ) : (
          <img
            src={offer.appointment?.openingHours?.store.imageUrl}
            height={"275px"}
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        )}
        <Flex y xsb gap2 wrap>
          <Flex y gap1 xc={!sm} fullwidth={!sm}>
            <Typography level="body-md">Upcoming appointment:</Typography>
            <Typography level="h4" textColor={"success.400"} fontWeight={"700"}>
              {offer.appointment?.scheduledTime &&
                formatWithoutTz(offer.appointment.scheduledTime, "dd MMMM yyyy HH:mm")}
            </Typography>
          </Flex>
          {!isApplicant && (
            <Flex x yc gap1 xc={!sm} fullwidth={!sm}>
              <img src={offer.lender.logo} width={"60px"} />
              <Typography level="title-lg" fontWeight={"700"}>
                {offer.lender.name}
              </Typography>
            </Flex>
          )}
        </Flex>

        <Button
          variant="soft"
          color="neutral"
          size="lg"
          loading={deleteAppointment.isPending}
          startDecorator={<img src={ASSETS.CANCEL_APPOINTMENT} />}
          onClick={() =>
            OpenDialog({
              type: "confirm",
              title: "Cancel appointment?",
              body: `Are you sure you want to cancel  ${!isApplicant ? `your appointment with ${offer.lender.name}` : "this appointment"}`,
              submit: () =>
                deleteAppointment.mutateAsync(offer.appointment!.id).then(() => {
                  onClose();
                }),
            })
          }
        >
          Cancel Appointment
        </Button>
      </Flex>
    </RsModal>
  );
};
