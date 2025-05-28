import { ApplicantInfo, CompanyLeadSettings, Prisma, residencyStatusesEnum } from '@roshi/shared';
import { prismaClient } from '../clients/prismaClient';

// Define local types for better type safety
type ResidencyStatus = keyof typeof residencyStatusesEnum;

// Helper function to create a filter condition for a single field
const createFilterCondition = <T>(
  field: string,
  values: T[] | undefined,
  path: string[] = [field],
): Prisma.ApplicantInfoWhereInput | null => {
  return null;
  //   if (!values || values.length === 0) return null;
  //   return {
  //     OR: values.map((value) => ({
  //       data: {
  //         path,
  //         equals: value,
  //       },
  //     })),
  //   };
};

export const mappLeadFilters = (
  whereClause: Prisma.LoanRequestWhereInput,
  companyLeadSettings: Partial<CompanyLeadSettings> | null | undefined,
): void => {
  // Initialize AND array
  const AND: Prisma.ApplicantInfoWhereInput[] = [];

  // Return early if no settings provided
  if (!companyLeadSettings) {
    whereClause.applicantInfo = { AND };
    return;
  }

  // Process residency status filter
  const residencyStatusFilter = createFilterCondition<ResidencyStatus>(
    'residencyStatus',
    companyLeadSettings.residencyStatus as ResidencyStatus[],
  );
  if (residencyStatusFilter) AND.push(residencyStatusFilter);

  // Process employment status filter
  const employmentStatusFilter = createFilterCondition('employmentStatus', companyLeadSettings.employmentStatus);
  if (employmentStatusFilter) AND.push(employmentStatusFilter);

  // Process employment time filter (both current and previous)
  if (companyLeadSettings.employmentTime?.length) {
    const employmentTimeFields = ['currentEmploymentTime', 'previousEmploymentTime'];

    employmentTimeFields.forEach((field) => {
      const filter = createFilterCondition(field, companyLeadSettings.employmentTime, [field]);
      if (filter) AND.push(filter);
    });
  }

  // Process property ownership filter
  const propertyOwnershipFilter = createFilterCondition('propertyOwnership', companyLeadSettings.propertyOwnerships);
  if (propertyOwnershipFilter) AND.push(propertyOwnershipFilter);

  // Process income filters based on residency status
  const localResidencyStatuses: ResidencyStatus[] = [
    residencyStatusesEnum.SINGAPOREAN,
    residencyStatusesEnum.PERMANANT_RESIDENT,
  ];

  const foreignerResidencyStatuses: ResidencyStatus[] = [
    residencyStatusesEnum.EMPLOYMENT_PASS,
    residencyStatusesEnum.FOREIGNER,
    residencyStatusesEnum.LONG_TERM_VISIT,
    residencyStatusesEnum.S_PASS_WORK_PERMIT,
  ];

  const incomeFilters: Prisma.ApplicantInfoWhereInput[] = [];

  // Add local income filter if applicable
  if (companyLeadSettings.minMonthlyIncomeLocal !== undefined && companyLeadSettings.minMonthlyIncomeLocal !== null) {
    // incomeFilters.push({
    //   data: {
    //     path: ['monthlyIncome'],
    //     gte: companyLeadSettings.minMonthlyIncomeLocal,
    //   },
    //   OR: localResidencyStatuses.map((status) => ({
    //     data: {
    //       path: ['residencyStatus'],
    //       equals: status,
    //     },
    //   })),
    // });
  }

  // Add foreigner income filter if applicable
  if (
    companyLeadSettings.minMonthlyIncomeForeigner !== undefined &&
    companyLeadSettings.minMonthlyIncomeForeigner !== null
  ) {
    // incomeFilters.push({
    //   data: {
    //     path: ['monthlyIncome'],
    //     gte: companyLeadSettings.minMonthlyIncomeForeigner,
    //   },
    //   OR: foreignerResidencyStatuses.map((status) => ({
    //     data: {
    //       path: ['residencyStatus'],
    //       equals: status,
    //     },
    //   })),
    // });
  }

  // Add income filters to AND array if any exist
  if (incomeFilters.length > 0) {
    AND.push({
      OR: incomeFilters,
    });
  }

  // Apply all filters to the where clause
  whereClause.applicantInfo = {
    AND: AND.length > 0 ? AND : undefined,
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
  const applicantInfo: ApplicantInfo = loanRequest.applicantInfo!;

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
    applicantInfo.residencyStatus &&
    [residencyStatusesEnum.SINGAPOREAN, residencyStatusesEnum.PERMANANT_RESIDENT].includes(
      applicantInfo.residencyStatus as residencyStatusesEnum,
    )
  ) {
    addCondition('minMonthlyIncomeLocal', { lte: applicantInfo.monthlyIncome });
  } else {
    addCondition('minMonthlyIncomeForeigner', { lte: applicantInfo.monthlyIncome });
  }
  addCondition('minLoanAmount', { lte: loanRequest.amount });
  addCondition('maxDebtIncomeRatio', {
    gte: applicantInfo.monthlyIncome > 0 ? applicantInfo.lenderDebt / applicantInfo.monthlyIncome : 0,
  });
  //   addConditionArr('employmentTime', {
  //     has: applicantInfo.currentEmploymentTime,
  //   });
  //   addConditionArr('employmentTime', {
  //     has: applicantInfo.previousEmploymentTime,
  //   });
  //   addConditionArr('employmentStatus', {
  //     has: applicantInfo.employmentStatus,
  //   });
  addConditionArr('residencyStatus', {
    has: applicantInfo.residencyStatus,
  });
  //   addConditionArr('propertyOwnerships', {
  //     has: applicantInfo.propertyOwnership,
  //   });

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
        const applicantData = item.applicantInfo;
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
