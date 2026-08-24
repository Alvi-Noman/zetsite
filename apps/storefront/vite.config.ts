import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const DEV_PORT = Number(process.env.PORT || 5174);
const HOST = '0.0.0.0';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: HOST,
    port: DEV_PORT,
    strictPort: true,
    cors: true,
    // Allow *.localhost tenant subdomains during local dev (e.g. acme.localhost:5174).
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.API_SERVICE_URL || 'http://127.0.0.1:4001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
