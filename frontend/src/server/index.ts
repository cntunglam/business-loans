import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bootstrapRoutes from './routes/index.route';
const app = express();
const isDevelopment = process.env.NODE_ENV !== 'production';
// Force port 3001 in development for Vite proxy
const port = isDevelopment ? 3001 : process.env.PORT || 3001;

// Only serve static files in production
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
    // Skip non-HTML routes
    if (req.path.startsWith('/api/')) {
      next();
      return;
    }

    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
bootstrapRoutes(app);

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
