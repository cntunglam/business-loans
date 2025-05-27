import { ShortUrlTypeEnum } from '@roshi/shared';
import { addYears } from 'date-fns';
import { CONFIG } from '../config';
import { createShortUrl } from '../services/shortUrl.service';

(async () => {
  const shortUrl = await createShortUrl({
    type: ShortUrlTypeEnum.REDIRECT,
    targetUrl: CONFIG.CIMB_OFFER_LINK,
    userId: '0e0e159b-7a53-47e9-aa27-94d23e9d2c6a',
    expiresAt: addYears(new Date(), 1),
  });

  console.log(shortUrl);

  const newUrl = await createShortUrl({
    type: ShortUrlTypeEnum.API_ACCESS,
    userId: '0e0e159b-7a53-47e9-aa27-94d23e9d2c6a',
    allowedPaths: [
      '/api/v1/loan-request/me',
      '/api/v1/company/*/store',
      '/api/v1/appointment',
      '/api/v1/appointment/*',
    ],
  });
  console.log(newUrl);
})();
