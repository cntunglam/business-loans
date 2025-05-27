import { Box, Divider, Grid, Sheet, Table, Typography } from "@mui/joy";
import { SingpassData } from "@roshi/shared";
import { FC } from "react";
import { RsModal } from "./rsModal";

interface Props {
  singpassData?: Partial<SingpassData>;
  onClose: () => void;
}

const renderInfoSection = (title: string, items: { label: string; value: string | undefined }[]) => {
  const filtered = items.filter((item) => item.value);
  if (!filtered.length) return null;
  return (
    <Sheet sx={{ backgroundColor: "neutral.100", p: 2 }}>
      <Typography level="title-lg">{title}</Typography>
      <Divider sx={{ my: 1 }} />
      {filtered.map((item, index) => (
        <Box key={index} sx={{ mb: 1 }}>
          <Typography level="title-md">{item.label}</Typography>
          <Typography>{item.value || "NA"}</Typography>
        </Box>
      ))}
    </Sheet>
  );
};

export const SingpassInfoModal: FC<Props> = ({ singpassData, onClose }) => {
  const withEmployer = singpassData?.cpfcontributions?.history?.some((item) => !!item.employer);
  return (
    <RsModal onClose={onClose} title="Singpass Myinfo">
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
              value: singpassData?.mobileno
                ? `+${singpassData?.mobileno?.areacode?.value}${singpassData?.mobileno?.nbr?.value}`
                : undefined,
            },
          ])}
        </Grid>
        <Grid xs={12} sm={6}>
          {renderInfoSection("Address", [
            { label: "Type", value: singpassData?.regadd?.type },
            { label: "Country", value: singpassData?.regadd?.country?.desc },
            { label: "Street", value: singpassData?.regadd?.street?.value },
            { label: "Block", value: singpassData?.regadd?.block?.value },
            { label: "Postal", value: singpassData?.regadd?.postal?.value },
            { label: "Floor", value: singpassData?.regadd?.floor?.value },
            { label: "Unit", value: singpassData?.regadd?.unit?.value },
            { label: "Building", value: singpassData?.regadd?.building?.value },
            { label: "Line 1", value: singpassData?.regadd?.line1?.value },
            { label: "Line 2", value: singpassData?.regadd?.line2?.value },
          ])}
        </Grid>
        <Grid xs={12} sm={6}>
          {renderInfoSection("Housing Information", [
            { label: "Housing Type", value: singpassData?.housingtype?.desc },
            { label: "HDB Type", value: singpassData?.hdbtype?.desc },
            { label: "Marital Status", value: singpassData?.marital?.desc },
            {
              label: "Owner Private",
              value:
                singpassData?.ownerprivate?.value === undefined
                  ? undefined
                  : singpassData?.ownerprivate?.value === false
                    ? "No"
                    : "Yes",
            },
          ])}
        </Grid>
        <Grid xs={12}>
          <Sheet sx={{ backgroundColor: "neutral.100", p: 2 }}>
            <Typography level="title-lg">CPF Contributions</Typography>
            {!singpassData?.cpfcontributions?.history || singpassData.cpfcontributions.history.length === 0 ? (
              <Typography level="body-lg" sx={{ m: 2, textAlign: "center" }}>
                No data available
              </Typography>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Amount</th>
                    {withEmployer && <th>Employer</th>}
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
                        {withEmployer && <td>{contribution.employer?.value}</td>}
                      </tr>
                    ))}
                </tbody>
              </Table>
            )}
          </Sheet>
        </Grid>
      </Grid>
    </RsModal>
  );
};
