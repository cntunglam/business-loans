import { useContext } from "react";
import { AffiliateContext } from "./affiliateContext";

export const useAffiliate = () => {
  const context = useContext(AffiliateContext);
  if (!context) {
    throw new Error("useAffiliate must be used within an AffiliateProvider");
  }
  return context;
};
