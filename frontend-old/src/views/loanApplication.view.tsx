import { Box, ListItemDecorator } from '@mui/joy';
import { LoanRequestTypeEnum } from '@roshi/shared';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LoanApplication } from '../components/application/loanApplication';
import { useVisitorContext } from '../context/visitorContext';

interface Props {
  loanRequestType: LoanRequestTypeEnum;
}

export const LoanApplicationView = ({ loanRequestType }: Props) => {
  const [params] = useSearchParams();
  const { init } = useVisitorContext();
  const referrer = params.get('referrer');

  useEffect(() => {
    init(loanRequestType, referrer || undefined);
  }, []);

  return <LoanApplication />;
};

export const GreenDot = () => (
  <ListItemDecorator sx={{ justifyContent: 'center' }}>
    <Box sx={{ height: 6, width: 6, background: '#1AC577', borderRadius: '100%' }}></Box>
  </ListItemDecorator>
);
