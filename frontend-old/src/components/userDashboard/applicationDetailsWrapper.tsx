import { ErrorOutline } from '@mui/icons-material';
import { FC } from 'react';
import { useGetLoanRequestById } from '../../api/useLoanRequestApi';
import { LoadingPage } from '../shared/loadingPage';
import { PageMessage } from '../shared/pageMessage';
import { ApplicationDetailsModal } from './applicationDetailsModal';

interface Props {
  onClose: () => void;
  loanRequestId: string;
}

export const ApplicationDetailsWrapper: FC<Props> = ({ loanRequestId, onClose }) => {
  const { data } = useGetLoanRequestById(loanRequestId);
  if (!data) return <LoadingPage variant="overlay" />;
  if (!data.applicantInfo) return <PageMessage text="Application not found" icon={<ErrorOutline />} />;
  return (
    <ApplicationDetailsModal
      title={data?.id || ''}
      applicantInfo={data.applicantInfo}
      onClose={onClose}
      loanRequest={data}
      documents={data.applicantInfo?.documents}
    />
  );
};
