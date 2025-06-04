import axios, { AxiosInstance } from 'axios';
import { CONFIG } from '../config';

export enum ZOHO_MODULES {
  LoanRequest = 'RoshiVN_LoanRequests',
  ApplicantInfo = 'RoshiVN_ApplicantInfo',
}

export const MODULE_API_NAME = {
  [ZOHO_MODULES.ApplicantInfo]: [
    { api_name: 'appApplicantInfoId', app_field: 'id' },
    { api_name: 'Name', app_field: 'id' },
    { api_name: 'Email', app_field: 'email' },
    { api_name: 'borrowAmount', app_field: 'amount' },
    { api_name: 'borrowPeriod', app_field: 'term' },
    { api_name: 'borrowPurpose', app_field: 'purpose' },
    { api_name: 'phoneNumber', app_field: 'phoneNumber' },
    { api_name: 'cccdNumber', app_field: 'cccdNumber' },
    { api_name: 'dateOfBirth', app_field: 'dateOfBirth' },
    { api_name: 'monthlyIncome', app_field: 'monthlyIncome' },
    { api_name: 'hasLaborContract', app_field: 'hasLaborContract' },
    { api_name: 'employmentType', app_field: 'employmentType' },
    { api_name: 'currentAddress', app_field: 'currentAddress' },
    { api_name: 'residencyStatus', app_field: 'residencyStatus' },
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

  public async createRecord(module: string, data: any): Promise<any> {
    try {
      const response = await this.client.post(`/${module}`, {
        data: [data],
      });
      return response.data.data[0];
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
