import { residencyStatusesEnum } from '@roshi/shared';
import { CONFIG } from '../config';

export const generateShortUrl = (shortUrlCode: string) => {
  return `${CONFIG.SHORT_URL_BASE}/l/${shortUrlCode}`;
};

export const isForeigner = (applicantInfo: { residencyStatus?: string | null | residencyStatusesEnum }) =>
  applicantInfo.residencyStatus !== residencyStatusesEnum.SINGAPOREAN &&
  applicantInfo.residencyStatus !== residencyStatusesEnum.PERMANANT_RESIDENT;
