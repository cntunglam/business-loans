import axios, { AxiosInstance } from 'axios';
import { format } from 'date-fns';
import { CONFIG } from '../config';

export enum ZOHO_MODULES {
  LoanRequest = 'RoshiVN_LoanRequests',
  ApplicantInfo = 'RoshiVN_ApplicantInfo',
  User = 'RoshiVN_Users',
  LoanResponse = 'RoshiVN_LoanResponses',
}

export const TABLES_TO_SYNC = Object.keys(ZOHO_MODULES);

export type ZohoCrmFieldFormat = {
  api_name: string;
  app_field?: string;
  fallback_field?: string;
  format?: (val: any) => string;
};

const dateTime = (val: Date) => format(val, "yyyy-MM-dd'T'HH:mm:ssxxx");
const date = (val: Date) => format(val, 'yyyy-MM-dd');

export const MODULE_API_NAME: Record<ZOHO_MODULES, ZohoCrmFieldFormat[]> = {
  [ZOHO_MODULES.ApplicantInfo]: [
    { api_name: 'appApplicantInfoId', app_field: 'id' },
    { api_name: 'Name', app_field: 'fullName', fallback_field: 'email' },
    { api_name: 'Email', app_field: 'email' },
    { api_name: 'amount' },
    { api_name: 'term' },
    { api_name: 'purpose' },
    { api_name: 'phoneNumber' },
    { api_name: 'cccdNumber' },
    { api_name: 'dateOfBirth', format: date },
    { api_name: 'monthlyIncome' },
    { api_name: 'hasLaborContract' },
    { api_name: 'employmentType' },
    { api_name: 'currentAddress' },
    { api_name: 'residencyStatus' },
  ],
  [ZOHO_MODULES.User]: [
    { api_name: 'appUserId', app_field: 'id' },
    { api_name: 'Name', app_field: 'name', fallback_field: 'email' },
    { api_name: 'Email', app_field: 'email' },
    { api_name: 'cccd' },
    { api_name: 'phone' },
    { api_name: 'role' },
    { api_name: 'status' },
    { api_name: 'lastLoginAt', format: dateTime },
  ],
  [ZOHO_MODULES.LoanRequest]: [
    { api_name: 'appLoanRequestId', app_field: 'id' },
    { api_name: 'Name', app_field: 'user.name', fallback_field: 'user.email' },
    { api_name: 'amount' },
    { api_name: 'term' },
    { api_name: 'purpose' },
    { api_name: 'approvedAt', format: dateTime },
    { api_name: 'isFavorite' },
    { api_name: 'isLowQuality' },
    { api_name: 'isSpam' },
    { api_name: 'status' },
    { api_name: 'applicantInfoId' },
    { api_name: 'guarantorInfoId' },
    { api_name: 'userId' },
  ],
  [ZOHO_MODULES.LoanResponse]: [
    { api_name: 'appLoanResponseId', app_field: 'id' },
    { api_name: 'Name', app_field: 'lender.name', fallback_field: 'lender.email' },
    { api_name: 'acceptedAt', format: dateTime },
    { api_name: 'comment' },
    { api_name: 'contactedByBorrowerAt', format: dateTime },
    { api_name: 'contactedByLenderAt', format: dateTime },
    { api_name: 'disbursementDate', format: date },
    { api_name: 'invoiceId' },
    { api_name: 'isAuto' },
    { api_name: 'lenderId' },
    { api_name: 'loanRequestId' },
    { api_name: 'outcomeStatus' },
    { api_name: 'rejectionReasons' },
    { api_name: 'status' },
  ],
};

export enum ZOHO_KEYS {
  ZOHO_REFRESH_TOKEN = 'ZOHO_REFRESH_TOKEN',
}

export class ZohoCrmClient {
  private static instance: ZohoCrmClient;
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private constructor() {
    this.client = axios.create({
      baseURL: 'https://www.zohoapis.com/crm/v8',
    });
    this.client.interceptors.request.use(async (config) => {
      await this.ensureAccessToken();
      config.headers['Authorization'] = `Zoho-oauthtoken ${this.accessToken}`;
      config.headers['Content-Type'] = 'application/json';
      return config;
    });
  }

  public static getInstance(): ZohoCrmClient {
    if (!ZohoCrmClient.instance) {
      ZohoCrmClient.instance = new ZohoCrmClient();
    }
    return ZohoCrmClient.instance;
  }

  private async ensureAccessToken(): Promise<void> {
    const now = Date.now();
    if (!this.accessToken || now >= this.tokenExpiry) {
      await this.authenticate();
    }
  }

  private async authenticate(): Promise<void> {
    console.log('[ZohoCRM] Refreshing access token...');
    try {
      const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
        params: {
          refresh_token: CONFIG.ZOHO_REFRESH_TOKEN,
          client_id: CONFIG.ZOHO_CLIENT_ID,
          client_secret: CONFIG.ZOHO_CLIENT_SECRET,
          grant_type: 'refresh_token',
        },
      });

      this.accessToken = response.data.access_token;
      const expiresInSeconds = parseInt(response.data.expires_in);
      this.tokenExpiry = Date.now() + expiresInSeconds * 1000 * 0.9;
      console.log('[ZohoCRM] Access token refreshed. Expiry in ~' + Math.floor(expiresInSeconds / 60) + ' min');
    } catch (error: any) {
      console.error('[ZohoCRM] Failed to refresh token:', error.response?.data || error.message);
      throw new Error('Zoho CRM authentication failed');
    }
  }

  public async createRecord(module: string, data: any): Promise<string | null> {
    try {
      const response = await this.client.post(`/${module}`, {
        data: [data],
      });

      const createdRecord = response.data.data?.[0];
      if (createdRecord && createdRecord.details && createdRecord.details.id) {
        return createdRecord.details.id;
      }
      throw new Error(`[ZohoCRM] No ID returned after creating record in module ${module}`);
    } catch (error: any) {
      console.error(
        `[ZohoCRM] Failed to create record in ${module}:`,
        JSON.stringify(error.response?.data || error.message),
      );
      throw error;
    }
  }

  public async updateRecord(module: string, id: string, data: any): Promise<any> {
    try {
      const response = await this.client.put(`/${module}`, {
        data: [data],
      });
      return response.data.data[0];
    } catch (error: any) {
      console.error(
        `[ZohoCRM] Failed to update record in ${module}/${id}:`,
        JSON.stringify(error.response?.data || error.message),
      );
      throw error;
    }
  }

  public async searchRecords(module: string, criteria: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/${module}/search`, {
        params: { criteria },
      });
      return response.data.data || [];
    } catch (error: any) {
      console.error(`[ZohoCRM] Failed to search ${module} with criteria: ${criteria}`);
      return [];
    }
  }

  public async getZohoRecord(module: string, recordId?: string): Promise<any> {
    if (!recordId) return null;
    try {
      const response = await this.client.get(`/${module}/${recordId}`);
      return response.data.data ? response.data.data[0] : null;
    } catch (error: any) {
      console.error(`[ZohoCRM] Failed to get record ${recordId} in ${module}:`, error.response?.data || error.message);
      return null;
    }
  }

  public async createKeys(module: string, id: string, data: any): Promise<any> {
    try {
      const response = await this.client.put(`/${module}`, {
        data: [data],
      });
      return response.data.data[0];
    } catch (error: any) {
      console.error(
        `[ZohoCRM] Failed to update record in ${module}/${id}:`,
        JSON.stringify(error.response?.data || error.message),
      );
      throw error;
    }
  }
}

export const zohoCrmClient = ZohoCrmClient.getInstance();
