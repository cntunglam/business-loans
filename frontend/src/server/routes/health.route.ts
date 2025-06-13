import { Router } from 'express';

const healthRouter = Router();

// Basic health check endpoint
healthRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default healthRouter;
