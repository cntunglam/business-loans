import {
  ApplicationStepsEnum,
  ApplicationStepsImagesEnum,
  employmentTypeEnum,
  loanPurposesEnum,
  StepDetails,
} from '@roshi/shared';

export const ApplicationStepsLabels: Record<ApplicationStepsEnum, string> = {
  [ApplicationStepsEnum.borrowAmount]: 'Bạn muốn vay bao nhiêu?',
  [ApplicationStepsEnum.borrowPeriod]: 'Bạn muốn trả trong bao lâu?',
  [ApplicationStepsEnum.borrowPurpose]: 'Mục đích vay là gì?',
  [ApplicationStepsEnum.fullName]: 'Tên đầy đủ của bạn là gì?',
  [ApplicationStepsEnum.cccdNumber]: 'Số CCCD/CMND của bạn là gì?',
  [ApplicationStepsEnum.phoneNumber]: 'Số điện thoại của bạn là gì?',
  [ApplicationStepsEnum.email]: 'Địa chỉ email của bạn là gì?',
  [ApplicationStepsEnum.dateOfBirth]: 'Ngày sinh của bạn là gì?',
  [ApplicationStepsEnum.monthlyIncome]: 'Thu nhập hàng tháng của bạn là bao nhiêu?',
  [ApplicationStepsEnum.hasLaborContract]: 'Bạn có hợp đồng lao động không?',
  [ApplicationStepsEnum.streetAddress]: 'Địa chỉ hiện tại của bạn?',
  [ApplicationStepsEnum.city]: 'Thành phố bạn đang sinh sống?',
  [ApplicationStepsEnum.province]: 'Tỉnh/thành phố nơi bạn cư trú?',
  [ApplicationStepsEnum.residencyStatus]: 'Giá trị công dân?',
  [ApplicationStepsEnum.jobTitle]: 'Công việc của bạn là gì?',
};
export const regularPersonalLoanSteps: StepDetails[] = [
  {
    key: ApplicationStepsEnum.borrowAmount,
    title: ApplicationStepsLabels[ApplicationStepsEnum.borrowAmount],
    settings: { min: 1_000_000, max: 1_000_000_000 },
  },
  {
    key: ApplicationStepsEnum.borrowPeriod,
    title: ApplicationStepsLabels[ApplicationStepsEnum.borrowPeriod],
    settings: { min: 3, max: 72 },
  },
  {
    key: ApplicationStepsEnum.borrowPurpose,
    image: ApplicationStepsImagesEnum.loanOffers,
    title: ApplicationStepsLabels[ApplicationStepsEnum.borrowPurpose],
    settings: { options: Object.values(loanPurposesEnum) },
  },
  {
    key: ApplicationStepsEnum.cccdNumber,
    title: ApplicationStepsLabels[ApplicationStepsEnum.cccdNumber],
  },
  {
    key: ApplicationStepsEnum.jobTitle,
    title: ApplicationStepsLabels[ApplicationStepsEnum.jobTitle],
    settings: { options: Object.values(employmentTypeEnum) },
  },
  {
    key: ApplicationStepsEnum.dateOfBirth,
    title: ApplicationStepsLabels[ApplicationStepsEnum.dateOfBirth],
    settings: { min: 21, max: 65 },
  },
  {
    key: ApplicationStepsEnum.monthlyIncome,
    title: ApplicationStepsLabels[ApplicationStepsEnum.monthlyIncome],
    image: ApplicationStepsImagesEnum.cashback,
  },
  {
    key: ApplicationStepsEnum.hasLaborContract,
    title: ApplicationStepsLabels[ApplicationStepsEnum.hasLaborContract],
    settings: { options: ['YES', 'NO'] },
  },

  {
    key: ApplicationStepsEnum.province,
    title: ApplicationStepsLabels[ApplicationStepsEnum.province],
  },
  {
    key: ApplicationStepsEnum.city,
    title: ApplicationStepsLabels[ApplicationStepsEnum.city],
  },
  {
    key: ApplicationStepsEnum.streetAddress,
    title: ApplicationStepsLabels[ApplicationStepsEnum.streetAddress],
  },
  {
    key: ApplicationStepsEnum.fullName,
    title: ApplicationStepsLabels[ApplicationStepsEnum.fullName],
    image: ApplicationStepsImagesEnum.bestOffers,
  },
];
