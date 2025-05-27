import { residencyStatusesEnum } from '@roshi/shared';
import { CONFIG } from '../config';

export const generateShortUrl = (shortUrlCode: string) => {
  return `${CONFIG.SHORT_URL_BASE}/l/${shortUrlCode}`;
};

export const getMlcbRatio = (applicantInfo: { lenderDebt: number; monthlyIncome: number }) =>
  applicantInfo.lenderDebt / applicantInfo.monthlyIncome;

export const getCbsRatio = (applicantInfo: { bankDebt: number; monthlyIncome: number }) =>
  applicantInfo.bankDebt / applicantInfo.monthlyIncome;

export const isForeigner = (applicantInfo: { residencyStatus?: residencyStatusesEnum }) =>
  applicantInfo.residencyStatus !== residencyStatusesEnum.SINGAPOREAN &&
  applicantInfo.residencyStatus !== residencyStatusesEnum.PERMANANT_RESIDENT;
