import { Prisma, SingpassData, User } from '@roshi/shared';
import { Request, Response } from 'express';
import { prismaClient } from '../../clients/prismaClient';
import { createAccountFromSingpass } from '../../services/account.service';
import { generateApplyUrl, querySingpassMyInfo } from '../../services/singpass.service';
import { generateToken } from '../../services/token.service';
import { successResponse } from '../../utils/successResponse';

export const getSingpassApplyUrl = async (_: Request, res: Response) => {
  const { authorizeUrl, codeVerifier } = generateApplyUrl();
  return successResponse(res, { authorizeUrl, codeVerifier });
};

export const getSingpassMyInfo = async (req: Request, res: Response) => {
  const { visitorId, code, codeVerifier } = req.query;
  let personData = await querySingpassMyInfo(code as string, codeVerifier as string);
  const personsDataTyped = personData as SingpassData;

  // Search for existing user
  const whereClause: Prisma.UserWhereInput = { OR: [] };
  if (personsDataTyped.uinfin?.value) {
    whereClause.OR!.push({ nric: { equals: personData.uinfin.value, mode: 'insensitive' } });
  }
  if (personsDataTyped.mobileno?.areacode?.value && personsDataTyped.mobileno?.nbr?.value) {
    whereClause.OR!.push({ phone: personData.mobileno.areacode.value + personData.mobileno.nbr.value });
  }
  if (personsDataTyped.email?.value) {
    whereClause.OR!.push({ email: { equals: personData.email.value, mode: 'insensitive' } });
  }

  let token: string | null = null;
  let user: User | null = null;
  if (whereClause.OR && whereClause.OR.length > 0) {
    user = await prismaClient.user.findFirst({ where: whereClause });
    if (user) {
      token = generateToken(user);
    }
  }

  if (!user) {
    try {
      // Will fail if email or mobile number is missing. In this case, the account will be created at a later stage
      const created = await createAccountFromSingpass(personsDataTyped);
      if (created) {
        token = created.token;
        user = created.createdUser;
      }
    } catch (err) {
      console.log(err);
    }
  }

  //save latests singpass data
  if (user) {
    await prismaClient.userSingpassData.create({
      data: {
        userId: user.id,
        data: personData,
      },
    });
  }

  if (visitorId) {
    await prismaClient.visitorDataV2.update({
      where: { id: visitorId as string },
      data: {
        singpassData: personData,
        userId: user?.id,
      },
    });
  }

  return successResponse(res, { token, success: true });
};
