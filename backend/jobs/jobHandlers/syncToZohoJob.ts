import { ApplicantInfo, JobsEnum, User } from '@roshi/shared';
import { format } from 'date-fns';
import { prismaClient } from '../../clients/prismaClient';
import { MODULE_API_NAME, ZOHO_MODULES, zohoCrmClient } from '../../clients/zohoCrmClient';
import { boss } from '../boss';
import { JobPayload } from '../jobsData';

type ZohoSyncConfig<T> = {
  module: ZOHO_MODULES;
  searchKey: string;
  getRecord: (id: string) => Promise<T | null>;
  formatFields: (record: T) => Record<string, any>;
};

const syncRecordToZoho = async <T>(id: string, config: ZohoSyncConfig<T>) => {
  const record = await config.getRecord(id);
  if (!record) return;

  const searchCriteria = `${config.searchKey}:equals:${id}`;
  const existingRecords = await zohoCrmClient.searchRecords(config.module, searchCriteria);
  const data = config.formatFields(record);

  if (existingRecords.length > 0) {
    await zohoCrmClient.updateRecord(config.module, existingRecords[0].id, {
      id: existingRecords[0].id,
      ...data,
    });
    console.log(`Updated ${config.module} ${id} in Zoho`);
  } else {
    await zohoCrmClient.createRecord(config.module, data);
    console.log(`Created new ${config.module} ${id} in Zoho`);
  }
};

const applicantInfoSyncConfig: ZohoSyncConfig<ApplicantInfo> = {
  module: ZOHO_MODULES.ApplicantInfo,
  searchKey: 'appApplicantInfoId',
  getRecord: (id) => prismaClient.applicantInfo.findUnique({ where: { id } }),
  formatFields: (record) => {
    const data: Record<string, any> = {};
    MODULE_API_NAME[ZOHO_MODULES.ApplicantInfo].forEach((el) => {
      if (el.api_name === 'dateOfBirth') {
        data.dateOfBirth = format(record.dateOfBirth!, 'yyyy-MM-dd');
      } else {
        data[el.api_name] = record[el.app_field as keyof ApplicantInfo];
      }
    });
    return data;
  },
};

const userSyncConfig: ZohoSyncConfig<User> = {
  module: ZOHO_MODULES.User,
  searchKey: 'appUserId',
  getRecord: (id) => prismaClient.user.findUnique({ where: { id } }),
  formatFields: (record) => {
    const data: Record<string, any> = {};
    MODULE_API_NAME[ZOHO_MODULES.User].forEach((el) => {
      if (el.api_name === 'lastLoginAt') {
        data.lastLoginAt = format(record.lastLoginAt!, "yyyy-MM-dd'T'HH:mm:ssxxx");
      } else {
        data[el.api_name] = record[el.app_field as keyof User];
      }
    });
    return data;
  },
};

export async function syncToZohoHandler(job: JobPayload<JobsEnum.SYNC_TO_ZOHO>) {
  const { loanRequestId, applicantInfoId, userId } = job;
  try {
    if (applicantInfoId) {
      console.log('Triggered sync to zoho for applicant info', applicantInfoId);
      await syncRecordToZoho(applicantInfoId, applicantInfoSyncConfig);
    }

    if (userId) {
      console.log('Triggered sync to zoho for user', userId);
      await syncRecordToZoho(userId, userSyncConfig);
    }
  } catch (error: any) {
    console.error('Error syncing to Zoho', error?.message);
  }
}

export async function initSyncToZohoJob() {
  await boss.work<JobPayload<JobsEnum.SYNC_TO_ZOHO>>(JobsEnum.SYNC_TO_ZOHO, ([job]) => syncToZohoHandler(job.data));
}
