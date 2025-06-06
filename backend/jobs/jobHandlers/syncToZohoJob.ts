import { ApplicantInfo, JobsEnum, LoanRequest, LoanResponse, User } from '@roshi/shared';
import { get } from 'lodash';
import { prismaClient } from '../../clients/prismaClient';
import { MODULE_API_NAME, ZOHO_MODULES, zohoCrmClient } from '../../clients/zohoCrmClient';
import { boss } from '../boss';
import { JobPayload } from '../jobsData';

type ZohoSyncConfig<T> = {
  module: ZOHO_MODULES;
  getDbRecord: (id: string) => Promise<T | null>;
  formatFields: (record: T) => Promise<Record<string, any>>;
};

const formatFields = async <T>(record: T, module: ZOHO_MODULES) => {
  const data: Record<string, any> = {};
  MODULE_API_NAME[module].forEach((el) => {
    if (el.format) {
      const value = get(record, el.app_field || el.api_name);
      data[el.api_name] = value ? el.format(value) : null;
    } else {
      const expectedValue = get(record, el.app_field || el.api_name);
      const fallbackValue = get(record, el.fallback_field || el.api_name);
      const value = expectedValue || fallbackValue || null;
      if (value && (Array.isArray(value) || typeof value === 'object')) {
        data[el.api_name] = JSON.stringify(value);
      } else {
        data[el.api_name] = value;
      }
    }
  });
  return data;
};

const syncRecordToZoho = async <T>(id: string, config: ZohoSyncConfig<T>): Promise<string | null> => {
  const record = (await config.getDbRecord(id)) as T & { zohoCrmId?: string };
  if (!record) return null;
  const existingRecord = await zohoCrmClient.getZohoRecord(config.module, record.zohoCrmId);
  const data = await config.formatFields(record);
  if (existingRecord) {
    await zohoCrmClient.updateRecord(config.module, existingRecord.id, {
      id: existingRecord.id,
      ...data,
    });
    console.log(`♻️ Updated ${config.module} ${id} in Zoho`);
    return null;
  }
  const zohoCrmId = await zohoCrmClient.createRecord(config.module, data);
  console.log(`✍️ Created new ${config.module} ${id} in Zoho: ${zohoCrmId}`);
  return zohoCrmId;
};

const applicantInfoSyncConfig: ZohoSyncConfig<ApplicantInfo> = {
  module: ZOHO_MODULES.ApplicantInfo,
  getDbRecord: (id) => prismaClient.applicantInfo.findUnique({ where: { id } }),
  formatFields: async (record) => await formatFields(record, ZOHO_MODULES.ApplicantInfo),
};

const userSyncConfig: ZohoSyncConfig<User> = {
  module: ZOHO_MODULES.User,
  getDbRecord: (id) => prismaClient.user.findUnique({ where: { id } }),
  formatFields: async (record) => await formatFields(record, ZOHO_MODULES.User),
};

const loanRequestSyncConfig: ZohoSyncConfig<LoanRequest> = {
  module: ZOHO_MODULES.LoanRequest,
  getDbRecord: (id) => prismaClient.loanRequest.findUnique({ where: { id }, include: { user: true } }),
  formatFields: async (record) => await formatFields(record, ZOHO_MODULES.LoanRequest),
};

const loanResponseSyncConfig: ZohoSyncConfig<LoanResponse> = {
  module: ZOHO_MODULES.LoanResponse,
  getDbRecord: (id) => prismaClient.loanResponse.findUnique({ where: { id }, include: { lender: true } }),
  formatFields: async (record) => await formatFields(record, ZOHO_MODULES.LoanResponse),
};

export async function syncToZohoHandler(job: JobPayload<JobsEnum.SYNC_TO_ZOHO>) {
  const {
    LoanRequest: loanRequestId,
    ApplicantInfo: applicantInfoId,
    User: userId,
    Company: companyId,
    LoanResponse: loanResponseId,
  } = job;
  try {
    if (applicantInfoId) {
      console.log('Triggered sync to zoho for applicant info', applicantInfoId);
      const zohoCrmId = await syncRecordToZoho(applicantInfoId, applicantInfoSyncConfig);
      if (zohoCrmId) {
        await prismaClient.applicantInfo.update({
          where: { id: applicantInfoId },
          data: { zohoCrmId },
        });
      }
    }
    if (userId) {
      console.log('Triggered sync to zoho for user', userId);
      const zohoCrmId = await syncRecordToZoho(userId, userSyncConfig);
      if (zohoCrmId) {
        await prismaClient.user.update({
          where: { id: userId },
          data: { zohoCrmId },
        });
      }
    }
    if (loanRequestId) {
      console.log('Triggered sync to zoho for loan request', loanRequestId);
      const zohoCrmId = await syncRecordToZoho(loanRequestId, loanRequestSyncConfig);
      if (zohoCrmId) {
        await prismaClient.loanRequest.update({
          where: { id: loanRequestId },
          data: { zohoCrmId },
        });
      }
    }
    if (loanResponseId) {
      console.log('Triggered sync to zoho for loan response', loanResponseId);
      const zohoCrmId = await syncRecordToZoho(loanResponseId, loanResponseSyncConfig);
      if (zohoCrmId) {
        await prismaClient.loanResponse.update({
          where: { id: loanResponseId },
          data: { zohoCrmId },
        });
      }
    }
  } catch (error: any) {
    console.error('Error syncing to Zoho: ', error?.message);
  }
}

export async function initSyncToZohoJob() {
  await boss.work<JobPayload<JobsEnum.SYNC_TO_ZOHO>>(JobsEnum.SYNC_TO_ZOHO, ([job]) => syncToZohoHandler(job.data));
}
