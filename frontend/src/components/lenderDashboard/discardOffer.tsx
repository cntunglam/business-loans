import { LoanOffer } from "@roshi/shared";
import { FC } from "react";
import { RsModal } from "../shared/rsModal";

interface Props {
  onClose: () => void;
  offer?: LoanOffer;
}

export const DiscardOffer: FC<Props> = ({ onClose }) => {
  return <RsModal title={"Note from Roshi"} onClose={onClose}></RsModal>;
};
