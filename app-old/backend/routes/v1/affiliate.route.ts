import { UserRoleEnum } from '@roshi/shared';
import { Router } from 'express';
import { z } from 'zod';
import {
  checkAffiliateVisitorUsageOrEmpty,
  createReferralLinkHandler,
  deleteReferralLinkHandler,
  getAffiliateVisitor,
  getReferralLinksHandler,
  initializeAffiliateVisitor,
  recordReferralLinkVisitHandler,
} from '../../controllers/v1/affiliate.controller';
import { validate } from '../../utils/validator';
import { anonymousRoute, verifyAuth } from '../../utils/verifyAuth';

export const affiliateRouter = Router();

const referralLinkSearchSchema = z.object({
  name: z.string().optional(),
});
affiliateRouter.get(
  '/referral-links',
  verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.AFFILIATE]),
  validate(referralLinkSearchSchema),
  getReferralLinksHandler,
);

const createReferralLinkSchema = z.object({
  name: z.string().min(1),
  targetUrl: z.string().min(1),
});

affiliateRouter.post(
  '/referral-links',
  verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.AFFILIATE]),
  validate(createReferralLinkSchema),
  createReferralLinkHandler,
);

affiliateRouter.delete(
  '/referral-links/:id',
  verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.AFFILIATE]),
  deleteReferralLinkHandler,
);

// public route to record referral link visit
affiliateRouter.post('/referral-links/:referralCode', recordReferralLinkVisitHandler);

affiliateRouter.post('/visitor/initialize', anonymousRoute, initializeAffiliateVisitor);
affiliateRouter.get('/visitor/:id/usage', anonymousRoute, checkAffiliateVisitorUsageOrEmpty);
affiliateRouter.get('/visitor/:id', anonymousRoute, getAffiliateVisitor);
