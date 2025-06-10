import axios, { AxiosInstance } from 'axios';
import { format } from 'date-fns';
import { get } from 'lodash';
import { CONFIG } from '../config';

export enum SYNCING_TABLE {
  ApplicantInfo = 'ApplicantInfo',
  User = 'User',
  LoanRequest = 'LoanRequest',
  LoanResponse = 'LoanResponse',
}

export enum SYNCING_MODULES {
  Leads = 'Leads',
  Deals = 'Deals',
}

export const TABLES_TO_SYNC = Object.keys(SYNCING_TABLE);

export type ZohoCrmFieldFormat = {
  api_name: string;
  app_field?: string;
  fallback_field?: string;
  format?: (val: any) => string | any;
};

const dateTime = (val: Date) => format(val, "yyyy-MM-dd'T'HH:mm:ssxxx");
const date = (val: Date) => format(val, 'yyyy-MM-dd');

export const MODULE_API_NAME_CONVERTOR: Partial<Record<SYNCING_TABLE, ZohoCrmFieldFormat[]>> = {
  [SYNCING_TABLE.ApplicantInfo]: [
    // CRM default fields
    {
      api_name: 'Last_Name',
      app_field: 'fullName',
      fallback_field: 'email',
      format: (val) => val.split(' ')[1] || val,
    },
    { api_name: 'First_Name', app_field: 'fullName', fallback_field: 'email', format: (val) => val.split(' ')[0] },
    { api_name: 'Email', app_field: 'email' },
    { api_name: 'Lead_Source', app_field: 'RoshiVN' },
    { api_name: 'Phone', app_field: 'phoneNumber' },
    { api_name: 'Street', app_field: 'currentAddress', format: (val) => get(JSON.parse(val), [0], '') },
    { api_name: 'State', app_field: 'currentAddress', format: (val) => get(JSON.parse(val), [1], '') },
    { api_name: 'City', app_field: 'currentAddress', format: (val) => get(JSON.parse(val), [2], '') },

    { api_name: 'applicationId', app_field: 'id' },
    { api_name: 'amount' },
    { api_name: 'term' },
    { api_name: 'purpose' },
    { api_name: 'cccd', app_field: 'cccdNumber' },

    { api_name: 'dob', app_field: 'dateOfBirth', format: date },
    { api_name: 'monthlyIncome' },
    { api_name: 'hasLaborContract' },
    { api_name: 'employmentType' },
    { api_name: 'residencyStatus' },
  ],
  [SYNCING_TABLE.LoanRequest]: [
    { api_name: 'loanRequestId', app_field: 'id' },
    { api_name: 'loanRequestStatus', app_field: 'status' },
    { api_name: 'isFavorite' },
    { api_name: 'isLowQuality' },
    { api_name: 'isSpam' },
    { api_name: 'approvedAt', format: dateTime },
    { api_name: 'createdAt', format: dateTime },
    { api_name: 'updatedAt', format: dateTime },
  ],
  [SYNCING_TABLE.User]: [
    { api_name: 'Last_Name', app_field: 'name', fallback_field: 'email', format: (val) => val.split(' ')[1] || val },
    { api_name: 'First_Name', app_field: 'name', fallback_field: 'email', format: (val) => val.split(' ')[0] },
    { api_name: 'Email', app_field: 'email' },
    { api_name: 'Phone', app_field: 'phone' },

    { api_name: 'userStatus', app_field: 'status' },
    { api_name: 'userId', app_field: 'id' },
    { api_name: 'role' },
    { api_name: 'lastLoginAt', format: dateTime },
  ],

  [SYNCING_TABLE.LoanResponse]: [
    { api_name: 'Deal_Name', app_field: 'lender.name' },
    { api_name: 'loanResponseId', app_field: 'id' },
    { api_name: 'loanRequestId', app_field: 'loanRequest.id' },
    { api_name: 'contactedByBorrowerAt', format: date },
    { api_name: 'contactedByLenderAt', format: date },
    { api_name: 'disbursementDate', format: date },
    { api_name: 'isAuto' },
    { api_name: 'outcomeStatus' },
    { api_name: 'status' },
    { api_name: 'rejectionReasons', format: (val) => (Array.isArray(val) ? val.join(', ') : JSON.stringify(val)) },
    { api_name: 'acceptedAt', format: dateTime },
    { api_name: 'createdAt', format: dateTime },
    { api_name: 'updatedAt', format: dateTime },
    {
      api_name: 'loanRequest',
      app_field: 'loanRequest',
      format: (val) => {
        const zohoId = get(val, 'applicantInfo.zohoCrm.zohoId');
        return zohoId ? { id: zohoId } : null;
      },
    },
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
  public async getZohoRecord(module: string, id?: string | null): Promise<any> {
    if (!id) return null;
    try {
      const response = await this.client.get(`/${module}/${id}`);
      return response.data.data ? response.data.data[0] : null;
    } catch (error: any) {
      console.error(
        `[ZohoCRM] Failed to get record with id ${id} in ${module}:`,
        error.response?.data || error.message,
      );
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
