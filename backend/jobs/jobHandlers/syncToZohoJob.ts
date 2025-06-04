import { ApplicantInfo, JobsEnum } from '@roshi/shared';
import { format } from 'date-fns';
import { prismaClient } from '../../clients/prismaClient';
import { MODULE_API_NAME, ZOHO_MODULES, zohoCrmClient } from '../../clients/zohoCrmClient';
import { boss } from '../boss';
import { JobPayload } from '../jobsData';

export async function syncToZohoHandler(job: JobPayload<JobsEnum.SYNC_TO_ZOHO>) {
  const { loanRequestId, applicantInfoId } = job;
  if (applicantInfoId) {
    try {
      console.log('Triggered sync to zoho for applicant info', applicantInfoId);

      const applicantInfo = await prismaClient.applicantInfo.findUnique({
        where: { id: applicantInfoId },
      });
      if (!applicantInfo) {
        return;
      }
      const searchCriteria = `appApplicantInfoId:equals:${applicantInfoId}`;
      const existingRecords = await zohoCrmClient.searchRecords(ZOHO_MODULES.ApplicantInfo, searchCriteria);
      const data: Record<string, any> & Omit<Partial<ApplicantInfo>, 'dateOfBirth'> = {};
      MODULE_API_NAME[ZOHO_MODULES.ApplicantInfo].forEach((element) => {
        if (element.api_name === 'dateOfBirth') {
          data.dateOfBirth = format(applicantInfo.dateOfBirth!, 'yyyy-MM-dd');
        } else {
          data[element.api_name] = applicantInfo[element.app_field as keyof ApplicantInfo];
        }
      });
      if (existingRecords.length > 0) {
        await zohoCrmClient.updateRecord(ZOHO_MODULES.ApplicantInfo, existingRecords[0].id, {
          id: existingRecords[0].id,
          ...data,
        });
        console.log(`Updated applicant info ${applicantInfoId} in Zoho`);
      } else {
        await zohoCrmClient.createRecord(ZOHO_MODULES.ApplicantInfo, data);
        console.log(`Created new applicant info ${applicantInfoId} in Zoho`);
      }
    } catch (error) {
      console.error('Error syncing to Zoho');
    }
  }
}

export async function initSyncToZohoJob() {
  await boss.work<JobPayload<JobsEnum.SYNC_TO_ZOHO>>(JobsEnum.SYNC_TO_ZOHO, ([job]) => syncToZohoHandler(job.data));
}
