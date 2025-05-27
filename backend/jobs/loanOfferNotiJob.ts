// import PgBoss from 'pg-boss';
// import { boss, DEFAULT_QUEUE_LIST } from './boss';

// const QUEUE_NAME = DEFAULT_QUEUE_LIST.LOAN_OFFER_NOTIFICATION;

// type LoanOfferNoti = { email: string; lenderName: string; amount: string; interestRate: string };

// type JobData = {
//   offers: LoanOfferNoti[];
// };

// const NOTIFICATION_DELAY_TIME = 5 * 60 * 1000; // 5 minutes

// async function createLoanOfferNotiJob(borrowerId: string, data: LoanOfferNoti) {
//   try {
//     // set jobId = borrowerId to re-schedule job
//     const jobId = borrowerId;
//     // check for an existing job by jobId
//     const existing = await boss.getJobById(QUEUE_NAME, jobId);

//     const jobData: JobData = {
//       offers: [],
//     };

//     if (existing?.data) {
//       await boss.deleteJob(QUEUE_NAME, jobId); // delete the existing job if it exists
//       jobData.offers = [...(existing.data as JobData).offers, data];
//     } else {
//       jobData.offers.push(data);
//     }

//     await boss.send(QUEUE_NAME, jobData, {
//       id: jobId,
//       startAfter: new Date(new Date().getTime() + NOTIFICATION_DELAY_TIME),
//     });
//   } catch (error) {
//     console.log(`${QUEUE_NAME}:: create job failed!`);
//   }
// }

// // handle when lender delete a offer in 5 minutes
// async function deleteLoanOfferNotiJob(borrowerId: string, lenderName: string) {
//   try {
//     const jobId = borrowerId;
//     // check for an existing job by jobId
//     const existing = await boss.getJobById(QUEUE_NAME, jobId);

//     if (!existing) return;

//     await boss.deleteJob(QUEUE_NAME, jobId); // Delete the existing job if it exists

//     // check if the offer is exist
//     const existingOffer = [...(existing.data as JobData).offers].find((item) => item.lenderName !== lenderName);
//     if (!existingOffer) return;

//     const jobData: JobData = {
//       offers: [],
//     };
//     // remove offer
//     jobData.offers = [...(existing.data as JobData).offers].filter((item) => item.lenderName !== lenderName);

//     // re-create a new job if there is an offer
//     if (jobData.offers.length > 0) {
//       await boss.send(QUEUE_NAME, jobData, {
//         id: jobId,
//         startAfter: existing?.startAfter, // keep schedule time of previous job
//       });
//     }
//   } catch (error) {
//     console.log(`${QUEUE_NAME}:: delete job failed!`);
//   }
// }

// async function processing(job: PgBoss.Job<unknown>) {
//   if ((job.data as JobData)?.offers) {
//     await Promise.allSettled(
//       ((job.data as JobData).offers || []).map(async (item) => {
//         return await sendLoanOfferReceivedEmail(
//           item.email,
//           item.lenderName,
//           item.amount.toString(),
//           item.interestRate.toString(),
//         );
//       }),
//     ).catch((err) => console.error('Error sending loan offer received email', err));
//   }
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

// export { createLoanOfferNotiJob, deleteLoanOfferNotiJob };
