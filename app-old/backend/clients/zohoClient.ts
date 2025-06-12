import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { CONFIG } from '../config';
import { ZohoInvoice, ZohoInvoiceApiResponse, ZohoInvoiceGetManyApiResponse } from '../models/zohoBooks.model';

interface RetryConfig extends InternalAxiosRequestConfig {
  __isRetryRequest?: boolean;
}

let authToken = 'test';
let tokenExpiry = Date.now() / 1000;

const axiosZohoAccounts = axios.create({
  baseURL: CONFIG.ZOHO_ACCOUNTS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const axiosZohoBooks = axios.create({
  baseURL: CONFIG.ZOHO_BOOKS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  params: { ['organization_id']: CONFIG.ZOHO_ORG_ID },
});

axiosZohoBooks.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (config.headers) {
    config.headers.Authorization = `Zoho-oauthtoken ${token}`;
  }
  return config;
});

axiosZohoBooks.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error instanceof AxiosError && error.response && error.response.status === 401 && error.config) {
      console.error('error with token... retrying', error.config);
      const config = error.config as RetryConfig;
      if (!config.__isRetryRequest) {
        config.__isRetryRequest = true;
        await zohoClient.refreshToken();
        return axiosZohoBooks.request(config);
      }
    }
    return Promise.reject(error);
  },
);

const getAuthToken = async () => {
  const currentTime = Math.floor(Date.now() / 1000);
  if (!authToken || currentTime >= tokenExpiry) {
    await zohoClient.refreshToken();
  }
  return authToken;
};

export const zohoClient = {
  refreshToken: async () => {
    try {
      const response = await axiosZohoAccounts.post(
        '/oauth/v2/token',
        {},
        {
          params: {
            ['refresh_token']: CONFIG.ZOHO_REFRESH_TOKEN,
            ['grant_type']: 'refresh_token',
            ['client_id']: CONFIG.ZOHO_CLIENT_ID,
            ['client_secret']: CONFIG.ZOHO_CLIENT_SECRET,
          },
        },
      );
      authToken = response.data.access_token;
      tokenExpiry = Math.floor(Date.now() / 1000) + response.data.expires_in;
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  },
  createInvoice: async (invoiceData: ZohoInvoice): Promise<ZohoInvoiceApiResponse | null> => {
    try {
      const response = await axiosZohoBooks.post<ZohoInvoiceApiResponse>('/invoices', invoiceData);
      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      return null;
    }
  },
  getInvoices: async (): Promise<ZohoInvoiceGetManyApiResponse | null> => {
    try {
      const response = await axiosZohoBooks.get<ZohoInvoiceGetManyApiResponse>('/invoices');
      return response.data;
    } catch (error) {
      console.error('Error getting invoices:', error);
      return null;
    }
  },
  submitForApproval: async (invoiceId: string) => {
    try {
      const response = await axiosZohoBooks.post<ZohoInvoiceGetManyApiResponse>(`/invoices/${invoiceId}/submit`);
      return response.data;
    } catch (error) {
      console.error('Error submitting invoice for approval:', error);
      return null;
    }
  },
};
