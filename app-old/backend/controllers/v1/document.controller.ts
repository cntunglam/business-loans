import {
  ActivityLogEnum,
  DocumentTypeEnum,
  DocumentVerificationStatusEnum,
  ERROR_KEYS,
  hasCustomerSupportPermissions,
  JobsEnum,
  Prisma,
  TargetTypeEnum,
  UserRoleEnum,
} from '@roshi/shared';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import path from 'path';
import { z } from 'zod';
import { prismaClient } from '../../clients/prismaClient';
import { createJob } from '../../jobs/boss';
import { createActivityLog } from '../../services/activityLog.service';
import { getBlobLink, uploadToAzure } from '../../services/fileStorage.service';
import { errorResponse } from '../../utils/errorResponse';
import { successResponse } from '../../utils/successResponse';

export interface FileRequest extends Request {
  file: Express.Multer.File;
}

export const uploadDocumentSchema = z.object({
  applicantInfoId: z.string(),
  documentType: z.nativeEnum(DocumentTypeEnum),
});

export const uploadDocument = async (req: FileRequest, res: Response) => {
  if (!req.file) {
    return errorResponse(res, 400, ERROR_KEYS.INVALID_FILE, ['jpg', 'png', 'pdf', 'jpeg']);
  }

  const { applicantInfoId, documentType } = uploadDocumentSchema.parse(req.body);

  //Make sure document belongs to the right applicant/guarantor
  //or ADMIN
  let whereClause: Prisma.ApplicantInfoWhereUniqueInput = {
    id: applicantInfoId,
  };

  if (!hasCustomerSupportPermissions(req.user?.role)) {
    whereClause.OR = [{ applicantOf: { userId: req.user?.sub } }, { guarantorOf: { userId: req.user?.sub } }];
  }

  const applicantInfo = await prismaClient.applicantInfo.findUniqueOrThrow({
    where: whereClause,
    include: { documents: { where: { isDeleted: false } }, applicantOf: { select: { id: true } } },
  });

  if (applicantInfo?.documents.some((doc) => doc.documentType === documentType)) {
    return errorResponse(res, 400, ERROR_KEYS.DOCUMENT_ALREADY_UPLOADED);
  }

  const { originalname, buffer, mimetype } = req.file;

  const filename = randomUUID() + path.extname(originalname).toLowerCase();

  const uploadResult = await uploadToAzure(buffer, filename, mimetype);
  if (uploadResult?.errorCode) {
    console.error('Error while uploading to blob storage', uploadResult.errorCode);
    return errorResponse(res, 500, ERROR_KEYS.ERROR_UPLOADING_FILE);
  }

  //if ADMIN upload, then the document is valid
  let createDocumentBody: Prisma.DocumentCreateWithoutApplicantInfoInput = {
    documentType,
    filename,
  };

  if (hasCustomerSupportPermissions(req.user?.role)) {
    createDocumentBody.humanVerificationStatus = DocumentVerificationStatusEnum.VALID;
  }

  const updatedApplicantInfo = await prismaClient.applicantInfo.update({
    where: { id: applicantInfo.id },
    data: {
      documents: {
        create: createDocumentBody,
      },
    },
    include: { documents: { select: { documentType: true, id: true }, where: { isDeleted: false } } },
  });
  const doc = updatedApplicantInfo?.documents.find((doc) => doc.documentType === documentType);
  // TODO: create job to validate document
  // await createJob(JobsEnum.VALIDATE_DOCUMENT, {
  //   filename: filename,
  //   mimetype,
  //   documentType,
  //   applicantInfoId: applicantInfo?.id,
  // });

  // create activity log - DOCUMENT_ADDED
  createActivityLog({
    userId: req.user?.sub || '',
    loanRequestId: applicantInfo.applicantOf!.id,
    activityType: ActivityLogEnum.DOCUMENT_ADDED,
    targetType: TargetTypeEnum.DOCUMENT,
    targetId: doc?.id || '',
  });

  //TODO later move this to documents job after verifying if documents are legit and hiding sensitive information
  createJob(JobsEnum.CHECK_LENDER_FILTERS, { loanRequestId: applicantInfo.applicantOf!.id });

  return successResponse(res, uploadResult?.requestId);
};

const getDocumentSchema = z.object({
  filename: z.string(),
});

export const getDocument = async (req: Request, res: Response) => {
  //Check if user has access to the document. Borrowers can only access their own documents
  const doc = await prismaClient.document.findUnique({
    where: { filename: req.params.filename },
    include: { applicantInfo: { include: { applicantOf: true } } },
  });
  if (req.user?.role === UserRoleEnum.BORROWER && doc?.applicantInfo.applicantOf?.userId !== req.user.sub)
    return errorResponse(res, 403, ERROR_KEYS.FORBIDDEN);

  const { filename } = getDocumentSchema.parse(req.params);
  const link = await getBlobLink(filename);
  return successResponse(res, link);
};

const deleteDocumentSchema = z.object({
  filename: z.string(),
});

export const deleteDocument = async (req: Request, res: Response) => {
  const { filename } = deleteDocumentSchema.parse(req.params);
  const doc = await prismaClient.document.findUnique({
    where: { filename: filename },
    include: { applicantInfo: { include: { applicantOf: true, guarantorOf: true } } },
  });
  //Make sure document belongs to the right applicant/guarantor
  //or ADMIN
  if (
    doc?.applicantInfo.applicantOf?.userId !== req.user?.sub &&
    doc?.applicantInfo.guarantorOf?.userId !== req.user?.sub &&
    !hasCustomerSupportPermissions(req.user?.role)
  ) {
    return errorResponse(res, 403, ERROR_KEYS.FORBIDDEN);
  }

  await prismaClient.document.update({
    where: { filename: filename },
    data: { isDeleted: true },
  });

  // create activity log - DOCUMENT_DELETED
  createActivityLog({
    userId: req.user?.sub || '',
    loanRequestId: doc?.applicantInfo.applicantOf?.id || '',
    activityType: ActivityLogEnum.DOCUMENT_DELETED,
    targetType: TargetTypeEnum.DOCUMENT,
    targetId: doc?.id,
  });

  return successResponse(res, {});
};

export const updateDocumentSchema = z.object({
  humanVerificationStatus: z.nativeEnum(DocumentVerificationStatusEnum),
});
export const updateDocument = async (req: Request, res: Response) => {
  const { filename } = req.params;
  const body = updateDocumentSchema.parse(req.body);
  const response = await prismaClient.document.update({
    where: { filename: filename },
    include: { applicantInfo: { include: { applicantOf: { select: { id: true } } } } },
    data: body,
  });

  return successResponse(res, response);
};
