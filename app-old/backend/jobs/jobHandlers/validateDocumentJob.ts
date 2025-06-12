// const queueName = JobsEnum.VALIDATE_DOCUMENT;
// export const initValidateDocumentJob = () => {
//   boss.work<JobPayload<typeof queueName>>(queueName, { pollingIntervalSeconds: 2 * 60 }, async ([job]) => {
//const { filename, mimetype, documentType, applicantInfoId } = job.data;
//const result = await validateDocument(filename, mimetype, documentType, applicantInfoId);
// TODO: handle save result
//console.log('validate document result', result);
//   });
// };
