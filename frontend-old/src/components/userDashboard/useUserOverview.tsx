import { useSearchParams } from 'react-router-dom';
import { loanResponse } from '../../api/useLoanRequestApi';
import { AppointmentReviewModal } from './appointmentScheduling/appointmentReviewModal';
import { ScheduleAppointmentModal } from './appointmentScheduling/scheduleAppointmentModal';
import { OfferProceedModal } from './offerProceedModal';

export type UserOverviewModalType = 'appointment' | 'schedule' | 'details';

interface Props {
  loanResponses: loanResponse[];
  refetch: () => void;
}

export const useUserOverview = ({ loanResponses, refetch }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const openModal = (loanResponseId: string, modal: UserOverviewModalType) => {
    setSearchParams({ modal: modal, loanResponseId });
  };

  const closeModal = () => {
    setSearchParams({});
  };

  const loanResponseId = searchParams.get('loanResponseId');
  const currentModal = searchParams.get('modal');

  const renderModal = () => {
    const loanResponse = loanResponses?.find((res) => res.id === loanResponseId);
    if (!loanResponse) return null;
    switch (currentModal) {
      case 'appointment':
        return (
          <AppointmentReviewModal
            isApplicant={true}
            offer={loanResponse}
            onClose={() => {
              setSearchParams({});
              refetch();
            }}
          />
        );
      case 'schedule':
        return (
          <ScheduleAppointmentModal
            loanResponse={loanResponse}
            onClose={() => {
              setSearchParams({});
              refetch();
            }}
          />
        );
      case 'details':
        return (
          <OfferProceedModal
            loanResponse={loanResponse}
            refetch={refetch}
            onClose={closeModal}
            onBookAppointment={() => {
              openModal(loanResponse.id, 'schedule');
            }}
          />
        );
      default:
        return null;
    }
  };

  return { renderModal, openModal, closeModal };
};
