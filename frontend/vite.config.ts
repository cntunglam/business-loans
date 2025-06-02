import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    allowedHosts: true
  },
  resolve: {
    alias: {
      '@mui/material': '@mui/joy'
    }
  }
});
