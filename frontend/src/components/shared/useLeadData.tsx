import {
  CompanyStatusEnum,
  CompanyTypeEnum,
  DocumentVerificationStatusEnum,
  LoanResponseStatusEnum,
  StatusEnum,
} from "@roshi/shared";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminLead, useGetCompanies } from "../../api/useAdminApi";
import { AppointmentsList } from "../adminDashboard/leadsTable/appointmentsList";
import { LeadDocumentsModal } from "../adminDashboard/leadsTable/leadDocumentsModal";
import { LoanResponsesModal } from "../adminDashboard/leadsTable/loanResponsesModal";
import { UpdateNoteModal } from "../adminDashboard/updateNoteModal";
import { MlcbReportModal } from "../lenderDashboard/mlcbReportModal";
import { OfferPreview } from "../lenderDashboard/offerPreview";
import { ActivityLogsModal } from "../userDashboard/activityLogsModal";
import { ApplicationDetailsWrapper } from "../userDashboard/applicationDetailsWrapper";
import { DocumentVerificationModal } from "./documentVerificationModal";
import { SingpassInfoModalWrapper } from "./singpassInfoModalWrapper";

type ModalType =
  | "documents"
  | "responses"
  | "appointments"
  | "logs"
  | "verifydoc"
  | "privateNote"
  | "publicNote"
  | "details"
  | "closedDealOffer"
  | "singpass"
  | "mlcbReport"
  | "NotesFromROSHI";

interface Props {
  loanRequest: AdminLead;
  refetch: () => void;
}

export const useLeadData = ({ loanRequest, refetch }: Props) => {
  const { data: companies } = useGetCompanies({
    filters: { status: CompanyStatusEnum.ACTIVE, type: CompanyTypeEnum.MONEYLENDER },
  });

  const [searchParams, setSearchParams] = useSearchParams();

  const currentModal = searchParams.get("id") === loanRequest.id ? searchParams.get("modal") : undefined;

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
        searchParams.set("id", loanRequest.id);
        searchParams.set("selected", loanRequest.id);
        return searchParams;
      }),
    [loanRequest.id, setSearchParams]
  );

  const responsesWithAppointment = useMemo(
    () =>
      loanRequest.loanResponses.filter(
        (res) => res.appointment && res.outcomeStatus === StatusEnum.PENDING && !res.appointment.cancelledAt
      ),
    [loanRequest.loanResponses]
  );

  const [accepted, rejected, pending] = useMemo(() => {
    const accepted = loanRequest.loanResponses.filter((res) => res.status === LoanResponseStatusEnum.ACCEPTED).length;
    const rejected = loanRequest.loanResponses.filter((res) => res.status === LoanResponseStatusEnum.REJECTED).length;
    const pending = companies ? companies.length - accepted - rejected : 0;
    return [accepted, rejected, pending];
  }, [loanRequest.loanResponses, companies]);

  const acceptedOffers = useMemo(
    () => loanRequest.loanResponses.filter((res) => res.acceptedAt && res.outcomeStatus !== StatusEnum.REJECTED),
    [loanRequest.loanResponses]
  );

  const unverifiedDocuments = useMemo(
    () =>
      loanRequest.applicantInfo?.documents?.filter(
        (doc) => doc.humanVerificationStatus === DocumentVerificationStatusEnum.NOT_VERIFIED
      ) || [],
    [loanRequest.applicantInfo?.documents]
  );

  const offer = useMemo(() => {
    return loanRequest?.loanResponses.find((res) => res.outcomeStatus === StatusEnum.APPROVED)?.closedDealOffer || null;
  }, [loanRequest?.loanResponses]);

  const renderModal = useCallback(() => {
    switch (currentModal) {
      case undefined:
        return null;
      case "details":
        return <ApplicationDetailsWrapper loanRequestId={loanRequest.id} onClose={closeModal} />;
      case "privateNote":
      case "publicNote":
        return <UpdateNoteModal type={currentModal} refetch={refetch} application={loanRequest} onClose={closeModal} />;
      case "documents":
        return (
          <LeadDocumentsModal
            refetch={refetch}
            loanRequest={loanRequest}
            onClose={closeModal}
            onVerify={() => {
              openModal("verifydoc");
            }}
          />
        );
      case "responses":
        return <LoanResponsesModal loanRequestId={loanRequest.id} refetch={refetch} onClose={closeModal} />;
      case "appointments":
        return <AppointmentsList refetch={refetch} loanResponses={responsesWithAppointment} onClose={closeModal} />;
      case "logs":
        return <ActivityLogsModal loanRequestId={loanRequest.id} onClose={closeModal} />;
      case "verifydoc":
        return <DocumentVerificationModal documents={unverifiedDocuments} onClose={closeModal} />;
      case "closedDealOffer":
        return <OfferPreview onClose={closeModal} offer={offer || undefined} isClosedDeal />;
      case "NotesFromROSHI":
        return <OfferPreview onClose={closeModal} offer={offer || undefined} isClosedDeal />;
      case "singpass":
        return <SingpassInfoModalWrapper loanRequestId={loanRequest.id} onClose={closeModal} />;
      case "mlcbReport":
        return <MlcbReportModal loanRequestId={loanRequest.id} onClose={closeModal} />;
      default:
        return null;
    }
  }, [closeModal, currentModal, loanRequest, openModal, refetch, responsesWithAppointment, unverifiedDocuments, offer]);

  return {
    openModal,
    responsesWithAppointment,
    unverifiedDocuments,
    renderModal,
    acceptedOffers,
    accepted,
    rejected,
    pending,
  };
};
