import { Button, FormControl, FormHelperText, Input, Link, Typography, useTheme } from "@mui/joy";
import { ErrorResponse } from "@roshi/shared";
import { AxiosError } from "axios";
import { addSeconds } from "date-fns";
import { FC, useState } from "react";
import { useOTPLoginWithPhone, useSendWhatsappOTP } from "../../api/useAccountApi";
import { Countdown } from "../shared/countdown";
import { Flex } from "../shared/flex";
import { RsModal } from "../shared/rsModal";
interface Props {
  onClose: () => void;
  onSuccess: () => void;
  phone: string;
}

export const WhatsappOTPModal: FC<Props> = ({ phone, onClose, onSuccess }) => {
  const theme = useTheme();
  const [otp, setOtp] = useState("");
  const [lastSent, setLastSent] = useState(new Date());
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const sendOtp = useSendWhatsappOTP();
  const otpLogin = useOTPLoginWithPhone();

  const handleSubmit = () => {
    otpLogin
      .mutateAsync({ phone, otp })
      .then(() => onSuccess())
      .catch((err) => {
        if (err instanceof AxiosError) {
          const roshiErr = err.response?.data as ErrorResponse;
          setError(roshiErr.error.code);
        }
      });
  };

  return (
    <RsModal onClose={onClose} title="Whatsapp verification" minWidth="500px">
      <Flex y gap2>
        <Typography>A verification code has been sent to your whatsapp</Typography>
        <FormControl error={!!error}>
          <Input
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              setError("");
            }}
          />
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
        <Button loading={otpLogin.isPending} onClick={handleSubmit}>
          Submit
        </Button>
        <Link
          style={{ color: !canResend ? theme.palette.neutral[300] : undefined }}
          disabled={sendOtp.isPending || otpLogin.isPending || !canResend}
          onClick={() => {
            setLastSent(new Date());
            setCanResend(false);
            sendOtp.mutateAsync({ phone });
          }}
        >
          {canResend ? (
            "Resend verification code"
          ) : (
            <>
              Haven't received message? Try again in:{" "}
              <Countdown endDate={addSeconds(lastSent, 60)} onEnd={() => setCanResend(true)} /> seconds
            </>
          )}
        </Link>
      </Flex>
    </RsModal>
  );
};
