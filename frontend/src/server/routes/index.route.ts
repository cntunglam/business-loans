import express from 'express';
import emailRequestHandler from './email.route';
import healthRouter from './health.route';

export default function bootstrapRoutes(app: express.Express) {
  // Define your routes here
  app.get('/api', (_: express.Request, res: express.Response) => {
    res.send('Welcome to the API!');
  });

  // Use the health router - mount it directly without a path prefix
  // Express 5 is stricter with route paths
  app.use(healthRouter);

  // Initialize email routes carefully
  emailRequestHandler(app);
}
