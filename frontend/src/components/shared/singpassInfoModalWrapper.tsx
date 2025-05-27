import { useViewSingpassData } from "../../api/useLoanRequestApi";
import { SingpassInfoModal } from "./singpassInfoModal";

interface Props {
  onClose: () => void;
  loanRequestId: string;
}

export const SingpassInfoModalWrapper = ({ loanRequestId, onClose }: Props) => {
  const { data } = useViewSingpassData(loanRequestId);
  return <SingpassInfoModal onClose={onClose} singpassData={data?.data?.singpassData} />;
};
