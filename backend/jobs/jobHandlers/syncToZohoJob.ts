import { ApplicantInfo, JobsEnum, LoanRequest, User } from '@roshi/shared';
import { get } from 'lodash';
import { prismaClient } from '../../clients/prismaClient';
import { MODULE_API_NAME_CONVERTOR, SYNCING_MODULES, SYNCING_TABLE, zohoCrmClient } from '../../clients/zohoCrmClient';
import { boss } from '../boss';
import { JobPayload } from '../jobsData';

type ZohoSyncConfig<T> = {
  module: SYNCING_MODULES;
  table: SYNCING_TABLE;
  formatFields: (record: T) => Promise<Record<string, any>>;
};

const formatFields = async <T>(record: T, table: SYNCING_TABLE) => {
  const data: Record<string, any> = {};
  MODULE_API_NAME_CONVERTOR[table]?.forEach((el) => {
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

const syncRecordToZoho = async <T>(
  record: (T & { id: string }) | null,
  config: ZohoSyncConfig<T>,
  zohoId?: string,
): Promise<string | null> => {
  if (!record) return null;
  const existingRecord = await zohoCrmClient.getZohoRecord(config.module, zohoId);
  const data = await config.formatFields(record);
  if (existingRecord) {
    await zohoCrmClient.updateRecord(config.module, existingRecord.id, {
      id: existingRecord.id,
      ...data,
    });
    console.log(`♻️ Updated ${config.module} ${config.table} ${record.id} in Zoho`);
    return null;
  }
  const zohoCrmId = await zohoCrmClient.createRecord(config.module, data);
  console.log(`✍️ Created new ${config.module} ${config.table} ${record.id} in Zoho: ${zohoCrmId}`);
  return zohoCrmId;
};

const applicantInfoSyncConfig: ZohoSyncConfig<ApplicantInfo> = {
  module: SYNCING_MODULES.Leads,
  table: SYNCING_TABLE.ApplicantInfo,
  formatFields: async (record) => await formatFields(record, SYNCING_TABLE.ApplicantInfo),
};

const userSyncConfig: ZohoSyncConfig<User> = {
  module: SYNCING_MODULES.Leads,
  table: SYNCING_TABLE.User,
  formatFields: async (record) => await formatFields(record, SYNCING_TABLE.User),
};

const loanRequestSyncConfig: ZohoSyncConfig<LoanRequest> = {
  module: SYNCING_MODULES.Leads,
  table: SYNCING_TABLE.LoanRequest,
  formatFields: async (record) => await formatFields(record, SYNCING_TABLE.LoanRequest),
};

export async function syncToZohoHandler(job: JobPayload<JobsEnum.SYNC_TO_ZOHO>) {
  const { LoanRequest: loanRequestId, ApplicantInfo: applicantInfoId, User: userId } = job;
  try {
    if (applicantInfoId) {
      console.log('Triggered sync to zoho for applicant info', applicantInfoId);
      const applicantInfo = await prismaClient.applicantInfo.findUnique({
        where: { id: applicantInfoId },
        include: { zohoCrm: true },
      });
      if (!applicantInfo?.phoneNumber) {
        console.log('Applicant info phone is null');
        return;
      }
      const zohoId = await syncRecordToZoho(applicantInfo, applicantInfoSyncConfig, applicantInfo.zohoCrm?.zohoId);
      if (zohoId) {
        await prismaClient.zohoCrm.create({
          data: {
            zohoId,
            applicantInfo: { connect: { id: applicantInfoId } },
          },
        });
      }
      return true;
    }
    if (userId) {
      const user = await prismaClient.user.findUnique({
        where: { id: userId },
        include: {
          applicantInfo: {
            include: {
              zohoCrm: true,
            },
          },
        },
      });
      if (!user?.applicantInfo?.zohoCrm?.zohoId) {
        console.log('User zoho id is null');
        return;
      }
      await syncRecordToZoho(user, userSyncConfig, user.applicantInfo.zohoCrm.zohoId);
      return true;
    }
    if (loanRequestId) {
      const loanRequest = await prismaClient.loanRequest.findUnique({
        where: { id: loanRequestId },
        include: {
          applicantInfo: {
            include: {
              zohoCrm: true,
            },
          },
        },
      });
      if (!loanRequest?.applicantInfo?.zohoCrm?.zohoId) {
        console.log('Loan request applicant info zoho id is null');
        return;
      }
      await syncRecordToZoho(loanRequest, loanRequestSyncConfig, loanRequest.applicantInfo.zohoCrm.zohoId);
      return;
    }
  } catch (error: any) {
    console.error('Error syncing to Zoho: ', error?.message);
  }
}

export async function initSyncToZohoJob() {
  await boss.work<JobPayload<JobsEnum.SYNC_TO_ZOHO>>(
    JobsEnum.SYNC_TO_ZOHO,
    {
      batchSize: 1,
    },
    ([job]) => syncToZohoHandler(job.data),
  );
}
