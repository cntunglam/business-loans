import { formatApplicationData } from "../components/shared/applicationDataFormatter";

import { Box, Button, Divider, Typography } from "@mui/material";
import { useDeleteMyLoanRequest, useGetMyLoanRequest } from "../api/useLoanRequestApi";
import { Flex } from "../components/shared/flex";
import { OpenDialog } from "../context/DialogContainer";
import { ASSETS } from "../data/assets";
import useMediaQueries from "../hooks/useMediaQueries";

export const ApplicationDetailsView = () => {
  const { data: application, isLoading } = useGetMyLoanRequest();
  const deleteApplication = useDeleteMyLoanRequest();
  const queryMedia = useMediaQueries(["md"]);

  const handleDeleteApplication = () => {
    OpenDialog({
      image: ASSETS.UPDATE_DOC_ICON,
      submit: () => {
        deleteApplication.mutateAsync().then(() => window.location.reload());
      },
      type: "delete",
      title: "Are you sure you want to withdraw your loan application?",
      body: "Withdrawing your loan application means you will lose all progress. Are you sure you want to proceed?",
    });
  };

  const renderTitleAndValue = (title: string, value: string) => {
    return (
      <Flex y>
        <Typography>{title}</Typography> <Typography fontWeight={600}>{value}</Typography>
      </Flex>
    );
  };

  if (!application) return "";
  const applicantInfo = application!.applicantInfo;
  const loanRequest = application;

  return (
    <Box px={{ xs: 1, md: 3 }} pt={3} pb={8}>
      <Box mb={2}>
        <Typography level="h4" fontWeight={"700"} color="secondary">
          Application Review
        </Typography>
      </Box>

      <Typography startDecorator={<img src={ASSETS.GUARANTOR_ICON} />} level="title-md">
        {applicantInfo?.fullname}
      </Typography>

      <Box sx={{ my: 2 }}>
        <Typography textColor="neutral.400">Basic information</Typography>
      </Box>

      <Flex y fullwidth gap2>
        <Flex x fullwidth pr={1} wrap rowGap={2} cols={queryMedia.md ? 3 : 2}>
          {applicantInfo!.phoneNumber && renderTitleAndValue("Phone number", applicantInfo!.phoneNumber)}
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
              value: applicantInfo!.age,
            })
          )}
        </Flex>
        <Flex x fullwidth pr={1} cols={queryMedia.md ? 3 : 2}>
          {renderTitleAndValue(
            "Monthly Income",
            formatApplicationData({
              property: "monthlyIncome",
              value: applicantInfo!.monthlyIncome,
            })
          )}
          {renderTitleAndValue(
            "Occupation Status ",
            formatApplicationData({
              property: "employmentStatus",
              value: applicantInfo!.employmentStatus,
            })
          )}
        </Flex>
        <Flex x xst fullwidth pr={1} cols={queryMedia.md ? 3 : 2}>
          {renderTitleAndValue(
            "Existing loans with banks",
            applicantInfo!.bankDebt + applicantInfo!.lenderDebt > 0
              ? formatApplicationData({ property: "amount", value: applicantInfo!.bankDebt })
              : "No"
          )}
          {renderTitleAndValue(
            "Existing loans with lenders",
            applicantInfo!.bankDebt + applicantInfo!.lenderDebt > 0
              ? formatApplicationData({ property: "amount", value: applicantInfo!.lenderDebt })
              : "No"
          )}
        </Flex>
      </Flex>

      <Divider sx={{ my: 2 }} />

      <Typography sx={{ my: 2 }} textColor="neutral.400">
        Employment Period
      </Typography>

      <Flex x fullwidth gap1 pr={1} cols={2}>
        {renderTitleAndValue(
          "Current Company",
          formatApplicationData({
            property: "currentEmploymentTime",
            value: applicantInfo!.currentEmploymentTime,
          })
        )}
        {renderTitleAndValue(
          "Previous Company ",
          formatApplicationData({
            property: "previousEmploymentTime",
            value: applicantInfo!.previousEmploymentTime,
          })
        )}
      </Flex>

      <Divider sx={{ my: 2 }} />
      <Typography textColor="neutral.400">Property Status</Typography>

      <Flex x fullwidth gap1 pr={1} cols={2}>
        {renderTitleAndValue(
          "Ownership",
          formatApplicationData({
            property: "propertyOwnership",
            value: applicantInfo!.propertyOwnership,
          })
        )}
        {renderTitleAndValue(
          "Postal Code",
          formatApplicationData({
            property: "postalCode",
            value: applicantInfo!.postalCode,
          })
        )}
      </Flex>
      <Button
        variant="soft"
        color="neutral"
        size="lg"
        fullWidth
        startDecorator={<img src={ASSETS.REMOVE} />}
        loading={isLoading}
        onClick={() => handleDeleteApplication()}
        sx={{ mt: 2 }}
      >
        Remove
      </Button>
    </Box>
  );
};
