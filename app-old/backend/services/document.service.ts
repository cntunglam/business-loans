import { Document } from '@roshi/shared';
export const formatDocumentForLenderOrBorrower = (document: Document) => {
  return {
    filename: document.filename,
    documentType: document.documentType,
    humanVerificationStatus: document.humanVerificationStatus,
  };
};
