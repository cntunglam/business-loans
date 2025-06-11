import { ApplicationStepsEnum, ApplicationStepsImagesEnum, loanPurposesEnum, StepDetails } from '@roshi/shared';

export const ApplicationStepsLabels: Record<ApplicationStepsEnum, string> = {
  [ApplicationStepsEnum.borrowAmount]: 'Bạn muốn vay bao nhiêu?',
  [ApplicationStepsEnum.borrowPeriod]: 'Bạn muốn trả trong bao lâu?',
  [ApplicationStepsEnum.borrowPurpose]: 'Mục đích vay là gì?',
  [ApplicationStepsEnum.companyName]: 'Tên công ty của bạn là gì?',
  [ApplicationStepsEnum.companyUENumber]: 'Số UEN của công ty bạn là gì?',
  [ApplicationStepsEnum.companyEmployeeInfo]: 'Thông tin nhân viên công ty bạn',
  [ApplicationStepsEnum.phoneNumber]: 'Số điện thoại của bạn là gì?',
  [ApplicationStepsEnum.currentAddress]: 'Địa chỉ hiện tại của bạn là gì?',
  [ApplicationStepsEnum.dateOfBirth]: 'Ngày sinh của bạn là khi nào?',
  [ApplicationStepsEnum.hasLaborContract]: 'Bạn có hợp đồng lao động không?',
  [ApplicationStepsEnum.monthlyIncome]: 'Thu nhập hàng tháng của bạn là bao nhiêu?',
  [ApplicationStepsEnum.cccdNumber]: 'Số CCCD/CMND của bạn là gì?',
  [ApplicationStepsEnum.employmentType]: 'Loại hình công việc của bạn là gì?',
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
    key: ApplicationStepsEnum.companyName,
    title: ApplicationStepsLabels[ApplicationStepsEnum.companyName],
  },
  {
    key: ApplicationStepsEnum.companyUENumber,
    title: ApplicationStepsLabels[ApplicationStepsEnum.companyUENumber],
  },
  {
    key: ApplicationStepsEnum.companyEmployeeInfo,
    title: ApplicationStepsLabels[ApplicationStepsEnum.companyEmployeeInfo],
  },
];
