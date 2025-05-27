import { Prisma, SgManualFormSchema } from '@roshi/shared';
import { formatDocumentForLenderOrBorrower } from './document.service';

const modifiedSchema = SgManualFormSchema.extend({
  phoneNumber: SgManualFormSchema.shape.phoneNumber.nullable().optional(),
});

export const formatApplicantInfoForLender = (
  applicantInfo: Partial<
    Prisma.ApplicantInfoGetPayload<{ include: { documents: true; applicantOf: true; guarantorOf: true } }>
  >,
  options?: { allowPersonalInformation?: boolean; isReapply?: boolean },
) => {
  const { phoneNumber, fullname, postalCode, nric, ...rest } = modifiedSchema.parse(applicantInfo.data);

  return {
    ...rest,
    //For phone number, a special endpoint has to be called to check when lender contacts customer
    phoneNumber: null,
    nric: options?.allowPersonalInformation ? nric : null,
    fullname: options?.allowPersonalInformation ? fullname : null,
    postalCode: options?.allowPersonalInformation ? postalCode : null,
    id: applicantInfo.id!,
    documents: applicantInfo.documents?.map((doc) => formatDocumentForLenderOrBorrower(doc)),
    mlcbRatio: rest.lenderDebt / rest.monthlyIncome,
    loanRequest: applicantInfo.applicantOf || applicantInfo.guarantorOf,
    hasSingpass: applicantInfo.singpassData != null && (!options || options.isReapply === false),
    //Provide basic info. For approved offers to get full data, we will design endpoint to ensure we track lenders when they see the phone number.
  };
};

export const formatApplicantForBorrower = (
  applicantInfo: Partial<
    Prisma.ApplicantInfoGetPayload<{ include: { documents: true; applicantOf: true; guarantorOf: true } }>
  >,
) => {
  const data = modifiedSchema.parse(applicantInfo.data);
  return {
    ...data,
    id: applicantInfo.id!,
    documents: applicantInfo.documents?.map((doc) => formatDocumentForLenderOrBorrower(doc)),
    mlcbRatio: data.lenderDebt / data.monthlyIncome,
    loanRequest: applicantInfo.applicantOf || applicantInfo.guarantorOf,
    singpassData: applicantInfo.singpassData,
  };
};

export const formatApplicantForAdmin = (
  applicantInfo: Partial<
    Prisma.ApplicantInfoGetPayload<{ include: { documents: true; applicantOf: true; guarantorOf: true } }>
  >,
) => {
  const data = modifiedSchema.parse(applicantInfo.data);
  return {
    ...data,
    id: applicantInfo.id!,
    documents: applicantInfo.documents,
    mlcbRatio: data.lenderDebt / data.monthlyIncome,
    loanRequest: applicantInfo.applicantOf || applicantInfo.guarantorOf,
    hasSingpassData: !!applicantInfo.singpassData,
  };
};
