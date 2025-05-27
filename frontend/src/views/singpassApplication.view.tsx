import { Box, Button, Divider, Grid, Input, Sheet, Table, Typography } from "@mui/joy";
import { LoanRequestTypeEnum, SingpassData } from "@roshi/shared";
import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flex } from "../components/shared/flex";
import { LoadingPage } from "../components/shared/loadingPage";
import { useVisitorContext } from "../context/visitorContext";
import { KEYS } from "../data/constants";
import { getFromLocalStorage } from "../utils/localStorageHelper";

export const SingpassApplicationView: React.FC = () => {
  const navigate = useNavigate();
  const { visitor, isLoading, init } = useVisitorContext();
  const singpassData = visitor?.singpassData as SingpassData;
  const type = getFromLocalStorage<string>(KEYS.APPLICATION_LOAN_TYPE);

  useEffect(() => {
    if (!visitor?.id && !isLoading) {
      init(type ? (type as LoanRequestTypeEnum) : LoanRequestTypeEnum.GENERAL);
    }
  }, [init, isLoading, type, visitor?.id]);

  useEffect(() => {
    if (visitor && !visitor.singpassData) {
      navigate("/apply");
    }
  }, [navigate, visitor]);

  const navigateToApply = useCallback(async () => {
    if (!visitor?.id) {
      return;
    }

    if (visitor.loanRequestType === LoanRequestTypeEnum.ZERO_INTEREST) {
      navigate(`/apply-for-zero-interest-loan`);
    } else {
      navigate(`/apply`);
    }
  }, [visitor?.id, visitor?.loanRequestType, navigate]);

  if (!visitor) {
    return <LoadingPage />;
  }

  const renderInfoSection = (title: string, items: { label: string; value: string | undefined }[]) => (
    <Sheet sx={{ p: 2 }}>
      <Typography level="h4">{title}</Typography>
      <Divider sx={{ my: 1 }} />
      {items.map((item, index) => (
        <Box sx={{ mb: 2 }} key={index}>
          <Typography level="title-md">{item.label}</Typography>
          <Input
            value={item.value}
            readOnly
            variant="outlined"
            sx={{ backgroundColor: "neutral.300", pointerEvents: "none" }}
          />
        </Box>
      ))}
    </Sheet>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Flex y wrap fullwidth px={2}>
        <Typography level="h2">Singpass Information</Typography>
        <Button sx={{ width: "200px" }} size="sm" onClick={navigateToApply}>
          Apply
        </Button>
      </Flex>
      <Grid container spacing={2}>
        <Grid xs={12} sm={6}>
          {renderInfoSection("Personal Information", [
            { label: "UIN/FIN", value: singpassData?.uinfin?.value },
            { label: "Name", value: singpassData?.name?.value },
            { label: "Sex", value: singpassData?.sex?.desc },
            { label: "Race", value: singpassData?.race?.desc },
            { label: "Nationality", value: singpassData?.nationality?.desc },
            { label: "Date of Birth", value: singpassData?.dob?.value },
            { label: "Occupation", value: singpassData?.occupation?.value },
            { label: "Employment", value: singpassData?.employment?.value },
            { label: "Email", value: singpassData?.email?.value },
            {
              label: "Mobile Number",
              value: `+${singpassData?.mobileno?.areacode?.value}${singpassData?.mobileno?.nbr?.value}`,
            },
          ])}
        </Grid>
        <Grid xs={12} sm={6}>
          {renderInfoSection("Address", [
            { label: "Country", value: singpassData?.regadd?.country?.desc },
            { label: "Street", value: singpassData?.regadd?.street?.value },
            { label: "Block", value: singpassData?.regadd?.block?.value },
            { label: "Postal", value: singpassData?.regadd?.postal?.value },
            { label: "Floor", value: singpassData?.regadd?.floor?.value },
            { label: "Building", value: singpassData?.regadd?.building?.value },
          ])}
        </Grid>
        <Grid xs={12} sm={6}>
          {renderInfoSection("Housing Information", [
            { label: "Housing Type", value: singpassData?.housingtype?.desc },
            { label: "HDB Type", value: singpassData?.hdbtype?.desc },
            { label: "Marital Status", value: singpassData?.marital?.desc },
            { label: "Owner Private", value: singpassData?.ownerprivate?.value ? "Yes" : "No" },
          ])}
        </Grid>
        <Grid xs={12}>
          <Sheet sx={{ p: 2 }}>
            <Typography level="h4">CPF Contributions</Typography>
            <Table>
              <thead>
                <tr>
                  <th style={{ width: "100px" }}>Month</th>
                  <th style={{ width: "100px" }}>Amount</th>
                  <th>Employer</th>
                </tr>
              </thead>
              <tbody>
                {singpassData?.cpfcontributions?.history
                  ?.sort((a, b) => {
                    const dateA = new Date(a.date?.value || 0); // Default to 0 if undefined
                    const dateB = new Date(b.date?.value || 0); // Default to 0 if undefined
                    return dateB.getTime() - dateA.getTime();
                  })
                  .map((contribution, index) => (
                    <tr key={index}>
                      <td>{contribution.month?.value}</td>
                      <td>{contribution.amount?.value}</td>
                      <td>{contribution.employer?.value}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Sheet>
        </Grid>
      </Grid>
    </Box>
  );
};
