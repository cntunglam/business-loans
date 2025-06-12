import { Prisma } from '@roshi/shared';
import { ChatGptConversation, runPrompt } from './openai.service';

const systemPrompt = `You are a customer support agent for ROSHI.
  ROSHI is a loan marketplace in Singapore. Users apply on the platform, and we forward the application details to several lenders.
  The lenders review the application, and make offers.
  ROSHI shows these offers on the user's dashboard. The customer is able to select the offer and schedule an appointment.
  You need to generate a reply for the customer. The reply must be succinct and be in a format that can be immediately sent without filling out information
  `;

export const commonQnA = [
  `Q: When will I receive the cashback?
A: The cashback will be transferred to you via PAYNOW within 30 days. If you need further assistance or have more questions, feel free to ask!
`,
  `
Q: When will I received the $20 NTUC voucher?
A: The Fair Price Voucher will be email to you within 30 days. If you need further assistance or have more questions, feel free to ask!
`,
  `
Q: Can apply online or need to go down to office/shop?
A: Hello! Yes, you can complete the loan application online through our platform. After you apply and receive offers from lenders, you can select your prefer offer and book an appointments. Typically, you'll need to visit the lender in person to finalize the application.
`,
  `
Q: Hi, I'm interested in the Price Beat Guarantee offer
A: Thank you for contacting ROSHI. I am happy to assist you with your enquiry.

To proceed with the Price Beat Guarantee offer, the first step is to submit an online application on the ROSHI website. If you have already submitted an application and the offers received are not satisfactory, please let us know the details of those offers that you have received from other loan provider, and we will do our best to match and provide better offers.
`,
  `
Q: Do I need to go to the office? / Can do it online?
A: Based on Singapore's rules and regulations, the loan process requires face-to-face verification, and the loan documents must be signed at a licensed moneylender's office. This is also an effective way to differentiate between legal and illegal moneylenders. If you encounter any transactions conducted online without face-to-face verification, please be aware that it may involve illegal moneylenders.
`,
  `
Q: Can I negotiate my tenure or loan amount?
A: Sure, you can! During your appointment with our lenders, you'll have the opportunity to discuss and negotiate the tenure and loan amount to better suit your financial needs.
`,
  `
Q: What are the requirements?
A: To apply for a loan, you must meet the following requirements: - Be at least 21 years old. - Have a stable income in Singapore.
`,
  `
Q: What documents do I need to bring?
A: No worries, the lender will contact you once an appointment is made. Typically, for a loan application, the required documents are: 1. NRIC/FIN (to verify your identity). 2. Proof of income (e.g., payslips or CPF contributions) for the last 3 months. 3. Proof of residential address (e.g., utility bill, tenancy agreement, or bank statement).
`,
  `
Q: I am not living in Singapore. Can I still apply for a loan?
A: A proof of Singapore residential address is required to apply for a loan. Without this, your application may not be accepted by most lenders.
`,
];

export const generateReply = (
  target: Prisma.WaUserGetPayload<{ include: { receivedMessages: true; sentMessages: true } }>,
  instruction?: string,
) => {
  const conversation: ChatGptConversation[] = [...target.sentMessages, ...target.receivedMessages]
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((message) => ({ role: message.sourceWaPhone === target.phone ? 'user' : 'assistant', content: message.text }));

  return runPrompt(
    systemPrompt,
    commonQnA,
    conversation,
    instruction ? `Use this instruction to generate your next reply: ${instruction}` : undefined,
  );
};
