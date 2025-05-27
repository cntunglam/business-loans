// import { LoanResponseStatusEnum } from '@roshi/shared';
// import PgBoss from 'pg-boss';
// import { createLoanOffer } from '../services/loanOffer.service';
// import { boss, DEFAULT_QUEUE_LIST } from './boss';

// const QUEUE_NAME = DEFAULT_QUEUE_LIST.LOAN_OFFER_APPROVAL;

// const APPROVAL_DELAY_TIME = 3 * 10 * 1000; // 30 minutes

// type LoanOfferApproval = {
//   company: any;
//   offer: {
//     amount: number;
//     term: number;
//     monthlyInterestRate: number;
//     variableUpfrontFees: number;
//     fixedUpfrontFees: number;
//   };
// } | null;

// type JobData = {
//   email: string;
//   offers: LoanOfferApproval[];
// };

// async function createLoanOfferApprovalJob(applicationId: string, email: string, offers: LoanOfferApproval[]) {
//   try {
//     const jobId = applicationId;
//     await boss.send(
//       QUEUE_NAME,
//       { email, offers },
//       {
//         id: jobId,
//         startAfter: new Date(new Date().getTime() + APPROVAL_DELAY_TIME),
//       },
//     );
//   } catch (error) {
//     console.log(`${QUEUE_NAME}:: create job failed!`);
//   }
// }

// async function processing(job: PgBoss.Job<unknown>) {
//   const offers = (job.data as JobData)?.offers || [];
//   const email = (job.data as JobData)?.email || '';

//   await Promise.allSettled(
//     offers.map(async (offer) => {
//       return await createLoanOffer(
//         offer?.company,
//         { status: LoanResponseStatusEnum.ACCEPTED, loanRequestId: job.id, offer: offer?.offer },
//         { email: email },
//         true,
//       );
//     }),
//   ).catch((err) => console.error('Error sending loan offer received email', err));
//   await boss.deleteJob(QUEUE_NAME, job.id);
// }

// async function init() {
//   try {
//     await boss.createQueue(QUEUE_NAME);
//     await boss.work(QUEUE_NAME, async ([job]) => await processing(job));
//   } catch (error) {
//     console.log(`${QUEUE_NAME}:: processing failed!`);
//   }
// }

// init();

// export { createLoanOfferApprovalJob };
