import { Button, Divider, Typography } from "@mui/joy";
import { formatApplicantForAdmin, formatApplicantForBorrower, formatApplicantInfoForLender } from "@roshi/backend";
import { DocumentTypeEnum } from "@roshi/shared";
import { FC } from "react";
import { useGetApplicantInfo } from "../../api/useApplicantInfoApi";
import { useGetMyLoanRequest } from "../../api/useLoanRequestApi";
import { ASSETS } from "../../data/assets";
import { formatApplicationData } from "../shared/applicationDataFormatter";
import { Flex } from "../shared/flex";
import { RsModal } from "../shared/rsModal";
import { ViewDocumentBtn } from "../shared/viewDocumentBtn";

interface Props {
  loanRequest?: Pick<NonNullable<ReturnType<typeof useGetMyLoanRequest>["data"]>, "amount" | "term" | "purpose">;
  applicantInfo:
    | ReturnType<typeof formatApplicantForAdmin>
    | ReturnType<typeof formatApplicantForBorrower>
    | ReturnType<typeof formatApplicantInfoForLender>;
  documents?: NonNullable<ReturnType<typeof useGetApplicantInfo>["data"]>["documents"];
  onDelete?: () => void;
  onClose: () => void;
  title: string;
  isLoading?: boolean;
}

export const ApplicationDetailsModal: FC<Props> = ({
  title,
  loanRequest,
  applicantInfo,
  onDelete,
  onClose,
  isLoading,
  documents,
}) => {
  const renderTitleAndValue = (title: string, value: string) => {
    return (
      <Flex x xsb>
        <Typography>{title}</Typography> <Typography fontWeight={600}>{value}</Typography>
      </Flex>
    );
  };

  return (
    <RsModal title={title} onClose={onClose} fullscreenOnMobile>
      <Typography startDecorator={<img src={ASSETS.GUARANTOR_ICON} />} level="title-md">
        {applicantInfo?.fullname}
      </Typography>
      <Flex y fullwidth gap1 pr={1}>
        <Divider />
        <Typography textColor="neutral.400">Basic information</Typography>
        {applicantInfo.phoneNumber && renderTitleAndValue("Phone number", applicantInfo.phoneNumber)}
        {loanRequest && (
          <>
            {renderTitleAndValue(
              "Loan Amount",
              formatApplicationData({ property: "amount", value: loanRequest.amount })
            )}
            {renderTitleAndValue("Loan Period", formatApplicationData({ property: "term", value: loanRequest.term }))}
            {renderTitleAndValue(
              "Loan Purpose",
              formatApplicationData({ property: "purpose", value: loanRequest.purpose })
            )}
          </>
        )}
        {renderTitleAndValue(
          "Residency Status",
          formatApplicationData({
            property: "residencyStatus",
            value: applicantInfo?.residencyStatus,
          })
        )}
        {renderTitleAndValue(
          "Age",
          formatApplicationData({
            property: "age",
            value: applicantInfo.age,
          })
        )}
        {renderTitleAndValue(
          "Monthly Income",
          formatApplicationData({
            property: "monthlyIncome",
            value: applicantInfo.monthlyIncome,
          })
        )}
        {renderTitleAndValue(
          "Occupation Status ",
          formatApplicationData({
            property: "employmentStatus",
            value: applicantInfo.employmentStatus,
          })
        )}
        {renderTitleAndValue(
          "Existing loans with banks",
          applicantInfo.bankDebt + applicantInfo.lenderDebt > 0
            ? formatApplicationData({ property: "amount", value: applicantInfo.bankDebt })
            : "No"
        )}
        {renderTitleAndValue(
          "Existing loans with lenders",
          applicantInfo.bankDebt + applicantInfo.lenderDebt > 0
            ? formatApplicationData({ property: "amount", value: applicantInfo.lenderDebt })
            : "No"
        )}

        <Divider />
        <Typography textColor="neutral.400">Employment Period</Typography>

        {renderTitleAndValue(
          "Current Company",
          formatApplicationData({
            property: "currentEmploymentTime",
            value: applicantInfo.currentEmploymentTime,
          })
        )}
        {renderTitleAndValue(
          "Previous Company ",
          formatApplicationData({
            property: "previousEmploymentTime",
            value: applicantInfo.currentEmploymentTime,
          })
        )}
        <Divider />
        <Typography textColor="neutral.400">Property Status</Typography>

        {renderTitleAndValue(
          "Ownership",
          formatApplicationData({
            property: "propertyOwnership",
            value: applicantInfo.propertyOwnership,
          })
        )}
        {renderTitleAndValue(
          "Postal Code",
          formatApplicationData({
            property: "postalCode",
            value: applicantInfo.postalCode,
          })
        )}
        {documents && (
          <>
            <Divider />
            <Typography textColor="neutral.400">Documents</Typography>
            {Object.keys(DocumentTypeEnum).map((docType) => {
              const file = applicantInfo.documents?.find((doc) => doc.documentType === docType);
              return (
                <Flex key={docType} gap1 x xsb yc height="25px">
                  <Typography>{docType}</Typography>
                  {file ? <ViewDocumentBtn filename={file.filename} /> : "Missing"}
                </Flex>
              );
            })}
          </>
        )}
      </Flex>
      {onDelete && (
        <Button
          variant="soft"
          color="neutral"
          size="lg"
          fullWidth
          startDecorator={<img src={ASSETS.REMOVE} />}
          loading={isLoading}
          onClick={() => onDelete()}
          sx={{ mt: 2 }}
        >
          Remove
        </Button>
      )}
    </RsModal>
  );
};
