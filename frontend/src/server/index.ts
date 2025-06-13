import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bootstrapRoutes from './routes/index.route';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isDevelopment = process.env.NODE_ENV === 'development';
// Force port 3001 in development for Vite proxy
const port = process.env.PORT || 3001;

// Serve static files in production (NOT in development)
if (!isDevelopment) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const distPath = path.resolve(__dirname, '../../dist');

  app.use(
    express.static(distPath, {
      setHeaders: (res, path) => {
        // Only set no-cache for index.html to ensure authentication
        if (path.endsWith('index.html')) {
          res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        }
      }
    })
  );

  // Serve index.html for client-side routing in production
  app.get('*', (req, res, next) => {
    // Skip non-HTML routes and ensure req.path is a valid route path
    if (req.path.startsWith('/api/') || req.path.includes('://')) {
      console.log('Skipping invalid path:', req.path);
      next();
      return;
    }

    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Determine environment
const env = process.env.NODE_ENV || 'development';
const envFile = `.env.${env}`;
const envPath = path.resolve(process.cwd(), envFile);

// Check if the environment-specific file exists
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envFile}`);
  dotenv.config({ path: envPath });
} else {
  console.log(`Environment file ${envFile} not found. Falling back to .env`);
  dotenv.config();
}

try {
  bootstrapRoutes(app);
} catch (error) {
  console.error('Error while setting up routes:', error);
  process.exit(1);
}

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Server error');
  next();
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
