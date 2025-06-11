import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    allowedHosts: true
  },
  build: {
    rollupOptions: {
      external: ['date-fns-tz'],
      onwarn(warning, warn) {
        // Suppress warnings about missing dependencies that might not be available in production
        if (warning.code === 'UNRESOLVED_IMPORT') {
          return;
        }
        warn(warning);
      }
    }
  },
  resolve: {
    alias: {
      '@mui/material': '@mui/joy'
    }
  }
});
