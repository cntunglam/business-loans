import { Prisma, ShortUrlTypeEnum } from '@roshi/shared';
import { prismaClient } from '../../clients/prismaClient';
import { CONFIG } from '../../config';
import { createShortUrl } from '../../services/shortUrl.service';

export const generateOffersHtml = (
  offers: Prisma.LoanResponseGetPayload<{ include: { lender: true; loanOffer: true } }>[],
) => {
  return offers
    .filter((offer) => !!offer.loanOffer)
    .map((offer) => {
      return `
       <div style="border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; margin-bottom: 24px">
        <table width="100%" cellpadding="10" cellspacing="0"
          style="border-collapse: collapse; font-size: 16px; color: #545454; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
          <tr>
            <td rowspan="4" width="120" align="center" style="border-right: 1px solid #e0e0e0; background-color: #FBFBFB;">
              <img src="${offer.lender.logo}" alt="EZ Loan Logo" style="max-width: 100px;" />
            </td>
            <td width="120"
              style="padding: 10px; border-right: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0; background-color: #FBFBFB;">
              Offer from</td>
            <td
              style="padding: 10px; font-weight: bold; color: #25282B; border-bottom: 1px solid #e0e0e0; background-color: #FBFBFB;">
              ${offer.lender.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 10px; border-right: 1px solid #e0e0e0;">Loan amount</td>
            <td style="padding: 10px; font-weight: bold; color: #25282B;">$${offer.loanOffer!.amount}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e0e0e0; background-color: #FBFBFB;">
            <td style="padding: 10px; border-right: 1px solid #e0e0e0;">Interest rate</td>
            <td style="padding: 10px; font-weight: bold;">${offer.loanOffer!.monthlyInterestRate}% per month</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-right: 1px solid #e0e0e0;">Loan tenure</td>
            <td style="padding: 10px; font-weight: bold; color: #25282B;">${offer.loanOffer!.term} months</td>
          </tr>
        </table>
      </div>
    `;
    })
    .join('\n');
};

const getUnsubscribeCode = (userId: string) => {
  return createShortUrl({
    type: ShortUrlTypeEnum.API_ACCESS,
    userId,
    allowedPaths: ['/api/v1/account/user-settings'],
  });
};

export const generateUnsubReapplyLoanHtml = async (userEmail: string) => {
  const user = await prismaClient.user.findUnique({
    where: {
      email: userEmail,
      // Only applies to borrowers
      role: 'BORROWER',
    },
  });
  if (!user) return '';
  const shortURL = await getUnsubscribeCode(user.id);

  let unsubscribeReapplyLoan = `<p style="font-size: 10px; font-family: helvetica, 'helvetica neue', arial, verdana, sans-serif">
    You received this email because of the re-apply feature from ROSHI. If you want to opt out of this feature, please
    <a href="${CONFIG.SHORT_URL_BASE}/unsubscribe/${shortURL.code}?autoReapplyDisabled=true" target="_blank">
      click here
    </a>
</p>`;

  return unsubscribeReapplyLoan;
};

export const generateUnsubHtml = async (userEmail: string) => {
  const user = await prismaClient.user.findUnique({
    where: {
      email: userEmail,
      // Only applies to borrowers
      role: 'BORROWER',
    },
  });
  if (!user) return '';

  const shortURL = await getUnsubscribeCode(user.id);

  return `
    <p>
      <a href="${CONFIG.SHORT_URL_BASE}/unsubscribe/${shortURL.code}?emailNotificationsDisabled=true" target="_blank"
        ><span
          style="
            font-size: 10px;
            font-family: helvetica, 'helvetica neue', arial, verdana, sans-serif;
          "
          >Click here to unsubscribe</span
        ></a
      >
    </p>
  `;
};
