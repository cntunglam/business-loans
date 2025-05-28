import {
  ActivityLogEnum,
  CompanyStatusEnum,
  CompanyTypeEnum,
  CountriesEnum,
  ERROR_KEYS,
  JobsEnum,
  LoanRequestStatusEnum,
  LoanResponseSupportDataSchema,
  MessageTemplatesEnum,
  NotificationTypeEnum,
  Prisma,
  ShortUrlTypeEnum,
  StatusEnum,
  SupportDataSchema,
  TargetTypeEnum,
  UserRoleEnum,
  UserStatusEnum,
  zodBoolean,
} from '@roshi/shared';
import { endOfMonth, subDays, subMonths } from 'date-fns';
import { Request, Response } from 'express';
import _ from 'lodash';
import { z } from 'zod';
import { prismaClient } from '../../clients/prismaClient';
import { CONFIG } from '../../config';
import { generateMessage } from '../../data/messageTemplates/messageTemplates';
import { createJob } from '../../jobs/boss';
import { MLCBReportSchema } from '../../models/mlcbReport.model';
import { createActivityLog } from '../../services/activityLog.service';
import {
  convertToNormalLoanRequest,
  formatLoanRequestForAdmin,
  getLoanRequest,
} from '../../services/loanRequest.service';
import { addBorrowersToMailChimpList } from '../../services/mailChimp.service';
import { sendNotification } from '../../services/notification.service';
import { createShortUrl } from '../../services/shortUrl.service';
import { generateInvoices } from '../../services/zohoBooks.service';
import { errorResponse } from '../../utils/errorResponse';
import { generateShortUrl } from '../../utils/roshiUtils';
import { successResponse } from '../../utils/successResponse';
import { getCurrentTime } from '../../utils/utils';

export const getCompaniesSchema = z
  .object({
    filters: z.object({
      type: z.nativeEnum(CompanyTypeEnum).optional(),
      country: z.nativeEnum(CountriesEnum).optional(),
      status: z.nativeEnum(CompanyStatusEnum).optional(),
    }),
    search: z.string(),
  })
  .partial();

export const getCompanies = async (req: Request, res: Response) => {
  const body = getCompaniesSchema.parse(req.query);
  const companies = await prismaClient.company.findMany({
    where: {
      type: body.filters?.type,
      country: body.filters?.country,
      status: body.filters?.status,
      name: { contains: body.search },
    },
    include: {
      users: true,
    },
    orderBy: { name: 'asc' },
  });
  return successResponse(res, companies);
};

export const updateCompanySchema = z
  .object({
    status: z.nativeEnum(CompanyStatusEnum),
    country: z.nativeEnum(CountriesEnum),
    type: z.nativeEnum(CompanyTypeEnum),
    isFrozen: z.boolean().nullable(),
  })
  .partial();
export const updateCompany = async (req: Request, res: Response) => {
  const body = updateCompanySchema.parse(req.body);
  const company = await prismaClient.company.update({
    where: { id: req.params.id },
    data: {
      status: body.status,
      country: body.country,
      type: body.type,
      isFrozenAt: body.isFrozen === undefined ? undefined : body.isFrozen ? new Date() : null,
    },
  });

  return successResponse(res, company);
};

export const addCompanySchema = z.object({
  name: z.string(),
  logo: z.string(),
  type: z.nativeEnum(CompanyTypeEnum),
  country: z.nativeEnum(CountriesEnum),
});

export const addCompany = async (req: Request, res: Response) => {
  const company = await prismaClient.company.create({
    data: addCompanySchema.parse(req.body),
  });
  return successResponse(res, company);
};

export const getAllUsersSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  companyId: z.string().optional(),
  showBorrowers: zodBoolean.optional(),
  role: z.nativeEnum(UserRoleEnum).optional(),
  isAssignableToLoanRequest: zodBoolean.optional(),
});
export const getAllUsers = async (req: Request, res: Response) => {
  let filters = getAllUsersSchema.parse(req.query);
  if (filters.name || filters.email) {
    filters = { ...filters, showBorrowers: true };
  }

  const users = await prismaClient.user.findMany({
    where: {
      role: filters.showBorrowers ? undefined : (filters.role ?? { not: UserRoleEnum.BORROWER }),
      name: { contains: filters.name, mode: 'insensitive' },
      email: { contains: filters.email, mode: 'insensitive' },
      companyId: filters.companyId,
      isAssignableToLoanRequest: filters.isAssignableToLoanRequest,
    },
    include: {
      company: true,
    },
    orderBy: { createdAt: 'asc' },
  });
  return successResponse(res, users);
};

export const updateUserSchema = z
  .object({
    status: z.nativeEnum(UserStatusEnum),
    companyId: z.string().nullable(),
    role: z.nativeEnum(UserRoleEnum),
  })
  .partial();
export const updateUser = async (req: Request, res: Response) => {
  const user = await prismaClient.user.update({
    where: { id: req.params.id },
    data: updateUserSchema.parse(req.body),
  });

  return successResponse(res, user);
};

export const addUserSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(UserRoleEnum).optional().default(UserRoleEnum.BORROWER),
  companyId: z.string().optional(),
});

export const addUser = async (req: Request, res: Response) => {
  const user = await prismaClient.user.create({
    data: addUserSchema.parse(req.body),
  });
  return successResponse(res, user);
};

export const updateLoanRequestSchema = z.object({
  status: z.nativeEnum(LoanRequestStatusEnum).optional(),
  isSpam: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  isLowQuality: z.boolean().optional(),
  publicNote: z.string().optional(),
  privateNote: z.string().optional(),
  supportData: SupportDataSchema.partial().optional(),
});

export const updateLoanRequestAdmin = async (req: Request, res: Response) => {
  const loanRequestId = req.params.id;
  const existing = await prismaClient.loanRequest.findFirstOrThrow({
    where: { id: loanRequestId },
  });
  const body = updateLoanRequestSchema.parse(req.body);
  const existingSupportData = SupportDataSchema.parse(existing.supportData || {});

  const merged = _.merge(existingSupportData, body.supportData);

  const application = await prismaClient.loanRequest.update({
    where: { id: loanRequestId },
    data: {
      ...body,
      supportData: merged,
    },
  });

  if (body.status) {
    createActivityLog({
      userId: req.user?.sub!,
      loanRequestId: loanRequestId,
      activityType:
        body.status === LoanRequestStatusEnum.ACTIVE
          ? ActivityLogEnum.LOAN_REQUEST_RESTORED
          : ActivityLogEnum.LOAN_REQUEST_DELETED,
      targetType: TargetTypeEnum.LOAN_REQUEST,
      targetId: loanRequestId,
    });
  }

  return successResponse(res, application);
};

export const updateLoanResponseSchema = z.object({
  hasBorrowerContactedLender: z.boolean().optional(),
  isAccepted: z.boolean().optional(),
  supportData: LoanResponseSupportDataSchema.partial().optional(),
});

export const updateLoanResponseAdmin = async (req: Request, res: Response) => {
  const user = req.user;
  const loanResponseId = req.params.id;
  const body = updateLoanResponseSchema.parse(req.body);
  if (body.supportData?.checklist && user?.role !== UserRoleEnum.ADMIN) {
    return errorResponse(res, 403, ERROR_KEYS.FORBIDDEN);
  }
  const current = await prismaClient.loanResponse.findUniqueOrThrow({
    where: { id: loanResponseId },
    include: { lender: true, appointment: true },
  });

  const existingSupportData = SupportDataSchema.parse(current.supportData || {});

  const merged = _.merge(existingSupportData, body.supportData);

  const response = await prismaClient.$transaction(async (tx) => {
    //we need to remove appointment
    if (current.appointment && current.acceptedAt && body.isAccepted === false) {
      await tx.appointment.delete({ where: { id: current.appointment.id } });
    }

    return await tx.loanResponse.update({
      where: { id: req.params.id },
      data: {
        acceptedAt: body.isAccepted ? new Date() : undefined,
        contactedByBorrowerAt: req.body.hasBorrowerContactedLender ? new Date() : null,
        supportData: merged,
      },
    });
  });

  //If wasn't accepted before, but is accepted now. Send notification to lender and log the activity
  if (!current.acceptedAt && body.isAccepted) {
    sendNotification({
      notificationType: NotificationTypeEnum.OFFER_SELECTED,
      targetType: UserRoleEnum.LENDER,
      companyId: response.lenderId,
      payload: {
        loanResponseId: response.id,
        loanRequestId: response.loanRequestId,
      },
    });

    createActivityLog({
      userId: req.user?.sub || '',
      loanRequestId: response.loanRequestId || '',
      activityType: ActivityLogEnum.OFFER_SELECTED,
      targetType: TargetTypeEnum.LOAN_RESPONSE,
      targetId: response.id,
    });
  }

  return successResponse(res, response);
};

export const getUserByPhone = async (req: Request, res: Response) => {
  const user = await prismaClient.user.findUnique({
    where: { phone: req.params.phone },
    include: {
      loanRequests: {
        orderBy: { createdAt: 'desc' },
        include: {
          applicantInfo: { include: { documents: true } },
          loanResponses: { include: { loanOffer: true } },
        },
      },
    },
  });
  return successResponse(res, user);
};

export const getAllAppointments = async (_: Request, res: Response) => {
  const appointments = await prismaClient.appointment.findMany({
    include: {
      openingHours: { include: { store: true } },
      loanResponse: {
        include: {
          closedDealOffer: true,
          lender: true,
          loanOffer: true,
          loanRequest: {
            include: {
              applicantInfo: { include: { documents: { where: { isDeleted: false } } } },
              user: { include: { company: true } },
              customerSupport: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
    where: {
      loanResponse: {
        loanRequest: {
          status: { notIn: [LoanRequestStatusEnum.DELETED] },
        },
      },
      OR: [
        {
          loanResponse: {
            appointment: {
              scheduledTime: { not: null },
            },
            outcomeStatus: StatusEnum.PENDING,
          },
        },
        {
          scheduledTime: { gt: subDays(getCurrentTime(), 3) },
        },
      ],
    },
    orderBy: { scheduledTime: 'desc' },
  });

  return successResponse(res, appointments);
};

export const getAllLeadsSchema = z.object({
  search: z.string().optional(),
  filters: z
    .object({
      country: z.nativeEnum(CountriesEnum),
      showExpired: zodBoolean.optional(),
      id: z.string().optional(),
    })
    .partial()
    .optional(),
});
export const getAllLeads = async (req: Request, res: Response) => {
  const params = getAllLeadsSchema.parse(req.query);
  const user = req.user;
  let filters = params.filters || {};
  if (user?.role !== UserRoleEnum.ADMIN) {
    filters.showExpired = false;
  } else if (filters.id) filters.showExpired = true;

  const loanRequests = await prismaClient.loanRequest.findMany({
    include: {
      applicantInfo: { include: { documents: { where: { isDeleted: false } } } },
      grading: { select: { leadTier: true, mlcbGrade: true } },
      loanResponses: {
        select: {
          id: true,
          appointment: {
            //Don't include appointment if outcomeStatus is not PENDING
            where: { loanResponse: { outcomeStatus: StatusEnum.PENDING } },
            select: {
              id: true,
              status: true,
              scheduledTime: true,
              cancelledAt: true,
              openingHours: { select: { store: true } },
            },
          },
          lender: { select: { id: true, name: true, logo: true } },
          acceptedAt: true,
          outcomeStatus: true,
          status: true,
          closedDealOffer: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      activityLogs: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
        },
      },
      customerSupport: true,
    },
    where: {
      id: filters?.id,
      country: filters?.country,
      approvedAt: { not: null },
      OR: filters?.showExpired
        ? undefined
        : [
            {
              updatedAt: { gte: subDays(new Date(), 15) },
            },
            {
              activityLogs: { some: { createdAt: { gte: subDays(new Date(), 15) } } },
            },
          ],
    },
  });
  return successResponse(
    res,
    loanRequests.map((lr) => formatLoanRequestForAdmin(lr)),
    'OK',
  );
};

export const getLeadById = async (req: Request, res: Response) => {
  const loanRequest = await prismaClient.loanRequest.findUniqueOrThrow({
    where: { id: req.params.id },
    include: {
      applicantInfo: { include: { documents: { where: { isDeleted: false } } } },
      guarantorInfo: { include: { documents: { where: { isDeleted: false } } } },
      grading: { select: { mlcbGrade: true, leadTier: true } },
      loanResponses: {
        include: {
          appointment: {
            //Don't include appointment if outcomeStatus is not PENDING
            where: { loanResponse: { outcomeStatus: StatusEnum.PENDING } },
            include: { openingHours: { include: { store: true } } },
          },
          lender: true,
          loanOffer: true,
          closedDealOffer: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      activityLogs: {
        orderBy: { createdAt: 'desc' },
        include: { user: { include: { company: true } } },
      },
      user: true,
      customerSupport: { select: { id: true, name: true } },
    },
  });
  return successResponse(res, formatLoanRequestForAdmin(loanRequest));
};

export const testEmail = async (req: Request, res: Response) => {
  await createJob(JobsEnum.CHECK_LENDER_FILTERS, { loanRequestId: req.body.id });
  return successResponse(res, {});
};

export const getTemplateSchema = z.object({
  template: z.enum([MessageTemplatesEnum.CIMB_OFFER, MessageTemplatesEnum.FEEDBACK]),
  loanRequestId: z.string(),
});
export const getTemplate = async (req: Request, res: Response) => {
  const { template, loanRequestId } = getTemplateSchema.parse(req.body);
  const loanRequest = await getLoanRequest(loanRequestId);
  let text = '';
  if (template === MessageTemplatesEnum.CIMB_OFFER) {
    const shortLink = await createShortUrl({
      type: ShortUrlTypeEnum.REDIRECT,
      targetUrl: CONFIG.CIMB_OFFER_LINK,
      userId: loanRequest.user.id,
    });
    text = generateMessage(MessageTemplatesEnum.CIMB_OFFER, {
      name: loanRequest.user.name || 'there',
      link: generateShortUrl(shortLink.code),
    });
  } else if (template === MessageTemplatesEnum.FEEDBACK) {
    text = generateMessage(MessageTemplatesEnum.FEEDBACK);
  }

  return successResponse(res, text);
};

export const getAllClosedLeadsSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  month: z.string().datetime().optional(),
  country: z.nativeEnum(CountriesEnum),
  companyId: z.string().optional(),
});
export const getAllClosedLeads = async (req: Request, res: Response) => {
  const filters = getAllClosedLeadsSchema.parse(req.query);

  const whereClause: Prisma.LoanResponseWhereInput = {
    outcomeStatus: StatusEnum.APPROVED,
    lenderId: filters.companyId,
    loanRequest: {
      country: filters.country,
      id: filters.id,
    },
  };

  if (filters.name) {
    whereClause.loanRequest!.user = {
      name: {
        contains: filters.name,
        mode: 'insensitive',
      },
    };
  }

  if (filters.month && !filters.name && !filters.id) {
    const month = filters.month;
    const lastDayPrevMonth = endOfMonth(subMonths(new Date(month), 1));
    lastDayPrevMonth.setHours(23, 59, 0, 0);
    const lastDayCurrMonth = endOfMonth(new Date(month));
    lastDayCurrMonth.setHours(23, 59, 0, 0);

    whereClause.closedDealOffer = {
      createdAt: {
        gt: lastDayPrevMonth,
        lte: lastDayCurrMonth,
      },
    };
  }

  const loanResponses = await prismaClient.loanResponse.findMany({
    include: {
      loanRequest: {
        include: { user: true, applicantInfo: true, customerSupport: { select: { id: true, name: true } } },
      },
      closedDealOffer: true,
      lender: true,
    },
    where: whereClause,
    orderBy: { closedDealOffer: { createdAt: 'desc' } },
  });

  return successResponse(
    res,
    loanResponses.map((loanResponse) => {
      const supportData = LoanResponseSupportDataSchema.parse(loanResponse.supportData || {});

      return { ...loanResponse, supportData };
    }),
  );
};

export const createJobSchema = z.object({
  type: z.nativeEnum(JobsEnum),
  data: z.record(z.string(), z.string()),
});
export const createJobHandler = async (req: Request, res: Response) => {
  const { type, data } = createJobSchema.parse(req.body);
  const jobId = await createJob(type, data);
  return successResponse(res, { jobId });
};

export const getMlcbReport = async (req: Request, res: Response) => {
  const { loanRequestId } = req.params;
  const report = await prismaClient.loanRequestGrading.findUniqueOrThrow({
    where: { loanRequestId },
  });
  const parsed = MLCBReportSchema.parse(report.mlcbReport);
  return successResponse(res, parsed);
};

export const updateMailchimp = async (_: Request, res: Response) => {
  await addBorrowersToMailChimpList();
  return successResponse(res, {});
};

export const convertToNormalLoanRequestHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  await convertToNormalLoanRequest(id);
  return successResponse(res, {});
};

export const generateInvoicesForLastMonth = async (_: Request, res: Response) => {
  const lastDayPrevMonth = endOfMonth(subMonths(new Date(), 2));
  lastDayPrevMonth.setHours(23, 59, 0, 0);
  await generateInvoices(lastDayPrevMonth);
  return successResponse(res, {});
};
