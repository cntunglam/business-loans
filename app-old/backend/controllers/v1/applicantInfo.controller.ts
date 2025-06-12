import { Request, Response } from 'express';
import { prismaClient } from '../../clients/prismaClient';
import { formatApplicantForBorrower, formatApplicantInfoForLender } from '../../services/applicantInfo.service';
import { successResponse } from '../../utils/successResponse';

export const getApplicantInfo = async (req: Request, res: Response) => {
  const { id } = req.params;

  const applicantInfo = await prismaClient.applicantInfo.findFirstOrThrow({
    where: {
      id,
    },
    include: {
      documents: { where: { isDeleted: false } },
      applicantOf: true,
      guarantorOf: true,
    },
  });

  if (req.hasCustomerSupportPermissions) return successResponse(res, formatApplicantForBorrower(applicantInfo));
  else {
    return successResponse(res, formatApplicantInfoForLender(applicantInfo, { allowPersonalInformation: false }));
  }
};
