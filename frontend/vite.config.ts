import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [react()],
  server: {
    port: 3000,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  },
  resolve: {
    alias: {
      '@mui/material': '@mui/joy'
    }
  },
  build: {
    outDir: 'dist',
    // Copy server files to dist directory
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
}));
