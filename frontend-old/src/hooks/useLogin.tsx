import { emailSchema } from '@roshi/shared';
import { useSendOTP } from '../api/useAccountApi';

export const useLogin = ({ onSuccess, onError }: { onSuccess: () => void; onError: () => void }) => {
  const sendOTP = useSendOTP();

  const handleLogin = async (email: string) => {
    const validEmail = emailSchema.safeParse(email).success;
    if (!validEmail) {
      onError();
      return;
    }
    try {
      await sendOTP.mutateAsync({ email }).then();
    } finally {
      onSuccess();
    }
  };

  return { handleLogin, isLoading: sendOTP.isPending };
};
