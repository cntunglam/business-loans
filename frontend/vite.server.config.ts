import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/server/index.ts'),
      formats: ['es'],
      fileName: 'index'
    },
    outDir: 'dist/server',
    emptyOutDir: true,
    rollupOptions: {
      external: ['express', 'cors', 'nodemailer', 'fs', 'path', 'url']
    },
    ssr: true,
    minify: false
  }
});
