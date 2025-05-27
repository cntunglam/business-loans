import { AffiliateProvider } from "./affiliateContext";

const AffiliateWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AffiliateProvider>{children}</AffiliateProvider>;
};

export default AffiliateWrapper;
