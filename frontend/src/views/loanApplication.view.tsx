import { LoanApplication } from '../components/application/loanApplication';
import { VisitorProvider } from '../context/visitorContext';

export const LoanApplicationView = () => {
  return (
    <VisitorProvider>
      <LoanApplication />
    </VisitorProvider>
  );
};
