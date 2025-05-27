import { CheckCircle } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  Link,
  List,
  ListItem,
  Typography,
  useTheme,
} from "@mui/joy";
import { calculateEMI, formatWithoutTz, NonNullRT } from "@roshi/shared";
import { FC, useMemo, useState } from "react";
import { useDeleteAppointment } from "../../api/useAppointmentApi";
import { useGetMyLoanRequest } from "../../api/useLoanRequestApi";
import StarIcon from "../../components/icons/starIcon.tsx";
import { OpenDialog } from "../../context/DialogContainer";
import { formatApplicationData } from "../shared/applicationDataFormatter";
import { Flex } from "../shared/flex";
import { UserOverviewModalType } from "./useUserOverview";
interface Props {
  loanResponse: NonNullRT<typeof useGetMyLoanRequest>["loanResponses"][0];
  openModal: (loanResponseId: string, modal: UserOverviewModalType) => void;
  refetch: () => void;
  borderAnimation: boolean;
  hasOfferedHighestAmount: boolean;
  hasOfferLongestTenure: boolean;
  hasOfferLowestInterestRate: boolean;
}
export const OfferCard: FC<Props> = ({
  loanResponse,
  refetch,
  openModal,
  borderAnimation,
  hasOfferedHighestAmount,
  hasOfferLongestTenure,
  hasOfferLowestInterestRate,
}) => {
  const [isShowingDetails, setIsShowingDetails] = useState(false);

  const deleteAppointment = useDeleteAppointment();
  const theme = useTheme();

  const ratings = useMemo(() => {
    return loanResponse?.lender?.stores?.[0]?.ratings;
  }, [loanResponse]);

  if (!loanResponse.loanOffer) return null;
  return (
    <Grid xs={12} sm={6} md={6} lg={4}>
      <Flex
        y
        height={"100%"}
        component={Card}
        sx={{
          boxShadow: "md",
          border: borderAnimation ? "3px solid " + theme.palette.primary[100] : "none",
          borderRadius: "md",
          animation: borderAnimation ? "border-pulse 2s infinite" : undefined,
        }}
      >
        <Flex x yc gap2>
          <img
            src={loanResponse?.lender.logo}
            alt="lender-logo"
            width={"50px"}
            height={"50px"}
            style={{ objectFit: "contain" }}
          />
          <Typography level="title-md">{loanResponse?.lender.name}</Typography>
        </Flex>
        <Flex x gap1 wrap minHeight={24} flex={1} alignItems={"start"}>
          {ratings && (
            <Chip
              color="lightSecondary"
              variant="soft"
              endDecorator={<StarIcon />}
              sx={{
                "--Chip-radius": "4px",
              }}
            >
              {ratings}
            </Chip>
          )}
          {hasOfferLowestInterestRate && (
            <Chip
              color="lightSecondary"
              variant="soft"
              sx={{
                "--Chip-radius": "4px",
              }}
            >
              Lowest interest rate
            </Chip>
          )}
          {hasOfferLongestTenure && (
            <Chip
              color="lightPrimary"
              variant="soft"
              sx={{
                "--Chip-radius": "4px",
              }}
            >
              Longest tenure
            </Chip>
          )}
          {hasOfferedHighestAmount && (
            <Chip
              color="lightPrimary"
              variant="soft"
              sx={{
                "--Chip-radius": "4px",
              }}
            >
              Highest amount
            </Chip>
          )}
        </Flex>
        <Divider inset="none" />
        {/* <Typography level="title-md">{offer?.lender.name}</Typography> */}
        <Flex fullwidth x xsb>
          <Flex y xst>
            <Typography fontWeight="600" fontSize="xs" textColor="neutral.500">
              UP TO
            </Typography>
            <Typography fontWeight={"500"} level="h4">
              {formatApplicationData({ property: "amount", value: loanResponse?.loanOffer?.amount })}
            </Typography>
          </Flex>
          <Flex y xe>
            <Typography fontWeight="600" fontSize="xs" textColor="neutral.500">
              INTEREST RATE (MONHTLY)
            </Typography>
            <Typography fontWeight={"500"} level="h4">
              {formatApplicationData({ property: "interestRate", value: loanResponse?.loanOffer?.monthlyInterestRate })}
            </Typography>
          </Flex>
        </Flex>
        <Accordion onChange={(_, expanded) => setIsShowingDetails(expanded)} sx={{ mx: -2, mb: -1.5 }}>
          <AccordionSummary
            sx={{
              ".MuiAccordionSummary-button": {
                py: 1,
                alignItems: "center",
                justifyContent: "center",
                fontSize: (theme) => theme.typography["body-sm"].fontSize,
                color: (theme) => theme.palette.neutral[500],
              },
            }}
          >
            {isShowingDetails ? "Show less" : "Show more"}
          </AccordionSummary>
          <AccordionDetails>
            <Flex y gap1 px={2}>
              <Typography textColor="neutral.700" level="title-md">
                Key features
              </Typography>
              <Typography level="body-lg">
                <List
                  sx={{
                    fontSize: "md",
                    "& li": {
                      paddingLeft: 0,
                      paddingRight: 0,
                    },
                  }}
                >
                  <ListItem>
                    <CheckCircle sx={{ color: "success.400" }} />
                    Amount: {formatApplicationData({ property: "amount", value: loanResponse?.loanOffer?.amount })}
                  </ListItem>
                  <ListItem>
                    {" "}
                    <CheckCircle sx={{ color: "success.400" }} />
                    Interest Rate (Monthly): {loanResponse?.loanOffer?.monthlyInterestRate}%
                  </ListItem>
                  <ListItem>
                    {" "}
                    <CheckCircle sx={{ color: "success.400" }} />
                    Loan Duration: {loanResponse?.loanOffer?.term} months
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: "success.400" }} />
                    Upfront Fees:{" "}
                    {formatApplicationData({
                      property: "amount",
                      value:
                        loanResponse.loanOffer.fixedUpfrontFees +
                        (loanResponse.loanOffer.variableUpfrontFees / 100 || 0) * loanResponse.loanOffer.amount,
                    })}
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: "success.400" }} />
                    Monthly Installment:{" "}
                    {formatApplicationData({
                      property: "amount",
                      value: calculateEMI(
                        loanResponse.loanOffer.amount,
                        loanResponse.loanOffer.monthlyInterestRate / 100,
                        loanResponse.loanOffer.term
                      ),
                    })}
                  </ListItem>
                </List>
              </Typography>
            </Flex>
          </AccordionDetails>
        </Accordion>
        <Divider inset="none" />
        {loanResponse.appointment ? (
          <Flex fullwidth x xsb yc grow>
            <Typography color="primary" level="title-md">
              {loanResponse.appointment.scheduledTime ? (
                <>Scheduled for {formatWithoutTz(loanResponse.appointment.scheduledTime, "dd MMM HH:mm")}</>
              ) : (
                <>Appointment request received</>
              )}
            </Typography>
            {loanResponse.appointment.scheduledTime ? (
              <Link
                color="neutral"
                sx={{ textDecoration: "underline" }}
                onClick={() => openModal(loanResponse.id, "appointment")}
              >
                More info
              </Link>
            ) : (
              <Button
                variant="outlined"
                color="neutral"
                loading={deleteAppointment.isPending}
                onClick={() =>
                  OpenDialog({
                    type: "confirm",
                    title: "Cancel appointment?",
                    body: "Are you sure you want to cancel your appointment with " + loanResponse.lender.name,
                    submit: () => deleteAppointment.mutateAsync(loanResponse.appointment!.id).then(() => refetch()),
                  })
                }
              >
                Cancel
              </Button>
            )}
          </Flex>
        ) : (
          <Flex fullwidth x xsb yc>
            <Typography color={loanResponse.acceptedAt ? "primary" : "neutral"} level="title-md">
              {loanResponse?.acceptedAt ? "Offer selected" : "Pre-approved"}
            </Typography>
            <Button onClick={() => openModal(loanResponse.id, loanResponse.acceptedAt ? "schedule" : "details")}>
              {loanResponse?.acceptedAt ? "Book Appointment" : "Select Offer"}
            </Button>
          </Flex>
        )}
      </Flex>
    </Grid>
  );
};
