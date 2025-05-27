import { AffiliateLink, ERROR_KEYS, ShortUrlTypeEnum, StatusEnum } from '@roshi/shared';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { prismaClient } from '../../clients/prismaClient';
import { createShortUrl } from '../../services/shortUrl.service';
import { errorResponse } from '../../utils/errorResponse';
import { generateShortUrl } from '../../utils/roshiUtils';
import { successResponse } from '../../utils/successResponse';

export const createReferralLinkHandler = async (req: Request, res: Response) => {
  const { name, targetUrl } = req.body;

  const userId = req.user!.sub;

  const referralLinkPayload = {
    utmCampaign: name,
    utmSource: 'referral',
    targetUrl,
    referralCode: _generateReferralCode(),
    userId,
  } as AffiliateLink;

  const fullUrl = _generateLink(referralLinkPayload);

  const shortLink = await createShortUrl({
    type: ShortUrlTypeEnum.REDIRECT,
    userId,
    targetUrl: fullUrl,
  });

  referralLinkPayload.shortUrlId = shortLink.id;

  const referralLink = await prismaClient.affiliateLink.create({
    data: referralLinkPayload,
  });

  return successResponse(res, referralLink);
};

export const getReferralLinksHandler = async (req: Request, res: Response) => {
  const { name } = req.query;

  const userId = req.user!.sub;

  const referralLinks = await prismaClient.affiliateLink.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(name && {
        utmCampaign: {
          contains: name as string,
          mode: 'insensitive',
        },
      }),
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      visitors: {
        select: {
          loanRequest: {
            select: {
              createdAt: true,
              loanResponses: {
                select: {
                  outcomeStatus: true,
                  createdAt: true,
                },
                where: {
                  outcomeStatus: StatusEnum.APPROVED,
                },
                take: 1,
              },
            },
          },
          createdAt: true,
        },
      },
      shortUrl: true,
    },
  });

  const referralLinksWithLink = referralLinks.map((referralLink) => {
    const visits = referralLink.visitors.length;
    const applications = referralLink.visitors.filter((visitor) => visitor.loanRequest).length;
    const closedLoanRequests = referralLink.visitors.filter(
      (visitor) => visitor.loanRequest?.loanResponses?.length,
    ).length;

    return {
      ...referralLink,
      link: _generateLink(referralLink),
      visits,
      applications,
      closedLoanRequests,
      shortUrl: {
        id: referralLink.shortUrl?.id,
        code: referralLink.shortUrl?.code,
        url: referralLink.shortUrl?.code ? generateShortUrl(referralLink.shortUrl?.code) : null,
      },
    };
  });

  return successResponse(res, referralLinksWithLink);
};

export const deleteReferralLinkHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.sub;

  await prismaClient.affiliateLink.update({
    where: {
      id,
      userId,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  return successResponse(res, {});
};

export const recordReferralLinkVisitHandler = async (req: Request, res: Response) => {
  const { referralCode } = req.params;
  const referralLink = await prismaClient.affiliateLink.findFirst({
    where: {
      referralCode,
      deletedAt: null,
    },
  });

  if (!referralLink) {
    return errorResponse(res, 404, ERROR_KEYS.NOT_FOUND);
  }

  const affiliateVisitor = await prismaClient.affiliateVisitor.create({
    data: {
      affiliateLinkId: referralLink.id,
    },
  });

  return successResponse(res, { affiliateVisitorId: affiliateVisitor.id });
};

export const checkAffiliateVisitorUsageOrEmpty = async (req: Request, res: Response) => {
  const { id } = req.params;
  const affiliateVisitor = await prismaClient.affiliateVisitor.findFirst({
    where: {
      id,
    },
    select: {
      user: {
        select: { id: true },
      },
    },
  });
  return successResponse(res, { usedOrEmpty: !affiliateVisitor || !!affiliateVisitor.user });
};

export const initializeAffiliateVisitor = async (req: Request, res: Response) => {
  const { referralCode, utmCampaign, utmSource } = req.params;
  const referralLink = await prismaClient.affiliateLink.findFirst({
    where: {
      referralCode,
      utmCampaign,
      utmSource,
      deletedAt: null,
    },
  });
  if (!referralLink) {
    return errorResponse(res, 404, ERROR_KEYS.NOT_FOUND);
  }
  const newAffiliateVisitor = await prismaClient.affiliateVisitor.create({
    data: {
      affiliateLinkId: referralLink.id,
    },
  });
  return successResponse(res, { affiliateVisitor: newAffiliateVisitor });
};

export const getAffiliateVisitor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const affiliateVisitor = await prismaClient.affiliateVisitor.findFirst({
    where: {
      id,
    },
  });
  return successResponse(res, { affiliateVisitor: affiliateVisitor });
};

const _generateReferralCode = () => {
  return randomUUID();
};

const _generateLink = (reffalLinkData: AffiliateLink) => {
  return `${reffalLinkData.targetUrl}?utmCampaign=${reffalLinkData.utmCampaign.trim().split(' ').join('-')}&referralCode=${reffalLinkData.referralCode}&utmSource=${reffalLinkData.utmSource}`;
};
