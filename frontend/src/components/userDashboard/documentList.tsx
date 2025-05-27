import { Typography } from "@mui/joy";
import { AwaitedRT, DocumentTypeEnum } from "@roshi/shared";
import { FC } from "react";
import { useGetMyLoanRequest } from "../../api/useLoanRequestApi";
import { Flex } from "../shared/flex";
import { DocumentUploadRow } from "./documentRow";

interface Props {
  refetch: () => void;
  applicantInfo?: NonNullable<AwaitedRT<typeof useGetMyLoanRequest>["data"]>["applicantInfo"];
}

export const DocumentList: FC<Props> = ({ refetch, applicantInfo }) => {
  const requiredDocuments = [
    {
      disabled: !!applicantInfo?.singpassData,
      category: "Income",
      documents: [
        {
          docType: DocumentTypeEnum.PAYSLIP_1,
          label: "Payslip - Latest Month",
        },
        {
          docType: DocumentTypeEnum.PAYSLIP_2,
          label: "Payslip - Second Latest Month",
        },
        {
          docType: DocumentTypeEnum.PAYSLIP_3,
          label: "Payslip - Third Latest Month",
        },
      ],
    },
    {
      category: "Credit Report",
      documents: [
        {
          docType: DocumentTypeEnum.CREDIT_REPORT,
          label: "Credit Bureau Singapore (CBS)",
        },
        {
          docType: DocumentTypeEnum.LENDER_CREDIT_REPORT,
          label: "Moneylenders Credit Bureau (MLCB)",
        },
      ],
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
        }}
        mb={2}
      >
        <Typography
          fontWeight={600}
          p={2}
          sx={{
            backgroundColor: "neutral.50",
            borderRadius: "6px 6px 0 0",
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          {doc.category}
        </Typography>
        {doc.documents.map((doc) => (
          <DocumentUploadRow
            documents={applicantInfo?.documents}
            applicantId={applicantInfo?.id}
            refetch={refetch}
            documentType={doc.docType}
            label={doc.label}
          />
        ))}
      </Flex>
    ));
};
