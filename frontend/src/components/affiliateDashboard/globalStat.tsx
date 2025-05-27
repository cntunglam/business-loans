import { ArrowDropDown } from "@mui/icons-material";
import { Box, Dropdown, Grid, Menu, MenuButton, MenuItem, Typography } from "@mui/joy";
import { useMemo, useState } from "react";
import { ReferralLink } from "../../api/useAffiliateApi";
import { formatToDisplayString } from "../../utils/utils";
import { Flex } from "../shared/flex";
type Props = {
  referralLinks: ReferralLink[];
};

const timePeriods = ["Current Month", "Total"];

export const GlobalStat = ({ referralLinks }: Props) => {
  const [timePeriod, setTimePeriod] = useState<string>("Current Month");
  const data = useMemo(() => {
    let totalVisits = 0;
    let totalApplications = 0;
    let totalClosedLoanRequests = 0;
    const totalEarnings = 0;

    referralLinks?.forEach((link) => {
      link.visitors.forEach((visitor) => {
        if (timePeriod === "Current Month") {
          const today = new Date();
          const visitedAt = new Date(visitor.createdAt);
          if (visitedAt.getMonth() === today.getMonth() && visitedAt.getFullYear() === today.getFullYear()) {
            totalVisits += 1;
          }

          if (visitor.loanRequest?.loanResponses?.length) {
            const closedLoanRequestAt = new Date(visitor.loanRequest?.loanResponses[0].createdAt);
            if (
              closedLoanRequestAt.getMonth() === today.getMonth() &&
              closedLoanRequestAt.getFullYear() === today.getFullYear()
            ) {
              totalClosedLoanRequests += 1;
            }
          }

          if (visitor.loanRequest) {
            const applicationAt = new Date(visitor.loanRequest.createdAt ?? "");
            if (applicationAt.getMonth() === today.getMonth() && applicationAt.getFullYear() === today.getFullYear()) {
              totalApplications += 1;
            }
          }
        } else {
          totalVisits += 1;
          if (visitor.loanRequest?.loanResponses?.length) {
            totalClosedLoanRequests += 1;
          }
          if (visitor.loanRequest) {
            totalApplications += 1;
          }
        }
      });
    });

    return { totalVisits, totalApplications, totalClosedLoanRequests, totalEarnings };
  }, [referralLinks, timePeriod]);

  return (
    <Flex y gap={2} sx={{ borderRadius: 2, flex: 1, width: "100%" }}>
      <Dropdown sx={{ width: "fit-content" }}>
        <MenuButton size="sm" sx={{ width: "fit-content" }}>
          <Typography level="title-md">{timePeriod}</Typography>
          <ArrowDropDown />
        </MenuButton>
        <Menu>
          {timePeriods.map((period) => (
            <MenuItem key={period} onClick={() => setTimePeriod(period)}>
              {period}
            </MenuItem>
          ))}
        </Menu>
      </Dropdown>
      <Grid container spacing={2}>
        <Grid xs={12} sm={4} md={3}>
          <Box sx={{ background: "#FBFBFB", boxShadow: "md", borderRadius: 2, p: 2 }}>
            <Typography level="title-md">Total Visits</Typography>
            <Typography level="h4" fontWeight="700">
              {formatToDisplayString(data.totalVisits)}
            </Typography>
          </Box>
        </Grid>

        <Grid xs={12} sm={4} md={3} boxShadow={2}>
          <Box sx={{ background: "#FBFBFB", boxShadow: "md", borderRadius: 2, p: 2 }}>
            <Typography level="title-md">Total Applications</Typography>
            <Typography level="h4" fontWeight="700">
              {formatToDisplayString(data.totalApplications)}
            </Typography>
          </Box>
        </Grid>

        <Grid xs={12} sm={4} md={3}>
          <Box sx={{ background: "#FBFBFB", boxShadow: "md", borderRadius: 2, p: 2 }}>
            <Typography level="title-md">Total closed loans</Typography>
            <Typography level="h4" fontWeight="700">
              {formatToDisplayString(data.totalClosedLoanRequests)}
            </Typography>
          </Box>
        </Grid>

        <Grid xs={12} sm={4} md={3}>
          <Box sx={{ background: "#FBFBFB", boxShadow: "md", borderRadius: 2, p: 2 }}>
            <Typography level="title-md">Earnings</Typography>
            <Typography level="h4" fontWeight="700">
              $ {formatToDisplayString(data.totalEarnings)}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Flex>
  );
};
