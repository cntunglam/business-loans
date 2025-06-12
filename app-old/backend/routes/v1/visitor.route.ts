import express from 'express';
import {
  finalizeLoanRequestHandler,
  handleSubmitPhone,
  initializeVisitor,
  saveStepProgressHandler,
} from '../../controllers/v1/visitor.controller';
import { anonymousRoute, verifyAuth } from '../../utils/verifyAuth';

export const visitorRouter = express.Router();

// Initialize or retrieve visitor session
visitorRouter.post('/initialize', anonymousRoute, initializeVisitor);

// Save step progress
visitorRouter.post('/step', saveStepProgressHandler);

// Finalize loan request (requires authentication)
visitorRouter.post('/finalize', verifyAuth(), finalizeLoanRequestHandler);

// check phone existence
visitorRouter.post('/check-phone', handleSubmitPhone);
