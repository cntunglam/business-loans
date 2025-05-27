import { Button } from "@mui/joy";
import { DocumentVerificationStatusEnum } from "@roshi/shared";
import { FC, useState } from "react";
import { useGetAllLeadsAdmin } from "../../../api/useAdminApi";
import { Flex } from "../../shared/flex";
import { RsModal } from "../../shared/rsModal";
import { DocumentsEditList } from "./documentsEditList";
import { DocumentsList } from "./documentsList";

interface Props {
  loanRequest: NonNullable<ReturnType<typeof useGetAllLeadsAdmin>["query"]["data"]>[number];
  onClose: () => void;
  onVerify: () => void;
  refetch: () => void;
}

export const LeadDocumentsModal: FC<Props> = ({ loanRequest, onClose, onVerify, refetch }) => {
  const [isEdit, setIsEdit] = useState(false);
  const unverifiedDocuments =
    loanRequest.applicantInfo?.documents?.filter(
      (doc) => doc.humanVerificationStatus === DocumentVerificationStatusEnum.NOT_VERIFIED
    ) || [];

  return (
    <RsModal title={isEdit ? "Edit Documents" : "Documents"} onClose={onClose} fullscreenOnMobile>
      {isEdit ? (
        <DocumentsEditList loanRequest={loanRequest} refetch={refetch} />
      ) : (
        <DocumentsList documents={loanRequest.applicantInfo!.documents || []} />
      )}
      {isEdit ? (
        <Flex gap2>
          <Button
            onClick={() => setIsEdit(false)}
            sx={{ width: "150px", mt: 2, height: 36 }}
            variant="soft"
            color="neutral"
            size="sm"
          >
            Back
          </Button>
        </Flex>
      ) : (
        <Flex gap2>
          <Button
            onClick={onVerify}
            sx={{ width: "150px", mt: 2 }}
            variant="soft"
            color="neutral"
            size="sm"
            disabled={unverifiedDocuments.length === 0}
          >
            Verify
          </Button>
          <Button variant="soft" color="danger" onClick={() => setIsEdit(true)} sx={{ width: "150px", mt: 2 }}>
            Edit
          </Button>
        </Flex>
      )}
    </RsModal>
  );
};
