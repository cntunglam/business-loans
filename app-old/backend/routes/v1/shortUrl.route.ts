import { Router } from 'express';
import { getShortUrlHandler } from '../../controllers/v1/shortUrl.controller';

export const shortUrlRouter = Router();

shortUrlRouter.get('/:code', getShortUrlHandler);
