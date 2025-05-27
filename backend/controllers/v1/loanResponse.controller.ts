import { ActivityLogEnum, SgManualFormSchema, TargetTypeEnum } from '@roshi/shared';
import { Request, Response } from 'express';
import { z } from 'zod';
import { prismaClient } from '../../clients/prismaClient';
import { createActivityLog } from '../../services/activityLog.service';
import { successResponse } from '../../utils/successResponse';

export const contactBorrower = async (req: Request, res: Response) => {
  const { id } = req.params;

  const loanResponse = await prismaClient.loanResponse.findUniqueOrThrow({
    where: { id: id, lender: { users: { some: { id: req.user?.sub } } }, acceptedAt: { not: null } },
    include: { loanRequest: { include: { applicantInfo: { select: { data: true } } } } },
  });

  if (!loanResponse.contactedByLenderAt) {
    const response = await prismaClient.loanResponse.update({
      where: { id: loanResponse.id },
      data: { contactedByLenderAt: new Date() },
    });
    await createActivityLog({
      userId: req.user!.sub,
      loanRequestId: response.loanRequestId,
      activityType: ActivityLogEnum.CONTACTED,
      targetType: TargetTypeEnum.LOAN_RESPONSE,
      targetId: response.id,
    });
  }

  const applicantInfo = SgManualFormSchema.parse(loanResponse.loanRequest.applicantInfo?.data);

  return successResponse(res, {
    fullname: applicantInfo.fullname,
    phoneNumber: applicantInfo.phoneNumber,
  });
};

export const getLoanResponseByIds = async (req: Request, res: Response) => {
  const { loanResponseIds } = req.query;
  if (!loanResponseIds) return successResponse(res, []);

  const loanResponseIdsArray = z.array(z.string()).parse(loanResponseIds);

  const loanResponses = await prismaClient.loanResponse.findMany({
    where: {
      id: {
        in: loanResponseIdsArray,
      },
    },
    include: {
      lender: true,
    },
  });

  return successResponse(res, loanResponses);
};
