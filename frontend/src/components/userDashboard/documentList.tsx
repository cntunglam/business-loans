import { Typography } from "@mui/joy";
import { AwaitedRT, DocumentTypeEnum, DocumentTypeEnumDescriptions, DocumentTypeEnumLabels } from "@roshi/shared";
import { FC } from "react";
import { useGetMyLoanRequest } from "../../api/useLoanRequestApi";
import { Flex } from "../shared/flex";
import { DocumentUploadRow } from "./documentRow";

interface DocumentItem {
  docType: DocumentTypeEnum;
  label: string;
  description?: string;
  optional?: boolean;
}

interface DocumentCategory {
  category: string;
  documents: DocumentItem[];
  disabled?: boolean;
}

interface Props {
  refetch: () => void;
  applicantInfo?: NonNullable<AwaitedRT<typeof useGetMyLoanRequest>["data"]>["applicantInfo"];
}

export const DocumentList: FC<Props> = ({ refetch, applicantInfo }) => {
  const requiredDocuments: DocumentCategory[] = [
    {
      category: "Identification & Residence",
      documents: [
        DocumentTypeEnum.ID_CARD_FRONT,
        DocumentTypeEnum.ID_CARD_BACK,
        DocumentTypeEnum.HOUSEHOLD_REGISTRATION,
        DocumentTypeEnum.TEMP_RESIDENCE_CONFIRMATION,
      ].map(docType => ({
        docType,
        label: DocumentTypeEnumLabels[docType],
        description: DocumentTypeEnumDescriptions[docType],
        optional: docType === DocumentTypeEnum.TEMP_RESIDENCE_CONFIRMATION,
      })),
    },
    {
      category: "Proof of Living Expenses / Residency",
      documents: [DocumentTypeEnum.UTILITY_BILL].map(docType => ({
        docType,
        label: DocumentTypeEnumLabels[docType],
        description: DocumentTypeEnumDescriptions[docType],
      })),
    },
    {
      category: "Employment & Income Verification",
      documents: [
        DocumentTypeEnum.EMPLOYMENT_CONTRACT,
        DocumentTypeEnum.SALARY_SLIP,
        DocumentTypeEnum.BANK_STATEMENT,
      ].map(docType => ({
        docType,
        label: DocumentTypeEnumLabels[docType],
        description: DocumentTypeEnumDescriptions[docType],
      })),
    },
  ];

  return requiredDocuments
    .filter((item) => !item.disabled)
    .map((doc) => (
      <Flex
        key={doc.category}
        y
        fullwidth
        sx={{
          borderRadius: "md",
          border: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: "background.body",
          overflow: 'hidden',
        }}
        mb={3}
      >
        <Typography
          fontWeight={600}
          p={2}
          sx={{
            backgroundColor: "neutral.100",
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          {doc.category}
        </Typography>
        <Flex y gap={1} p={1}>
          {doc.documents.map((docItem) => (
            <DocumentUploadRow
              key={docItem.docType}
              documents={applicantInfo?.documents}
              applicantId={applicantInfo?.id}
              refetch={refetch}
              documentType={docItem.docType}
              label={docItem.label}
              description={docItem.description}
              optional={docItem.optional}
            />
          ))}
        </Flex>
      </Flex>
    ));
};
