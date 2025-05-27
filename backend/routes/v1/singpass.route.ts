import { Router } from 'express';
import { getSingpassApplyUrl, getSingpassMyInfo } from '../../controllers/v1/singpass.controller';

export const singpassRouter = Router();

singpassRouter.get('/apply', getSingpassApplyUrl);
singpassRouter.get('/fetch-persons', getSingpassMyInfo);
