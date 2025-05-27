import { useParams } from "react-router-dom";
import { LoadingPage } from "../components/shared/loadingPage";
import { ApplicationDetailsWrapper } from "../components/userDashboard/applicationDetailsWrapper";

export const ApplicantInfoView = () => {
  const id = useParams().id;
  if (!id) return <LoadingPage variant="overlay" />;
  return <ApplicationDetailsWrapper loanRequestId={id} onClose={() => {}} />;
};
