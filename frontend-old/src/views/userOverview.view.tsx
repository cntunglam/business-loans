import { Card, Grid, Typography } from '@mui/joy';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetMyLoanRequest, useGetPartnerOffers } from '../api/useLoanRequestApi';
import { CustomerSupportWidget } from '../components/shared/customerSupportWidget';
import { Flex } from '../components/shared/flex';
import { LoadingPage } from '../components/shared/loadingPage';
import { ApplicationStatus } from '../components/userDashboard/applicationStatus';
import { BeatOfferBanner } from '../components/userDashboard/beatOfferBanner';
import { OfferCard } from '../components/userDashboard/offerCard';
import { PartnerOfferCard } from '../components/userDashboard/partnerOfferCard';
import { PromotionalBanners } from '../components/userDashboard/promotionalBanner';
import { useUserOverview } from '../components/userDashboard/useUserOverview';
import { useUserContext } from '../context/userContext';
import { useGetBestOffers } from '../hooks/useGetBestOffers';

export const UserOverviewView = () => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const { data, refetch, isLoading } = useGetMyLoanRequest();
  const [isBorderAnimation, setIsBorderAnimation] = useState(false);

  const [isRefetching, setIsRefetching] = useState(false);
  const refetchWithLoading = async () => {
    setIsRefetching(true);
    refetch().finally(() => setIsRefetching(false));
  };

  const { openModal, renderModal } = useUserOverview({
    loanResponses: data?.loanResponses || [],
    refetch: refetchWithLoading
  });

  const highlightOffers = () => {
    document.getElementById('pre-approved-offers')?.scrollIntoView();
    setIsBorderAnimation(true);
    setTimeout(() => {
      setIsBorderAnimation(false);
    }, 8000);
  };

  const { data: partnerOffers } = useGetPartnerOffers();

  const bestOffer = useGetBestOffers(data?.loanResponses || []);

  const preApprovedOffers = useMemo(() => {
    return data?.loanResponses?.sort?.((a, b) => {
      let [tagsAHas, tagsBHas] = [0, 0];
      [bestOffer.highestAmountId, bestOffer.longestTenureId, bestOffer.lowestInterestRateId].map((id) => {
        if (a.id === id) {
          tagsAHas++;
        }
        if (b.id === id) {
          tagsBHas++;
        }
      });

      return tagsBHas - tagsAHas;
    });
  }, [data?.loanResponses, bestOffer]);

  useEffect(() => {
    const int = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(int);
  }, [refetch]);

  if (!data || data.isExpired || data.isWithdrawn) return <></>;

  return (
    <Flex fullwidth y xst px={{ xs: 1, md: 4 }} pb={8}>
      {<LoadingPage variant="overlay" isLoading={isLoading || isRefetching} />}
      {renderModal()}
      <CustomerSupportWidget />
      <Typography level="h3" fontWeight={'700'} color="secondary">
        {t('welcome')}, {user?.name}
      </Typography>
      <Flex sx={{ mt: { xs: 2, md: 4 } }} y fullwidth>
        <Flex
          x
          gap={2}
          sx={{
            '& > *': { width: { md: '50%', xs: '100%', sm: '100%' } },
            flexDirection: { sm: 'column', md: 'row', xs: 'column' }
          }}
        >
          <ApplicationStatus application={data} openModal={openModal} highlightOffers={highlightOffers} />
          <PromotionalBanners />
        </Flex>
        <Typography id="pre-approved-offers" mt={4} mb={1} color="secondary" level="title-lg">
          {t('form:useroverview.title_1')}
        </Typography>
        <Grid container rowSpacing={2} columnSpacing={2} minWidth={'100%'}>
          {preApprovedOffers?.length === 0 ? (
            <Typography
              component={Card}
              textAlign="center"
              textColor="neutral.500"
              mt={4}
              mb={5}
              py={2}
              sx={{ width: '100%', borderRadius: 3, display: 'flex', alignItems: 'center' }}
            >
              {t('form:useroverview.description_1')}
            </Typography>
          ) : (
            preApprovedOffers?.map((res) => (
              <OfferCard
                refetch={refetchWithLoading}
                key={res.id}
                loanResponse={res}
                openModal={openModal}
                borderAnimation={isBorderAnimation}
                hasOfferedHighestAmount={res.id === bestOffer.highestAmountId}
                hasOfferLongestTenure={res.id === bestOffer.longestTenureId}
                hasOfferLowestInterestRate={res.id === bestOffer.lowestInterestRateId}
              />
            ))
          )}
        </Grid>
        <BeatOfferBanner />
        <Typography color="secondary" level="title-lg" mt={4} mb={1}>
          {t('form:useroverview.title_2')}
        </Typography>
        <Grid container rowSpacing={2} columnSpacing={2} minWidth={'100%'}>
          {partnerOffers?.length === 0 ? (
            <Typography
              component={Card}
              textAlign="center"
              textColor="neutral.500"
              mt={4}
              mb={5}
              py={2}
              sx={{ width: '100%', borderRadius: 3, display: 'flex', alignItems: 'center' }}
            >
              {t('form:useroverview.description_2')}
            </Typography>
          ) : (
            partnerOffers?.map((res) => <PartnerOfferCard key={res.id} offer={res} />)
          )}
        </Grid>
      </Flex>
    </Flex>
  );
};
