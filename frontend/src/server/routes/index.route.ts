import { Express, Request, Response } from 'express';

export default function bootstrapRoutes(app: Express) {
  // Define your routes here
  app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to the API!');
  });

  // Example of a route that returns JSON data
  app.get('/data', (req: Request, res: Response) => {
    res.json({ message: 'This is some sample data.' });
  });

  // Add more routes as needed
}
