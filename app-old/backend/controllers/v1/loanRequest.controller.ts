import { bankLoanCriteria, ERROR_KEYS, SgManualFormSchema, zodPageNumber } from '@roshi/shared';
import { ActivityLogEnum, LoanRequestStatusEnum, StatusEnum, TargetTypeEnum } from '@roshi/shared/models/databaseEnums';
import { randomUUID } from 'crypto';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { Request, Response } from 'express';
import _ from 'lodash';
import { z } from 'zod';
import { prismaClient } from '../../clients/prismaClient';
import { CONFIG } from '../../config';
import { createActivityLog } from '../../services/activityLog.service';
import { formatApplicantInfoForLender } from '../../services/applicantInfo.service';
import { getCompanyFromUserId } from '../../services/company.service';
import {
  formatLoanRequestForBorrower,
  formatLoanRequestForLender,
  getUserLastLoanRequest,
  getWhereClause,
  verifyLenderAccess,
} from '../../services/loanRequest.service';
import { errorResponse } from '../../utils/errorResponse';
import { getLoanRequestPrismaQuery } from '../../utils/prismaUtils';
import { RoshiError } from '../../utils/roshiError';
import { successResponse } from '../../utils/successResponse';

export const getMyLoanRequest = async (req: Request, res: Response) => {
  // await updateUserLastLogin(req.user!.sub);

  const application = await getUserLastLoanRequest(req.user!.sub);

  if (!application) return errorResponse(res, 404, ERROR_KEYS.NOT_FOUND);

  // If this is an inactive auto-reapply loan request, create activation job
  // if (application.approvedAt === null) {
  //   createJob(JobsEnum.ACTIVATE_REAPPLY_LOAN_REQUEST, { loanRequestId: application.id });
  // }

  return successResponse(res, formatLoanRequestForBorrower(application));
};

export const restoreMyLoanRequest = async (req: Request, res: Response) => {
  const { loanRequestId } = req.params;
  const loanRequest = await prismaClient.loanRequest.findFirstOrThrow({
    where: {
      userId: req.user!.sub,
      id: loanRequestId,
      status: LoanRequestStatusEnum.DELETED,
    },
  });
  if (!loanRequest) return errorResponse(res, 404, ERROR_KEYS.NOT_FOUND);

  const result = await prismaClient.loanRequest.update({
    where: { id: loanRequestId },
    data: { status: LoanRequestStatusEnum.ACTIVE },
  });
  createActivityLog({
    userId: req.user?.sub!,
    loanRequestId: loanRequestId,
    activityType: ActivityLogEnum.LOAN_REQUEST_RESTORED,
    targetType: TargetTypeEnum.LOAN_REQUEST,
    targetId: loanRequestId,
  });
  return successResponse(res, result);
};

export const deleteMyLoanRequest = async (req: Request, res: Response) => {
  const loanRequest = await prismaClient.loanRequest.findFirstOrThrow({
    where: { userId: req.user!.sub, status: LoanRequestStatusEnum.ACTIVE },
  });
  const result = await prismaClient.loanRequest.update({
    where: { id: loanRequest.id },
    data: { status: LoanRequestStatusEnum.DELETED },
  });

  createActivityLog({
    userId: req.user?.sub!,
    loanRequestId: loanRequest.id,
    activityType: ActivityLogEnum.LOAN_REQUEST_DELETED,
    targetType: TargetTypeEnum.LOAN_REQUEST,
    targetId: loanRequest.id,
  });

  return successResponse(res, result);
};

export const getPartnerOffers = async (req: Request, res: Response) => {
  const application = await prismaClient.loanRequest.findFirst({
    include: { applicantInfo: true },
    where: { userId: req.user!.sub, status: LoanRequestStatusEnum.ACTIVE },
  });

  if (!application) return successResponse(res, []);
  const appData = application.applicantInfo;
  if (!appData) throw new Error('Invalid application data');
  const matchingOffers = bankLoanCriteria.filter(
    (bankCriteria) =>
      !bankCriteria.disabled &&
      bankCriteria.loan_purpose.includes(application.purpose as any) &&
      appData.monthlyIncome &&
      appData.monthlyIncome * 12 >= bankCriteria.min_income &&
      bankCriteria.min_loan_tenure <= application.term &&
      application.term <= bankCriteria.max_loan_tenure &&
      bankCriteria.min_amount <= application.amount &&
      application.amount <= bankCriteria.max_amount,
  );

  const prioritized = bankLoanCriteria.filter((offer) => offer.isPrioritized);
  //Get min interest rate of prioritized offers to use as baseline
  const minInterestRate = Math.min(...prioritized.map((offer) => offer.interest_rate));
  const sorted = matchingOffers
    .filter((offer) => offer.isPrioritized || offer.interest_rate > minInterestRate)
    .sort((a, b) => a.interest_rate - b.interest_rate);

  //Exclude offers from the same bank
  const uniqSorted = _.uniqBy(sorted, 'bank_id').slice(0, 3);

  const companies = await prismaClient.company.findMany({
    where: {
      id: { in: uniqSorted.map((offer) => offer.bank_id) },
    },
  });

  const resultoffers = uniqSorted.map((offer) => ({
    id: randomUUID(),
    amount: offer.max_amount,
    interestRate: offer.interest_rate,
    fixedUpfrontFees: offer.fixed_processing_fee,
    variableUpfrontFees: offer.variable_processing_fee,
    term: offer.max_loan_tenure,
    description: offer.description_text,
    url: offer.bank_url,
    bankDescription: offer.bank_description,
    company: companies.find((company) => company.id === offer.bank_id),
  }));
  return successResponse(res, resultoffers);
};

export const getLoanRequestById = async (req: Request, res: Response) => {
  const { loanRequest, company } = await verifyLenderAccess(req.user, req.params.id);
  return successResponse(res, formatLoanRequestForLender(loanRequest, company.id));
};

export const getLoanRequestsSchema = z.object({
  page: zodPageNumber,
  tab: z.enum(['new', 'approved', 'rejected', 'offer-accepted']),
});
export const getLoanRequests = async (req: Request, res: Response) => {
  const company = await getCompanyFromUserId(req.user?.sub);

  const { page, tab } = getLoanRequestsSchema.parse(req.query);

  if (company.isFrozenAt && (tab === 'new' || tab === 'approved')) {
    throw new RoshiError(ERROR_KEYS.COMPANY_IS_FROZEN);
  }

  let whereClause = getWhereClause(company, tab);

  const query = getLoanRequestPrismaQuery({
    where: {
      ...whereClause,
      approvedAt: { not: null },
    },
    select: {
      id: true,
      status: true,
      amount: true,
      term: true,
      purpose: true,
      createdAt: true,
      publicNote: true,
      isAutoReapply: true,
      applicantInfo:
        tab === 'rejected'
          ? undefined
          : {
              select: { documents: { where: { isDeleted: false } } },
            },
      loanResponses: {
        where: { lenderId: company.id },
        select: {
          id: true,
          acceptedAt: true,
          createdAt: true,
          isAuto: true,
          loanOffer: true,
          status: true,
          comment: true,
          rejectionReasons: true,
          outcomeStatus: true,
          lender: { select: { id: true, name: true, logo: true } },
          lenderId: true,
          appointment: { include: { openingHours: { include: { store: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: CONFIG.ITEMS_PER_PAGE,
    skip: (page! - 1) * CONFIG.ITEMS_PER_PAGE,
  });

  const [loanRequests, count] = await prismaClient.$transaction([
    prismaClient.loanRequest.findMany(query),
    prismaClient.loanRequest.count({ where: query.where }),
  ]);

  const formattedResponse = loanRequests.map((lr) => ({
    ...lr,
    applicantInfo: lr.applicantInfo
      ? formatApplicantInfoForLender(lr.applicantInfo, {
          allowPersonalInformation: tab === 'offer-accepted',
          isReapply: lr.isAutoReapply,
        })
      : undefined,
  }));

  return successResponse(res, formattedResponse, 'OK', {
    limit: CONFIG.ITEMS_PER_PAGE,
    totalItems: count,
    page: page!,
    totalPages: Math.ceil(count / CONFIG.ITEMS_PER_PAGE),
  });
};

export const getClosedLoanRequestsSchema = z.object({
  page: zodPageNumber,
  month: z.enum(['current', 'previous']),
});
export const getClosedLoanRequests = async (req: Request, res: Response) => {
  const company = await getCompanyFromUserId(req.user?.sub);
  if (!company) throw new RoshiError(ERROR_KEYS.COMPANY_NOT_FOUND);
  const { page, month } = getClosedLoanRequestsSchema.parse(req.query);
  const startDate = month === 'current' ? startOfMonth(new Date()) : startOfMonth(subMonths(new Date(), 1));
  startDate.setHours(0, 0, 0, 0);
  const endDate = endOfMonth(startDate);

  const query = getLoanRequestPrismaQuery({
    where: {
      loanResponses: {
        some: {
          lenderId: company.id,
          outcomeStatus: StatusEnum.APPROVED,
          OR: [
            {
              disbursementDate: {
                gte: startDate,
                lte: endDate,
              },
            },
            {
              closedDealOffer: {
                createdAt: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            },
          ],
        },
      },
    },
    select: {
      user: { select: { name: true } },
      loanResponses: {
        where: { lenderId: company.id },
        select: {
          disbursementDate: true,
          closedDealOffer: { select: { createdAt: true, amount: true, monthlyInterestRate: true, term: true } },
        },
      },
      id: true,
    },
    orderBy: { createdAt: 'desc' },
    take: CONFIG.ITEMS_PER_PAGE,
    skip: (page! - 1) * CONFIG.ITEMS_PER_PAGE,
  });

  const [loanRequests, count] = await prismaClient.$transaction([
    prismaClient.loanRequest.findMany(query),
    prismaClient.loanRequest.count({ where: query.where }),
  ]);

  return successResponse(res, loanRequests, 'OK', {
    limit: CONFIG.ITEMS_PER_PAGE,
    totalItems: count,
    page: page!,
    totalPages: Math.ceil(count / CONFIG.ITEMS_PER_PAGE),
  });
};

export const searchLoanRequestSchema = z.object({
  search: z.string(),
});
export const searchLoanRequest = (req: Request, res: Response) => {
  const { search } = searchLoanRequestSchema.parse(req.params.search);
  const loanRequest = prismaClient.loanRequest.findMany({
    select: { id: true },
    where: { id: { contains: search.trim(), mode: 'insensitive' } },
    take: 10,
  });
  return successResponse(res, loanRequest);
};

export const createGuarantorSchema = z.object({
  applicantInfo: SgManualFormSchema,
});

export const createGuarantor = async (req: Request, res: Response) => {
  const loanRequest = await prismaClient.loanRequest.findFirst({
    where: { userId: req.user!.sub, status: LoanRequestStatusEnum.ACTIVE },
  });

  if (!loanRequest) return errorResponse(res, 400, ERROR_KEYS.NOT_FOUND);

  if (loanRequest.guarantorInfoId) {
    errorResponse(res, 400, ERROR_KEYS.ONLY_ONE_GUARANTOR_ALLOWED);
  }

  const { applicantInfo } = createGuarantorSchema.parse(req.body);
  const newGuarantor = await prismaClient.loanRequest.update({
    where: { id: loanRequest.id },
    data: { guarantorInfo: { create: applicantInfo } },
  });
  return successResponse(res, newGuarantor);
};

export const deleteGuarantor = async (req: Request, res: Response) => {
  //Find existing loan request for current user
  const loanRequest = await prismaClient.loanRequest.findFirstOrThrow({
    where: { userId: req.user!.sub, status: LoanRequestStatusEnum.ACTIVE, guarantorInfoId: { not: null } },
  });

  //We don't delete the guarantor info, just set the id to null
  //Can be deleted later when we clean up the database
  const result = await prismaClient.loanRequest.update({
    where: { id: loanRequest.id },
    data: { guarantorInfoId: null },
  });

  return successResponse(res, result);
};

export const assignCustomerSupport = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { customerSupportId } = req.body;

  try {
    const loanRequest = await prismaClient.loanRequest.update({
      where: { id },
      data: { customerSupportId },
    });
    return successResponse(res, loanRequest);
  } catch (error) {
    return errorResponse(res, 400, ERROR_KEYS.BAD_REQUEST);
  }
};

export const getActivityLogsByLoanRequestId = async (req: Request, res: Response) => {
  const { id } = req.params;
  const activityLogs = await prismaClient.activityLog.findMany({
    where: { loanRequestId: id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      targetId: true,
      activityType: true,
      createdAt: true,
      user: {
        select: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          name: true,
          role: true,
          id: true,
        },
      },
    },
  });
  return successResponse(res, activityLogs);
};

export const getLoanResponsesByLoanRequestId = async (req: Request, res: Response) => {
  const { id } = req.params;
  const loanResponses = await prismaClient.loanResponse.findMany({
    where: { loanRequestId: id },
    include: {
      appointment: true,
      closedDealOffer: true,
      loanOffer: true,
      lender: true,
    },
  });
  return successResponse(res, loanResponses);
};
