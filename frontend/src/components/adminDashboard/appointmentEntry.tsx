import { CopyAll } from "@mui/icons-material";
import { Chip, ColorPaletteProp, Link, Typography } from "@mui/joy";
import { formatWithoutTz, SgManualFormSchema, StatusEnum } from "@roshi/shared";
import { differenceInHours, format } from "date-fns";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useGetAllAppointmentsAdmin } from "../../api/useAdminApi";
import { formatRejectionReason } from "../../utils/rsUtils";
import { getCurrentTime } from "../../utils/utils";
import { CloseLoanModal } from "../lenderDashboard/closeLoanModal";
import { OfferPreview } from "../lenderDashboard/offerPreview";
import { CustomerSupportChip } from "../shared/customersupportChip";
import { Flex } from "../shared/flex";
import { RsModal } from "../shared/rsModal";

type ModalType = "closedDealOffer" | "setOutcome" | "rejectionReason";

interface Props {
  appointment: NonNullable<ReturnType<typeof useGetAllAppointmentsAdmin>["data"]>[0];
  refetch: () => void;
}

export const AppointmentEntry = ({ appointment, refetch }: Props) => {
  const { user, loanResponse } = useMemo(
    () => ({
      loanResponse: appointment.loanResponse,
      user: appointment.loanResponse.loanRequest.user,
      loanRequest: appointment.loanResponse.loanRequest,
    }),
    [appointment]
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const currentModal = searchParams.get("id") === appointment.id ? searchParams.get("modal") : undefined;
  const closeModal = useCallback(
    () =>
      setSearchParams((searchParams) => {
        searchParams.delete("modal");
        searchParams.delete("id");
        return searchParams;
      }),
    [setSearchParams]
  );
  const openModal = useCallback(
    (modalType: ModalType) =>
      setSearchParams((searchParams) => {
        searchParams.set("modal", modalType);
        searchParams.set("id", appointment.id);
        return searchParams;
      }),
    [appointment.id, setSearchParams]
  );

  const renderModal = () => {
    switch (currentModal) {
      case "rejectionReason":
        return (
          <RsModal title="Rejection reason" onClose={closeModal}>
            {formatRejectionReason(appointment.loanResponse)}
          </RsModal>
        );
      case "closedDealOffer":
        return (
          <>
            {loanResponse.closedDealOffer && (
              <OfferPreview onClose={closeModal} offer={loanResponse.closedDealOffer} isClosedDeal />
            )}
          </>
        );
      case "setOutcome":
        return (
          <CloseLoanModal
            onClose={() => {
              closeModal();
              refetch();
            }}
            loanRequestId={appointment.loanResponse.loanRequestId}
            loanResponse={appointment.loanResponse}
          />
        );
    }
  };

  const status = useMemo(() => {
    //Gets current time in SG timezone
    const now = getCurrentTime();
    if (appointment.cancelledAt) return { color: "danger", label: "Cancelled" };
    if (!appointment.scheduledTime) return { color: "danger", label: "Not scheduled" };
    const hoursDiff = differenceInHours(now, appointment.scheduledTime);
    if (loanResponse.outcomeStatus !== StatusEnum.PENDING) return { color: "success", label: "Settled" };
    if (hoursDiff < 0) return { color: "neutral", label: "Upcoming" };
    if (hoursDiff < 1) return { color: "warning", label: "Ongoing" };
    return { color: "danger", label: "Overdue" };
  }, [appointment.scheduledTime, loanResponse.outcomeStatus, appointment.cancelledAt]);

  const outcome = useMemo(() => {
    if (appointment.cancelledAt) return { color: "danger", label: "Cancelled" };
    if (!appointment.scheduledTime) return { color: "danger", label: "Not scheduled" };
    if (loanResponse.outcomeStatus === StatusEnum.REJECTED)
      return { color: "danger", label: "Lost", id: StatusEnum.REJECTED };
    if (loanResponse.outcomeStatus === StatusEnum.APPROVED)
      return { color: "success", label: "Won", id: StatusEnum.APPROVED };
    return { color: "neutral", label: "Pending", id: StatusEnum.PENDING };
  }, [appointment.cancelledAt, appointment.scheduledTime, loanResponse.outcomeStatus]);

  const applicantInfo = useMemo(
    () => SgManualFormSchema.safeParse(appointment.loanResponse.loanRequest.applicantInfo?.data).data,
    [appointment.loanResponse.loanRequest.applicantInfo]
  );
  return (
    <>
      {currentModal && renderModal()}
      <tr key={appointment.id}>
        <td>{format(appointment.createdAt, "dd MMM HH:mm")}</td>
        <td>{applicantInfo?.fullname}</td>
        <td>
          <Flex x yc gap1>
            <CopyAll
              sx={{ fontSize: "1rem", cursor: "pointer", ":hover": { color: "primary.500" } }}
              onClick={() => {
                if (!user.phone) return toast.error("No phone found");
                navigator.clipboard.writeText(user.phone || "");
                toast.success("Phone number copied to clipboard");
              }}
            />
            <Link color="neutral" component="a" href={`/admin/chat?targetId=${user.phone}`} target="_blank">
              {user.phone}
            </Link>
          </Flex>
        </td>
        <td>{appointment.loanResponse.lender.name}</td>
        <td>
          <Link color="neutral" href={appointment.openingHours?.store.mapsUrl} target="_blank">
            {appointment.openingHours?.store.name}
          </Link>
        </td>
        <td>
          {appointment?.scheduledTime
            ? `${formatWithoutTz(appointment.scheduledTime, "dd MMM HH:mm")}`
            : "Requested for appointment"}
        </td>
        <td>
          <CustomerSupportChip
            customerSupport={appointment.loanResponse.loanRequest.customerSupport}
            loanRequestId={appointment.loanResponse.loanRequestId}
          />
        </td>
        <td>
          <Typography sx={{ fontSize: "sm" }}>{appointment.loanResponse.loanRequest.privateNote}</Typography>
        </td>
        <td>
          <Chip variant="soft" color={status.color as ColorPaletteProp}>
            {status.label}
          </Chip>
        </td>
        <td>
          <Chip
            onClick={() =>
              openModal(
                outcome.id === StatusEnum.APPROVED
                  ? "closedDealOffer"
                  : outcome.id === StatusEnum.REJECTED
                    ? "rejectionReason"
                    : "setOutcome"
              )
            }
            variant="soft"
            color={outcome.color as ColorPaletteProp}
          >
            {outcome.label}
          </Chip>
        </td>
      </tr>
    </>
  );
};
