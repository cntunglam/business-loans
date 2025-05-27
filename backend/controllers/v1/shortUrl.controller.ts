import { ERROR_KEYS, ShortUrlTypeEnum } from '@roshi/shared';
import { Request, Response } from 'express';
import { getShortUrlByCode } from '../../services/shortUrl.service';
import { errorResponse } from '../../utils/errorResponse';
import { successResponse } from '../../utils/successResponse';

export const getShortUrlHandler = async (req: Request, res: Response) => {
  const { code } = req.params;
  const shortUrl = await getShortUrlByCode(code);

  if (!shortUrl || shortUrl.type !== ShortUrlTypeEnum.REDIRECT || !shortUrl.targetUrl) {
    return errorResponse(res, 404, ERROR_KEYS.NOT_FOUND);
  }

  return successResponse(res, shortUrl.targetUrl);
};