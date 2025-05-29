import {
  ActivityLogEnum,
  Company,
  CountriesEnum,
  ERROR_KEYS,
  hasCustomerSupportPermissions,
  JobsEnum,
  JwtPayload,
  LeadComputedStatus,
  LoanRequestStatusEnum,
  LoanRequestTypeEnum,
  LoanResponseStatusEnum,
  Prisma,
  SgManualFormSchema,
  StatusEnum,
  SupportDataSchema,
  TargetTypeEnum,
} from '@roshi/shared';
import { differenceInDays, differenceInHours, isBefore, subDays } from 'date-fns';
import { z } from 'zod';
import { prismaClient } from '../clients/prismaClient';
import { CONFIG } from '../config';
import { createJob } from '../jobs/boss';
import { RoshiError } from '../utils/roshiError';
import { getCurrentTime } from '../utils/utils';
import { createActivityLog } from './activityLog.service';
import {
  formatApplicantForAdmin,
  formatApplicantForBorrower,
  formatApplicantInfoForLender,
} from './applicantInfo.service';
import { formatLoanResponseForBorrower } from './loanResponse.service';

export const verifyLenderAccess = async (user?: JwtPayload, loanRequestId?: string) => {
  if (!user?.sub) throw new RoshiError(ERROR_KEYS.FORBIDDEN);
  const company = await prismaClient.company.findFirst({
    where: { users: { some: { id: user.sub } }, status: 'ACTIVE' },
  });

  const hasPermission = hasCustomerSupportPermissions(user?.role);

  if (!company && !hasPermission) throw new RoshiError(ERROR_KEYS.FORBIDDEN);

  const query: Prisma.LoanRequestWhereUniqueInput = {
    id: loanRequestId,
    country: hasPermission ? undefined : company!.country,
  };

  if (!hasPermission) {
    query.status = { not: LoanRequestStatusEnum.DELETED };
  }
  //Verify that application country matches company country
  const loanRequest = await prismaClient.loanRequest.findUniqueOrThrow({
    where: query,
    include: {
      user: true,
      applicantInfo: { include: { documents: { where: { isDeleted: false } } } },
      guarantorInfo: { include: { documents: { where: { isDeleted: false } } } },
      loanResponses: {
        include: {
          lender: { include: { stores: true } },
          loanOffer: true,
          appointment: { include: { openingHours: { include: { store: true } } } },
          closedDealOffer: true,
        },
        where: hasPermission ? undefined : { lenderId: company!.id },
      },
    },
  });

  return { company: company!, loanRequest };
};

export const getUserLastLoanRequest = async (userId: string) => {
  return await prismaClient.loanRequest.findFirst({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      applicantInfo: { include: { documents: { where: { isDeleted: false } } } },
      guarantorInfo: { include: { documents: { where: { isDeleted: false } } } },
      loanResponses: {
        where: {
          status: LoanResponseStatusEnum.ACCEPTED,
          outcomeStatus: StatusEnum.PENDING,
        },
        include: {
          loanOffer: true,
          lender: {
            include: {
              stores: {
                select: {
                  ratings: true,
                },
              },
            },
          },
          closedDealOffer: true,
          appointment: {
            where: {
              cancelledAt: null,
            },
            include: {
              openingHours: { include: { store: { include: { openingHours: { include: { store: true } } } } } },
            },
          },
        },
      },
    },
  });
};

//Never return the result of this to lenders
export const getLoanRequest = (loanRequestId: string) => {
  return prismaClient.loanRequest.findUniqueOrThrow({
    where: { id: loanRequestId },
    include: {
      loanResponses: {
        include: {
          lender: { include: { stores: true } },
          loanOffer: true,
          appointment: { where: { cancelledAt: null }, include: { openingHours: { include: { store: true } } } },
          closedDealOffer: true,
        },
      },
      user: true,
      applicantInfo: { include: { documents: true } },
      guarantorInfo: { include: { documents: true } },
    },
  });
};

export const getLoanRequestByUserId = (userId: string) => {
  return prismaClient.loanRequest.findFirstOrThrow({
    where: { userId, status: LoanRequestStatusEnum.ACTIVE },
    include: {
      loanResponses: {
        include: {
          lender: { include: { stores: true } },
          loanOffer: true,
          appointment: { include: { openingHours: { include: { store: true } } } },
          closedDealOffer: true,
        },
      },
      user: true,
      applicantInfo: { include: { documents: true } },
      guarantorInfo: { include: { documents: true } },
    },
  });
};

export const formatLoanRequestForLender = (
  loanRequest: Partial<
    Prisma.LoanRequestGetPayload<{
      include: {
        loanResponses: {
          include: {
            lender: { include: { stores: true } };
            loanOffer: true;
            appointment: { include: { openingHours: { include: { store: true } } } };
            closedDealOffer: true;
          };
        };
        applicantInfo: { include: { documents: true } };
        guarantorInfo: { include: { documents: true } };
      };
    }>
  >,
  companyId?: string,
) => {
  return {
    id: loanRequest.id!,
    status: loanRequest.status!,
    purpose: loanRequest.purpose!,
    amount: loanRequest.amount!,
    term: loanRequest.term!,
    loanResponses: companyId ? (loanRequest.loanResponses || []).filter((lr) => lr.lenderId === companyId) : null,
    createdAt: loanRequest.createdAt,
    approvedAt: loanRequest.approvedAt,
    publicNote: loanRequest.publicNote,
    privateNote: undefined,
    applicantInfo: loanRequest.applicantInfo
      ? formatApplicantInfoForLender(loanRequest.applicantInfo, {
          allowPersonalInformation: false,
          isReapply: loanRequest.isAutoReapply,
        })
      : null,
    guarantorInfo: loanRequest.guarantorInfo ? formatApplicantInfoForLender(loanRequest.guarantorInfo) : null,
  };
};

export const formatLoanRequestForBorrower = (
  loanRequest: Prisma.LoanRequestGetPayload<{
    include: {
      loanResponses: {
        include: {
          loanOffer: true;
          lender: {
            include: {
              stores: {
                select: {
                  ratings: true;
                };
              };
            };
          };
          appointment: {
            include: {
              openingHours: { include: { store: { include: { openingHours: { include: { store: true } } } } } };
            };
          };
          closedDealOffer: true;
        };
      };
      applicantInfo: { include: { documents: true } };
      guarantorInfo: { include: { documents: true } };
    };
  }>,
) => {
  const isFullfilled = loanRequest.loanResponses.some((lr) => lr.outcomeStatus === StatusEnum.APPROVED);
  return {
    id: loanRequest.id!,
    status: loanRequest.status!,
    purpose: loanRequest.purpose!,
    amount: loanRequest.amount!,
    term: loanRequest.term!,
    loanResponses: loanRequest.loanResponses.map((loanResponse) => formatLoanResponseForBorrower(loanResponse)),
    applicantInfo: loanRequest.applicantInfo ? formatApplicantForBorrower(loanRequest.applicantInfo) : null,
    guarantorInfo: loanRequest.guarantorInfo ? formatApplicantForBorrower(loanRequest.guarantorInfo) : null,
    createdAt: loanRequest.createdAt,
    isExpired:
      differenceInDays(new Date(), loanRequest.createdAt) > CONFIG.LEAD_EXPIRATION_DAYS ||
      loanRequest.status === LoanRequestStatusEnum.DELETED,
    isFullfilled,
    isWithdrawn: loanRequest.status === LoanRequestStatusEnum.DELETED,
    offersCount: loanRequest.loanResponses.filter(
      (lr) => lr.status === LoanResponseStatusEnum.ACCEPTED && lr.outcomeStatus === StatusEnum.PENDING,
    ).length,
  };
};

export const formatLoanRequestForAdmin = (
  loanRequest: Prisma.LoanRequestGetPayload<{
    include: {
      user: {
        select: {
          id: true;
          email: true;
          phone: true;
          name: true;
        };
      };
      activityLogs: {
        orderBy: { createdAt: 'desc' };
        take: 1;
      };
      loanResponses: {
        select: {
          id: true;
          appointment: {
            select: {
              id: true;
              status: true;
              scheduledTime: true;
              cancelledAt: true;
              openingHours: { select: { store: true } };
            };
          };
          lender: { select: { id: true; name: true; logo: true } };
          acceptedAt: true;
          outcomeStatus: true;
          status: true;
          closedDealOffer: true;
        };
      };
      applicantInfo: { include: { documents: { where: { isDeleted: false } } } };
      customerSupport: { select: { id: true; name: true } };
    };
  }>,
) => {
  const supportData = SupportDataSchema.parse(loanRequest.supportData || {});
  const leadComputedStatus = (() => {
    if (loanRequest.loanResponses.some((lr) => lr.outcomeStatus === StatusEnum.APPROVED)) return LeadComputedStatus.WON;
    if (loanRequest.status === LoanRequestStatusEnum.DELETED) return LeadComputedStatus.WITHDRAWN;
    if (
      loanRequest.loanResponses.every(
        (res) => res.outcomeStatus === StatusEnum.REJECTED || res.status === LoanResponseStatusEnum.REJECTED,
      ) &&
      loanRequest.loanResponses.length >= CONFIG.REJECTION_THRESHOLD
    )
      return LeadComputedStatus.REJECTED;
    if (supportData.isNoResponse) return LeadComputedStatus.NO_RESPONSE;
    if (
      !supportData?.checklist &&
      !loanRequest.approvedAt &&
      !loanRequest.privateNote &&
      !loanRequest.publicNote &&
      loanRequest.createdAt > subDays(new Date(), 3)
    )
      return LeadComputedStatus.NEW;
    //If any appointment in the past
    if (
      loanRequest.loanResponses.some((res) => {
        if (!res.appointment?.scheduledTime || res.outcomeStatus !== StatusEnum.PENDING || res.appointment.cancelledAt)
          return false;
        const scheduledDateTime = new Date(res.appointment.scheduledTime);
        return isBefore(scheduledDateTime, getCurrentTime());
      })
    ) {
      return LeadComputedStatus.WAITING_OUTCOME;
    }
    if (
      (loanRequest.activityLogs.length === 0 || loanRequest.activityLogs[0].createdAt < subDays(new Date(), 5)) &&
      loanRequest.createdAt < subDays(new Date(), 5)
    )
      return LeadComputedStatus.NO_ACTIVITY;
    return LeadComputedStatus.IN_PROGRESS;
  })();

  return {
    ...loanRequest,
    applicantInfo: loanRequest.applicantInfo ? formatApplicantForAdmin(loanRequest.applicantInfo) : null,
    supportData,
    leadComputedStatus,
  };
};

export const convertToNormalLoanRequest = async (loanRequestId: string, userId?: string) => {
  if (!loanRequestId) throw new RoshiError(ERROR_KEYS.NOT_FOUND);

  const loanRequest = await prismaClient.loanRequest.findUniqueOrThrow({
    where: { id: loanRequestId },
    select: { type: true },
  });
  if (loanRequest.type !== LoanRequestTypeEnum.ZERO_INTEREST)
    throw new RoshiError(ERROR_KEYS.INVALID_LOAN_REQUEST_STATUS);

  //Delete potential zero interest loan responses
  await prismaClient.loanResponse.deleteMany({
    where: { loanRequestId: loanRequestId, appointment: null, outcomeStatus: { not: StatusEnum.APPROVED } },
  });

  await prismaClient.loanRequest.update({
    where: {
      id: loanRequestId,
    },
    data: {
      type: LoanRequestTypeEnum.GENERAL,
    },
  });

  createJob(JobsEnum.NEW_LOAN_REQUEST, { loanRequestId: loanRequestId });
  await createActivityLog({
    userId,
    loanRequestId: loanRequestId,
    activityType: ActivityLogEnum.REJECTED_FROM_ZERO_INTEREST,
    targetType: TargetTypeEnum.LOAN_REQUEST,
  });
};

export const getWhereClause = (company: Company, tab: string) => {
  const whereClause: Prisma.LoanRequestWhereInput = {
    status: { not: LoanRequestStatusEnum.DELETED },
    createdAt: { gte: subDays(new Date(), CONFIG.LEAD_EXPIRATION_DAYS) },
    country: company.country,
  };
  if (tab === 'new') {
    whereClause.approvedAt = { not: null };
    whereClause.loanResponses = {
      none: { lenderId: company.id },
    };
  } else if (tab === 'approved') {
    whereClause.loanResponses = {
      some: {
        lenderId: company.id,
        status: LoanResponseStatusEnum.ACCEPTED,
        outcomeStatus: StatusEnum.PENDING,
        acceptedAt: null,
      },
    };
  } else if (tab === 'rejected') {
    whereClause.loanResponses = {
      some: {
        lenderId: company.id,
        OR: [{ status: LoanResponseStatusEnum.REJECTED }, { outcomeStatus: StatusEnum.REJECTED }],
      },
    };
  } else if (tab === 'offer-accepted') {
    whereClause.createdAt = undefined;
    whereClause.loanResponses = {
      some: {
        lenderId: company.id,
        status: LoanResponseStatusEnum.ACCEPTED,
        outcomeStatus: StatusEnum.PENDING,
        OR: [
          {
            appointment: { scheduledTime: { not: null }, cancelledAt: null },
          },
          { acceptedAt: { gt: subDays(new Date(), CONFIG.LEAD_EXPIRATION_DAYS) } },
        ],
      },
    };
  }

  return whereClause;
};

export const createLoanRequestSchema = z.object({
  purpose: z.string().max(255),
  amount: z.coerce.number().int().positive(),
  term: z.coerce.number().int().positive(),
  type: z.nativeEnum(LoanRequestTypeEnum),
  referer: z.string().optional(),
  override: z.boolean().optional(),

  applicantInfo: SgManualFormSchema,
});

export const createNewLoanRequest = async (
  data: z.infer<typeof createLoanRequestSchema>,
  userId: string,
  override?: boolean,
) => {
  const existingApplication = await getUserLastLoanRequest(userId);
  if (existingApplication) {
    const formatted = formatLoanRequestForBorrower(existingApplication);
    const isApplicationActive = !formatted.isExpired && !formatted.isFullfilled && !formatted.isWithdrawn;
    if (isApplicationActive) {
      const isSubmittedRecently = differenceInHours(new Date(), new Date(existingApplication.createdAt)) < 24;
      if (isSubmittedRecently) {
        throw new RoshiError(ERROR_KEYS.ONLY_ONE_APPLICATION_PER_24H);
      }
      if (!override) {
        throw new RoshiError(ERROR_KEYS.ONLY_ONE_APPLICATION_PER_USER);
      }
    }
  }

  const newApplication = await prismaClient.$transaction(async (tx) => {
    const applicantInfo = await tx.applicantInfo.create({
      data: data.applicantInfo,
    });
    const now = new Date();

    const newLr = await tx.loanRequest.create({
      data: {
        amount: data.amount,
        term: data.term,
        purpose: data.purpose,
        country: CountriesEnum.SG,
        status: LoanRequestStatusEnum.ACTIVE,
        userId: userId,
        applicantInfoId: applicantInfo.id,
        type: data.type,
        referer: data.referer,
        approvedAt: now,
        createdAt: now,
      },
    });

    if (existingApplication) {
      await tx.loanRequest.update({
        where: { id: existingApplication.id },
        data: { status: LoanRequestStatusEnum.DELETED },
      });
      await createActivityLog({
        userId: existingApplication.userId,
        loanRequestId: existingApplication.id,
        activityType: ActivityLogEnum.LOAN_REQUEST_DELETED,
        targetType: TargetTypeEnum.LOAN_REQUEST,
        targetId: existingApplication.id,
      });
    }
    return newLr;
  });

  let jobType = JobsEnum.NEW_LOAN_REQUEST;

  if (data.type === LoanRequestTypeEnum.ZERO_INTEREST) jobType = JobsEnum.ZERO_INTEREST_LOAN_REQUEST;

  await createActivityLog({
    userId: newApplication.userId,
    loanRequestId: newApplication.id,
    activityType: ActivityLogEnum.LOAN_REQUEST_CREATED,
    targetType: TargetTypeEnum.LOAN_REQUEST,
  });

  createJob(jobType, { loanRequestId: newApplication.id });
  return newApplication;
};
