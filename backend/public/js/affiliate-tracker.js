// example: <script defer src="https://roshi-api-staging.azurewebsites.net/js/affiliate-tracker.js" data-api-url="https://roshi-api-staging.azurewebsites.net"></script>

document.onreadystatechange = async function () {
  const AFFILIATE_KEY = {
    VISITOR_ID: 'AFFILIATE_VISITOR_ID',
    PARAMS: 'AFFILIATE_PARAMS',
    EXPIRES_AT: 'AFFILIATE_EXPIRES_AT',
  };

  const script = document.currentScript;
  if (!script) {
    console.log('No script found');
    return;
  }
  const BASE_API_URL = `${script.getAttribute('data-api-url')}/api/v1/`;

  console.log('Affiliate tracker initialized: ', BASE_API_URL);

  const EXPIRE_TIME_MS = 24 * 60 * 60 * 1000;

  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get('utmSource'),
      utmCampaign: params.get('utmCampaign'),
      referralCode: params.get('referralCode'),
    };
  }

  function hasValidParams(params) {
    return params.utmSource && params.utmCampaign && params.referralCode;
  }

  function getStoredParams() {
    const raw = localStorage.getItem(AFFILIATE_KEY.PARAMS);
    return raw ? JSON.parse(raw) : null;
  }

  function getExpiresAt() {
    const raw = localStorage.getItem(AFFILIATE_KEY.EXPIRES_AT);
    return raw ? parseInt(raw, 10) : null;
  }

  function isExpired() {
    const expiresAt = getExpiresAt();
    return !expiresAt || Date.now() > expiresAt;
  }

  function saveAffiliateData(visitorId, params) {
    localStorage.setItem(AFFILIATE_KEY.VISITOR_ID, visitorId);
    localStorage.setItem(AFFILIATE_KEY.PARAMS, JSON.stringify(params));
    localStorage.setItem(AFFILIATE_KEY.EXPIRES_AT, (Date.now() + EXPIRE_TIME_MS).toString());
  }

  function paramsChanged(current, stored) {
    return (
      current.utmSource !== stored.utmSource ||
      current.utmCampaign !== stored.utmCampaign ||
      current.referralCode !== stored.referralCode
    );
  }

  async function initializeVisitor(params) {
    try {
      const response = await fetch(`${BASE_API_URL}/affiliate/visitor/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error('Failed to initialize visitor');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Error initializing visitor:', error);
      return null;
    }
  }

  async function checkVisitorUsage(visitorId) {
    try {
      const res = await fetch(`${BASE_API_URL}/affiliate/visitor/${visitorId}/usage`);
      if (!res.ok) throw new Error('Failed to check usage');
      const json = await res.json();
      return json.data?.usedOrEmpty || false;
    } catch (err) {
      console.error('Error checking visitor usage:', err);
      return true;
    }
  }

  async function handleAffiliateTracking() {
    const currentParams = getUrlParams();
    if (!hasValidParams(currentParams)) return;

    const storedParams = getStoredParams();
    const expired = isExpired();

    const visitorId = localStorage.getItem(AFFILIATE_KEY.VISITOR_ID);
    let needNewVisitor = false;

    if (!visitorId) {
      needNewVisitor = true;
    } else {
      const usedOrEmpty = await checkVisitorUsage(visitorId);
      if (usedOrEmpty) {
        needNewVisitor = true;
      }
    }
    if (needNewVisitor || expired || paramsChanged(currentParams, storedParams)) {
      const data = await initializeVisitor(currentParams);
      const newVisitorId = data?.affiliateVisitor?.id;
      if (newVisitorId) {
        saveAffiliateData(newVisitorId, currentParams);
      }
    }
  }

  handleAffiliateTracking();
};
