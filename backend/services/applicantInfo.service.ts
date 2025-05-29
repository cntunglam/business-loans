import { Prisma } from '@roshi/shared';
import { formatDocumentForLenderOrBorrower } from './document.service';

export const formatApplicantInfoForLender = (
  applicantInfo: Partial<
    Prisma.ApplicantInfoGetPayload<{ include: { documents: true; applicantOf: true; guarantorOf: true } }>
  >,
  options?: { allowPersonalInformation?: boolean; isReapply?: boolean },
) => {
  const { phoneNumber, fullName, postalCode, cccdNumber, ...rest } = applicantInfo;

  return {
    ...rest,
    phoneNumber: null,
    cccdNumber: options?.allowPersonalInformation ? cccdNumber : null,
    fullName: options?.allowPersonalInformation ? fullName : null,
    postalCode: options?.allowPersonalInformation ? postalCode : null,
    id: applicantInfo.id!,
    documents: applicantInfo.documents?.map((doc) => formatDocumentForLenderOrBorrower(doc)),
    loanRequest: applicantInfo.applicantOf || applicantInfo.guarantorOf,
  };
};

export const formatApplicantForBorrower = (
  applicantInfo: Partial<
    Prisma.ApplicantInfoGetPayload<{ include: { documents: true; applicantOf: true; guarantorOf: true } }>
  >,
) => {
  return {
    ...applicantInfo,
    id: applicantInfo.id!,
    documents: applicantInfo.documents?.map((doc) => formatDocumentForLenderOrBorrower(doc)),
    loanRequest: applicantInfo.applicantOf || applicantInfo.guarantorOf,
  };
};

export const formatApplicantForAdmin = (
  applicantInfo: Partial<
    Prisma.ApplicantInfoGetPayload<{ include: { documents: true; applicantOf: true; guarantorOf: true } }>
  >,
) => {
  return {
    ...applicantInfo,
    id: applicantInfo.id!,
    documents: applicantInfo.documents?.map((doc) => formatDocumentForLenderOrBorrower(doc)),
    loanRequest: applicantInfo.applicantOf || applicantInfo.guarantorOf,
  };
};
