import { CONFIG } from '../config';

export const mailChimpClient = require('@mailchimp/mailchimp_marketing');

mailChimpClient.setConfig({
  apiKey: CONFIG.MAIL_CHIMP_API_KEY,
  server: CONFIG.MAIL_CHIMP_SERVER_PREFIX,
});
