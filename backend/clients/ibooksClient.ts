import { CONFIG } from '../config';
import { MLCBReportApiResponse } from '../models/mlcbReport.model';

interface GetMlcbReportParams {
  nric: string;
  nationality: string;
  gender: string;
  name: string;
  dob: string;
  marital?: string;
  email: string;
  postalcode: string;
  unit?: string;
  contact_code: string;
  contact: string;
  loan_amount: string;
  employer_name?: string;
  job_title?: string;
  annual_income: string;
  buildingnumber?: string;
  streetname?: string;
}

export const iBooksClient = {
  getMlcbReport: async (params: GetMlcbReportParams): Promise<MLCBReportApiResponse> => {
    const body = {
      api_key: CONFIG.IBOOKS_API_KEY,
      api_sec: CONFIG.IBOOKS_API_SEC,
      country: 'SINGAPORE',
      ictype: 'NRIC',
      ...params,
    };
    const result = await fetch(`${CONFIG.IBOOKS_API_URL}/report/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then((res) => (res.ok ? res.json() : Promise.reject(res.json())));
    return result as MLCBReportApiResponse;
  },
};
