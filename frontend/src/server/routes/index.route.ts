import express from 'express';
import emailRequestHandler from './email.route';

export default function bootstrapRoutes(app: express.Express) {
  // Define your routes here
  app.get('/', (_: express.Request, res: express.Response) => {
    res.send('Welcome to the API!');
  });

  // Add more routes as needed
  app.get('/health', (_: express.Request, res: express.Response) => {
    res.status(200).json({ status: 'OK' });
  });

  emailRequestHandler(app);
}
