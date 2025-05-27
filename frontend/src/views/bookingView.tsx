import { SearchOff } from "@mui/icons-material";
import { Box, Card, Grid, Typography } from "@mui/joy";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetMyLoanRequest } from "../api/useLoanRequestApi";
import { LoadingPage } from "../components/shared/loadingPage";
import { PageMessage } from "../components/shared/pageMessage";
import { RoshiLogo } from "../components/shared/roshiLogo";
import { OfferCard } from "../components/userDashboard/offerCard";
import { useUserOverview } from "../components/userDashboard/useUserOverview";
import { KEYS, TIME_CONSTANTS } from "../data/constants";
import { useGetBestOffers } from "../hooks/useGetBestOffers";
import { saveToLocalStorage } from "../utils/localStorageHelper";

export const BookingView = () => {
  const { code } = useParams();
  const { data, refetch, isLoading } = useGetMyLoanRequest({ code: code });
  const { openModal, renderModal } = useUserOverview({ loanResponses: data?.loanResponses || [], refetch });

  const bestOffer = useGetBestOffers(data?.loanResponses || []);

  useEffect(() => {
    if (code) saveToLocalStorage(KEYS.ROSHI_SHORT_URL_CODE, code, TIME_CONSTANTS.ONE_HOUR);
  }, [code]);

  if (!isLoading && !data)
    return (
      <PageMessage
        text={
          <Typography color="neutral" component="a" href="/signin">
            Invalid or expired link. Click here to visit your dashboard
          </Typography>
        }
        iconSize="lg"
        icon={<SearchOff />}
      />
    );

  return (
    <Box px={4} pb={4}>
      <RoshiLogo sx={{ width: "100%", my: 4, justifyContent: "center" }} height="40px" />
      <Typography id="pre-approved-offers" mt={4} mb={1} color="secondary" level="title-lg">
        Select an offer to book an appointment
      </Typography>
      <Grid container rowSpacing={{ xs: 2, sm: 4, md: 8 }} columnSpacing={{ xs: 2, md: 2 }} minWidth={"100%"}>
        <LoadingPage variant="overlay" isLoading={isLoading} />
        {renderModal()}
        {data?.loanResponses?.length === 0 ? (
          <Typography
            component={Card}
            textAlign="center"
            textColor="neutral.500"
            mt={4}
            mb={5}
            py={2}
            sx={{ width: "100%", borderRadius: 3, display: "flex", alignItems: "center" }}
          >
            No pre-approved offers yet
          </Typography>
        ) : (
          data?.loanResponses?.map((res) => (
            <OfferCard
              refetch={refetch}
              key={res.id}
              loanResponse={res}
              openModal={openModal}
              borderAnimation={false}
              hasOfferedHighestAmount={res.id === bestOffer.highestAmountId}
              hasOfferLongestTenure={res.id === bestOffer.longestTenureId}
              hasOfferLowestInterestRate={res.id === bestOffer.lowestInterestRateId}
            />
          ))
        )}
      </Grid>
    </Box>
  );
};
