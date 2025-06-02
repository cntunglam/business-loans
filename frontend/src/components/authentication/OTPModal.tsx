import { Button, FormControl, FormHelperText, Input, Link, Typography, useTheme } from '@mui/joy';
import { ErrorResponse } from '@roshi/shared';
import { AxiosError } from 'axios';
import { addSeconds } from 'date-fns';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOTPLogin, useSendOTP } from '../../api/useAccountApi';
import { TEST_IDS } from '../../utils/testUtils';
import { Countdown } from '../shared/countdown';
import { Flex } from '../shared/flex';
import { RsModal } from '../shared/rsModal';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  email: string;
  phone?: string;
}

export const OTPModal: FC<Props> = ({ email, onClose, onSuccess, phone }) => {
  const theme = useTheme();
  const [otp, setOtp] = useState('');
  const [lastSent, setLastSent] = useState(new Date());
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const sendOtp = useSendOTP();
  const otpLogin = useOTPLogin();
  const { t } = useTranslation();

  const handleSubmit = () => {
    otpLogin.mutate(
      { email, otp, phone },
      {
        onSuccess: () => {
          onSuccess();
        },
        onError: (err) => {
          if (err instanceof AxiosError) {
            const roshiErr = err.response?.data as ErrorResponse;
            console.log({ roshiErr });
            setError(roshiErr.error.code);
          }
        }
      }
    );
  };

  return (
    <RsModal onClose={onClose} title="Email verification" minWidth="500px">
      <Flex y gap2>
        <Typography>A verification code has been sent to your email</Typography>
        <FormControl error={!!error}>
          <Input
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              setError('');
            }}
            data-testid={TEST_IDS.otpInput}
          />
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
        <Button loading={otpLogin.isPending} onClick={handleSubmit} data-testid={TEST_IDS.submitOtpButton}>
          {t('submit')}
        </Button>
        <Link
          style={{ color: !canResend ? theme.palette.neutral[300] : undefined }}
          disabled={sendOtp.isPending || otpLogin.isPending || !canResend}
          onClick={() => {
            setLastSent(new Date());
            setCanResend(false);
            sendOtp.mutateAsync({ email });
          }}
        >
          {canResend ? (
            'Resend verification code'
          ) : (
            <>
              Haven't received email? Try again in: <Countdown endDate={addSeconds(lastSent, 60)} onEnd={() => setCanResend(true)} />{' '}
              seconds
            </>
          )}
        </Link>
      </Flex>
    </RsModal>
  );
};
