import { prismaClient } from '../clients/prismaClient';
import { generateOffersHtml } from '../data/emailTemplates/emailTemplatesHelper';
import { EmailTypeEnum, sendEmail } from '../services/email.service';
import { generateBookingUrl } from '../services/shortUrl.service';

export const testEmails = async (loanRequestId?: string) => {
  // const lq = await prismaClient.loanRequest.findFirst();
  // loanRequestId = lq?.id;
  if (loanRequestId) {
    const loanRequest = await prismaClient.loanRequest.findUniqueOrThrow({
      where: { id: loanRequestId },
      include: { user: true },
    });
    const loanResponses = await prismaClient.loanResponse.findMany({
      where: {
        loanRequestId,
      },
      include: { lender: true, loanOffer: true },
    });

    const offersHtml = generateOffersHtml(loanResponses);

    sendEmail('example@example.com', EmailTypeEnum.LOAN_OFFER_RECEIVED, {
      offers: offersHtml,
      offersCount: loanResponses.length.toString(),
      bookingUrl: await generateBookingUrl(loanRequest.user.id),
    });
  }
  // sendEmail('example@example.com', EmailTypeEnum.NEW_LOAN_REQUEST, {
  //   amount: '10000',
  //   purpose: 'Personal Loan',
  //   term: '12',
  //   monthlyIncome: '5000',
  //   residencyStatus: 'Resident',
  //   loanRequestLink: 'https://roshi.sg',
  // });
  // sendEmail('example@example.com', EmailTypeEnum.OTP, { otp: '12345' });
  // sendEmail('example@example.com', EmailTypeEnum.WELCOME, { fullName: 'Joe' });
};

if (require.main === module) {
  const [loanRequestId] = process.argv.slice(2);
  if (!loanRequestId) {
    console.error('Usage: ts-node testEmail.ts <loanRequestId>');
    process.exit(1);
  }
  testEmails(loanRequestId)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
