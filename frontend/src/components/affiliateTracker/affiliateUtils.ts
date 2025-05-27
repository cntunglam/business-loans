import { AffiliateContextType } from "./affiliateContext";
import { AFFILIATE_KEY } from "./constant";

export const getAffiliateData = () => {
  return {
    affiliateVisitorId: localStorage.getItem(AFFILIATE_KEY.AFFILIATE_VISITOR_ID),
    referralCode: localStorage.getItem(AFFILIATE_KEY.REFERRAL_CODE),
  };
};

export const saveAffiliateData = (data: AffiliateContextType) => {
  Object.entries(data).forEach(([key, value]) => {
    if (value) {
      localStorage.setItem(key, value.toString());
    }
  });
};
