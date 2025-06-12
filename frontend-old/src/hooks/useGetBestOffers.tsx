import { useMemo } from 'react';
import { loanResponse } from '../api/useLoanRequestApi';

export const useGetBestOffers = (loanResponses: loanResponse[]) => {
  const bestOffers = useMemo(() => {
    if (!loanResponses?.length) return { highestAmountId: null, longestTenureId: null, lowestInterestRateId: null };

    let highestAmount = 0;
    let highestTenure = 0;
    let lowestInterestRate = Infinity;
    let highestAmountId: string | null = null;
    let longestTenureId: string | null = null;
    let lowestInterestRateId: string | null = null;

    for (const response of loanResponses) {
      const amount = response.loanOffer?.amount || 0;
      const term = response.loanOffer?.term || 0;
      const rate = response.loanOffer?.monthlyInterestRate || Infinity;

      if (amount > highestAmount) {
        highestAmount = amount;
        highestAmountId = response.id;
      }

      if (term > highestTenure) {
        highestTenure = term;
        longestTenureId = response.id;
      }

      if (rate < lowestInterestRate) {
        lowestInterestRate = rate;
        lowestInterestRateId = response.id;
      }
    }

    return {
      highestAmountId,
      longestTenureId,
      lowestInterestRateId
    };
  }, [loanResponses]);

  return bestOffers;
};
