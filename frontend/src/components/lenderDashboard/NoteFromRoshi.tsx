import { FC } from "react";
import { RsModal } from "../shared/rsModal";

interface Props {
  onClose: () => void;
  note?: string | null;
}

export const NoteFromRoshi: FC<Props> = ({ onClose, note }) => {
  return (
    <RsModal title={"Note from Roshi"} onClose={onClose}>
      {note}
    </RsModal>
  );
};
