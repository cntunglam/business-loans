import { CompanyLeadSettings, Prisma, residencyStatusesEnum, SgManualFormSchema } from '@roshi/shared';
import { z } from 'zod';
import { prismaClient } from '../clients/prismaClient';

export const mappLeadFilters = (
  whereClause: Prisma.LoanRequestWhereInput,
  companyLeadSettings: CompanyLeadSettings,
) => {
  const AND: Prisma.ApplicantInfoWhereInput[] = [];
  // residencyStatus
  if (companyLeadSettings.residencyStatus?.length > 0) {
    AND.push({
      OR: companyLeadSettings.residencyStatus.map((residencyStatus) => ({
        data: {
          path: ['residencyStatus'],
          equals: residencyStatus,
        },
      })),
    });
  }

  // employmentStatus
  if (companyLeadSettings.employmentStatus?.length > 0) {
    AND.push({
      OR: companyLeadSettings.employmentStatus.map((employmentStatus) => ({
        data: {
          path: ['employmentStatus'],
          equals: employmentStatus,
        },
      })),
    });
  }

  // employmentTime
  if (companyLeadSettings.employmentTime?.length > 0) {
    AND.push({
      OR: companyLeadSettings.employmentTime.map((employmentTime) => ({
        data: {
          path: ['currentEmploymentTime'],
          equals: employmentTime,
        },
      })),
    });
    AND.push({
      OR: companyLeadSettings.employmentTime.map((employmentTime) => ({
        data: {
          path: ['previousEmploymentTime'],
          equals: employmentTime,
        },
      })),
    });
  }

  // propertyOwnerships
  if (companyLeadSettings.propertyOwnerships?.length > 0) {
    AND.push({
      OR: companyLeadSettings.propertyOwnerships.map((propertyOwnership) => ({
        data: {
          path: ['propertyOwnership'],
          equals: propertyOwnership,
        },
      })),
    });
  }

  // minMonthlyIncomeLocal & minMonthlyIncomeForeigner
  AND.push({
    OR: [
      {
        data: {
          path: ['monthlyIncome'],
          gte: companyLeadSettings.minMonthlyIncomeLocal || 0,
        },
        OR: [
          {
            data: {
              path: ['residencyStatus'],
              equals: residencyStatusesEnum.SINGAPOREAN,
            },
          },
          {
            data: {
              path: ['residencyStatus'],
              equals: residencyStatusesEnum.PERMANANT_RESIDENT,
            },
          },
        ],
      },
      {
        data: {
          path: ['monthlyIncome'],
          gte: companyLeadSettings.minMonthlyIncomeForeigner || 0,
        },
        OR: [
          {
            data: {
              path: ['residencyStatus'],
              equals: residencyStatusesEnum.EMPLOYMENT_PASS,
            },
          },
          {
            data: {
              path: ['residencyStatus'],
              equals: residencyStatusesEnum.FOREIGNER,
            },
          },
          {
            data: {
              path: ['residencyStatus'],
              equals: residencyStatusesEnum.LONG_TERM_VISIT,
            },
          },
          {
            data: {
              path: ['residencyStatus'],
              equals: residencyStatusesEnum.S_PASS_WORK_PERMIT,
            },
          },
        ],
      },
    ],
  });

  whereClause.applicantInfo = {
    AND: [...AND],
  };
};

export const mappApplicantToLeadFilters = (
  whereClause: Prisma.CompanyWhereInput,
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
        applicantInfo: {
          include: { documents: { where: { isDeleted: false } } };
        };
        guarantorInfo: { include: { documents: true } };
      };
    }>
  >,
) => {
  const applicantInfo = SgManualFormSchema.parse(loanRequest.applicantInfo?.data);

  const AND: Prisma.CompanyLeadSettingsWhereInput[] = [];

  const addCondition = <T>(field: keyof Prisma.CompanyLeadSettingsWhereInput, condition: T) => {
    AND.push({
      OR: [
        {
          [field]: condition,
        },
        {
          [field]: null,
        },
      ],
    });
  };

  const addConditionArr = <T>(field: keyof Prisma.CompanyLeadSettingsWhereInput, condition: T) => {
    AND.push({
      OR: [
        {
          [field]: condition,
        },
        {
          [field]: { equals: [] },
        },
      ],
    });
  };

  AND.push({
    isApprovedByRoshi: false,
  });
  // monthlyIncome
  if (
    [residencyStatusesEnum.SINGAPOREAN, residencyStatusesEnum.PERMANANT_RESIDENT].includes(
      applicantInfo.residencyStatus,
    )
  ) {
    addCondition('minMonthlyIncomeLocal', { lte: applicantInfo.monthlyIncome });
  } else {
    addCondition('minMonthlyIncomeForeigner', { lte: applicantInfo.monthlyIncome });
  }
  addCondition('minLoanAmount', { lte: loanRequest.amount });
  // maxDebtIncomeRatio
  addCondition('maxDebtIncomeRatio', {
    gte: applicantInfo.monthlyIncome > 0 ? applicantInfo.lenderDebt / applicantInfo.monthlyIncome : 0,
  });
  // employeeTime
  addConditionArr('employmentTime', {
    has: applicantInfo.currentEmploymentTime,
  });
  addConditionArr('employmentTime', {
    has: applicantInfo.previousEmploymentTime,
  });
  // employmentStatus
  addConditionArr('employmentStatus', {
    has: applicantInfo.employmentStatus,
  });
  // residencyStatus
  addConditionArr('residencyStatus', {
    has: applicantInfo.residencyStatus,
  });
  // propertyOwnerships
  addConditionArr('propertyOwnerships', {
    has: applicantInfo.propertyOwnership,
  });

  whereClause.OR = [
    {
      companyLeadSettings: null,
    },
    {
      companyLeadSettings: {
        AND: [...AND],
      },
    },
  ];
};

/**
 * Utility function to get companies that match lead settings.
 */
export async function getCompanyIdsByLeadSettings(loanRequestId: string) {
  const loanRequest = await prismaClient.loanRequest.findFirstOrThrow({
    where: { id: loanRequestId },
    include: {
      applicantInfo: {
        include: { documents: { where: { isDeleted: false } } },
      },
      guarantorInfo: { include: { documents: true } },
    },
  });

  let whereClause = {};
  mappApplicantToLeadFilters(whereClause, loanRequest);

  const applicantDocuments = loanRequest?.applicantInfo?.documents ?? [];
  const documentTypes = applicantDocuments.map((item) => item.documentType);

  let companies = await prismaClient.company.findMany({
    include: {
      companyLeadSettings: true,
    },
    where: whereClause,
  });

  companies = companies
    // filter: Check document types match
    .filter((company) => {
      const companyDocuments = company.companyLeadSettings?.documents ?? [];
      if (!companyDocuments.length) return true;
      return companyDocuments.length > 0 && companyDocuments.every((doc) => documentTypes.includes(doc));
    })
    // filter: documentCount
    .filter((company) => {
      const documentCount = company.companyLeadSettings?.documentCount;
      if (!documentCount) return true;
      return applicantDocuments.length >= documentCount;
    });

  return companies.map((company) => company.id);
}

export async function applyCompanyLeadSettings(
  whereClause: Prisma.LoanRequestWhereInput,
  leadSettings: CompanyLeadSettings,
) {
  const updatedWhereClause = { ...whereClause };
  mappLeadFilters(updatedWhereClause, leadSettings);
  if (Number.isFinite(leadSettings.minLoanAmount)) {
    updatedWhereClause.amount = {
      gte: leadSettings.minLoanAmount || 0,
    };
  }

  if (leadSettings.documentCount || leadSettings.maxDebtIncomeRatio || leadSettings.documents?.length > 0) {
    const matchLoanRequests = await prismaClient.loanRequest.findMany({
      where: updatedWhereClause,
      include: {
        applicantInfo: {
          include: { documents: { where: { isDeleted: false } }, _count: { select: { documents: true } } },
        },
      },
    });

    const ids = matchLoanRequests
      // filter: documentCount
      .filter((item) => {
        const documentCount = leadSettings?.documentCount;
        if (!documentCount) return true;
        const hasRequiredDocuments = documentCount > 0 && (item.applicantInfo?._count?.documents || 0) >= documentCount;

        return hasRequiredDocuments;
      })
      // filter: maxDebtIncomeRatio
      .filter((item) => {
        const maxDebtIncomeRatio = leadSettings?.maxDebtIncomeRatio;
        if (!maxDebtIncomeRatio) return true;
        const applicantData = item.applicantInfo?.data as z.infer<typeof SgManualFormSchema> | undefined;
        let hasValidDebtIncomeRatio = false;
        if (
          applicantData &&
          Number.isFinite(applicantData?.lenderDebt) &&
          Number.isFinite(applicantData.monthlyIncome) &&
          maxDebtIncomeRatio
        ) {
          hasValidDebtIncomeRatio = applicantData?.lenderDebt / applicantData.monthlyIncome <= maxDebtIncomeRatio;
        }

        return hasValidDebtIncomeRatio;
      })
      // filter: Check document types match
      .filter((item) => {
        const requiredDocuments = leadSettings?.documents || [];
        if (!requiredDocuments.length) return true;
        const documentTypes = item.applicantInfo?.documents.map((doc) => doc.documentType) || [];
        return requiredDocuments.length > 0 && requiredDocuments.every((doc) => documentTypes.includes(doc));
      })
      // Map to get IDs
      .map((item) => item.id);

    updatedWhereClause.id = { in: ids };
  }

  return updatedWhereClause;
}
