import { DocumentTypeEnum, DocumentTypeEnumLabels } from "@roshi/shared";
import { FC } from "react";
import { useGetAllLeadsAdmin } from "../../../api/useAdminApi";
import { DocumentUploadRow } from "../../userDashboard/documentRow";

interface Props {
  loanRequest: NonNullable<ReturnType<typeof useGetAllLeadsAdmin>["query"]["data"]>[number];
  refetch: () => void;
}

export const DocumentsEditList: FC<Props> = ({ loanRequest, refetch }) => {
  return (
    <>
      {Object.keys(DocumentTypeEnum).map((docType: string) => (
        <DocumentUploadRow
          height="50px"
          documents={loanRequest?.applicantInfo?.documents || []}
          applicantId={loanRequest.applicantInfo?.id}
          refetch={refetch}
          documentType={docType as DocumentTypeEnum}
          label={DocumentTypeEnumLabels[docType as DocumentTypeEnum]}
        />
      ))}
    </>
  );
};
