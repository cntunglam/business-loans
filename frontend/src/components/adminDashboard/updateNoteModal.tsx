import { Button, Textarea } from "@mui/joy";
import type { updateLoanRequestSchema } from "@roshi/backend";
import { FC, useRef } from "react";
import { z } from "zod";
import { useUpdateLoanRequestAdmin } from "../../api/useAdminApi";
import { RsModal } from "../shared/rsModal";
interface Props {
  application: { id: string; publicNote: string | null; privateNote: string | null };
  type: "publicNote" | "privateNote";
  onClose: () => void;
  refetch: () => void;
}

export const UpdateNoteModal: FC<Props> = ({ type, application, onClose, refetch }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const updateApplication = useUpdateLoanRequestAdmin();

  const handleClick = () => {
    const body: { id: string } & z.infer<typeof updateLoanRequestSchema> = { id: application.id };

    body[type] = textareaRef?.current?.value;

    updateApplication
      .mutateAsync({
        ...body,
      })
      .then((resp) => {
        if (resp.message === "OK") {
          refetch();
          onClose();
        }
      });
  };

  return (
    <RsModal title={type === "publicNote" ? "Update the public note" : "Update the private note"} onClose={onClose}>
      <Textarea
        slotProps={{ textarea: { ref: textareaRef } }}
        defaultValue={application[type] || ""}
        placeholder={type === "publicNote" ? "Please enter Public Note" : "Please enter Private note"}
        minRows={8}
        maxRows={8}
        sx={{ flexGrow: 1 }}
      />
      <Button onClick={handleClick}>Update</Button>
    </RsModal>
  );
};
