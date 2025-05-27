import {
  ERROR_KEYS,
  JobsEnum,
  LoanResponseStatusEnum,
  MlcbGradeEnum,
  NotificationTypeEnum,
  Prisma,
  UserRoleEnum,
} from '@roshi/shared';
import { prismaClient } from '../../clients/prismaClient';
import { getZeroInterestIpaForBest, getZeroInterestIpaForEz } from '../../data/autoIpa';
import { MLCBReportSchema } from '../../models/mlcbReport.model';
import { formatApplicantForAdmin } from '../../services/applicantInfo.service';
import { getGrade, getMLCBReportByLoanRequestId } from '../../services/leadGrading.service';
import { convertToNormalLoanRequest, getLoanRequest } from '../../services/loanRequest.service';
import { createLoanResponse } from '../../services/loanResponse.service';
import { sendNotification } from '../../services/notification.service';
import { RoshiError } from '../../utils/roshiError';
import { boss } from '../boss';
import { JobPayload } from '../jobsData';

const queueName = JobsEnum.ZERO_INTEREST_LOAN_REQUEST;
export const initZeroInterestLoanRequestJob = () => {
  boss.work<JobPayload<typeof queueName>>(queueName, { pollingIntervalSeconds: 10 }, async ([job]) => {
    const loanRequest = await getLoanRequest(job.data.loanRequestId);
    if (!loanRequest.applicantInfo) throw new RoshiError(ERROR_KEYS.NOT_FOUND, { message: 'ApplicantInfo not found' });

    const applicantInfo = formatApplicantForAdmin(loanRequest.applicantInfo);

    //Notify admin
    await sendNotification({
      notificationType: NotificationTypeEnum.NEW_LOAN_REQUEST,
      targetType: UserRoleEnum.ADMIN,
      payload: {
        loanRequestId: loanRequest.id,
      },
    });

    if (applicantInfo.monthlyIncome < 4000) {
      convertToNormalLoanRequest(loanRequest.id);
      return;
    }

    try {
      const mlcbReport = await getMLCBReportByLoanRequestId(loanRequest.id);
      await prismaClient.loanRequestGrading.upsert({
        where: {
          loanRequestId: loanRequest.id,
        },
        create: {
          loanRequestId: loanRequest.id,
          mlcbReport: mlcbReport as Prisma.JsonObject,
        },
        update: {
          mlcbReport: mlcbReport as Prisma.JsonObject,
        },
      });

      let grade: MlcbGradeEnum = MlcbGradeEnum.UNKNOWN;
      if (mlcbReport) {
        const parsed = MLCBReportSchema.parse(mlcbReport);
        grade = getGrade(parsed, applicantInfo.monthlyIncome);
      }

      if (grade === MlcbGradeEnum.BAD || grade === MlcbGradeEnum.SUB) {
        convertToNormalLoanRequest(loanRequest.id);
        return;
      }
      //If error, we can continue and check for auto-approvals
    } catch (e) {
      console.error('Error while fetching MLCB report', e);
    }

    //Check for auto-approvals (only on creation)
    const offers = [getZeroInterestIpaForEz(loanRequest), getZeroInterestIpaForBest(loanRequest)];

    // Convert loan application to normal if it is not eligible
    if (offers.length === 0 || offers.every((offer) => !offer)) {
      convertToNormalLoanRequest(loanRequest.id);
      return;
    }

    for (const offer of offers) {
      if (offer && offer.companyId) {
        try {
          await createLoanResponse(
            offer.companyId,
            {
              status: LoanResponseStatusEnum.ACCEPTED,
              loanRequestId: loanRequest.id,
              offer: offer.offer,
              acceptedAt: new Date(),
            },
            true,
          );
        } catch (e) {
          console.error('Error creating loan response', e);
        }
      }
    }
  });
};
