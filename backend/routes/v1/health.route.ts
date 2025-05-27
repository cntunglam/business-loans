import { Router } from 'express';

export const healthRouter = Router();

// Health check
healthRouter.get('/', (req, res) => {
  res.send('OK');
});
