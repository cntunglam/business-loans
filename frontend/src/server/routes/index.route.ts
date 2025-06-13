import express from 'express';
import emailRequestHandler from './email.route';
import healthRouter from './health.route';

export default function bootstrapRoutes(app: express.Express) {
  // Define your routes here
  app.get('/', (_: express.Request, res: express.Response) => {
    res.send('Welcome to the API!');
  });

  // Use the health router
  app.use('/api', healthRouter);

  emailRequestHandler(app);
}
