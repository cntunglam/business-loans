import { createContext, useContext, useEffect, useState } from "react";
import { useRecordReferralLinkVisit } from "../../api/useAffiliateApi";
import { getAffiliateData, saveAffiliateData } from "./affiliateUtils";
import { AFFILIATE_KEY, PROCESSING } from "./constant";

export interface AffiliateContextType {
  affiliateVisitorId?: string;
  referralCode?: string;
}

export const AffiliateContext = createContext<AffiliateContextType | undefined>(undefined);

export const AffiliateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [affiliateData, setAffiliateData] = useState<AffiliateContextType>({});
  const { mutateAsync: recordReferralLinkVisit } = useRecordReferralLinkVisit();

  useEffect(() => {
    const processedAffiliateUrlStatus = localStorage.getItem(AFFILIATE_KEY.PROCESS_AFFILIATE_URL_STATUS);
    if (processedAffiliateUrlStatus === PROCESSING) return;
    localStorage.setItem(AFFILIATE_KEY.PROCESS_AFFILIATE_URL_STATUS, PROCESSING);
    const data = getAffiliateData();
    const urlParams = new URLSearchParams(window.location.search);
    const urlReferralCode = urlParams.get(AFFILIATE_KEY.REFERRAL_CODE) || undefined;

    const typedData: AffiliateContextType = {
      affiliateVisitorId: data.affiliateVisitorId || undefined,
      referralCode: data.referralCode || undefined,
    };

    if (data.affiliateVisitorId && urlReferralCode === typedData.referralCode) {
      setAffiliateData(typedData);
      saveAffiliateData(typedData);
      localStorage.removeItem(AFFILIATE_KEY.PROCESS_AFFILIATE_URL_STATUS);
      return;
    }

    if (!urlReferralCode) {
      localStorage.removeItem(AFFILIATE_KEY.PROCESS_AFFILIATE_URL_STATUS);
      return;
    }

    recordReferralLinkVisit(urlReferralCode)
      .then((result) => {
        const updatedData = {
          referralCode: urlReferralCode,
          affiliateVisitorId: result.affiliateVisitorId,
        };
        setAffiliateData(updatedData);
        saveAffiliateData(updatedData);
        localStorage.removeItem(AFFILIATE_KEY.PROCESS_AFFILIATE_URL_STATUS);
      })
      .catch((error) => {
        console.error("Error updating affiliate data:", error);
        localStorage.removeItem(AFFILIATE_KEY.PROCESS_AFFILIATE_URL_STATUS);
      });
  }, []);

  return <AffiliateContext.Provider value={affiliateData}>{children}</AffiliateContext.Provider>;
};

export const useAffiliate = () => {
  const context = useContext(AffiliateContext);
  if (!context) {
    throw new Error("useAffiliate must be used within an AffiliateProvider");
  }
  return context;
};
