import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bootstrapRoutes from './routes/index.route';

const app = express();

// Setup standard middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isDevelopment = process.env.NODE_ENV === 'development';
const port = process.env.PORT || 3001;

// Log basic server info
console.log(`Server starting in ${isDevelopment ? 'development' : 'production'} mode on port ${port}`);

// Load environment variables
const env = process.env.NODE_ENV || 'development';
const envFile = `.env.${env}`;
const envPath = path.resolve(process.cwd(), envFile);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// Handle production static files - must be set up before API routes
if (!isDevelopment) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Find the dist directory
  const distPath = path.resolve(__dirname, '../../dist');

  if (!fs.existsSync(distPath) || !fs.existsSync(path.join(distPath, 'index.html'))) {
    console.error('ERROR: Cannot find build files at', distPath);
    process.exit(1);
  }

  const indexPath = path.join(distPath, 'index.html');

  // Serve static files
  app.use(
    express.static(distPath, {
      setHeaders: (res, path) => {
        if (path.endsWith('index.html')) {
          res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        }
      }
    })
  );

  // Root path handler
  app.get('/', (_req, res) => {
    res.sendFile(indexPath);
  });
}

// Initialize API routes
bootstrapRoutes(app);

// For client-side routing in production - must come after API routes
if (!isDevelopment) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const indexPath = path.join(__dirname, '../../dist', 'index.html');

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.includes('://')) {
      next();
      return;
    }
    res.sendFile(indexPath);
  });
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
