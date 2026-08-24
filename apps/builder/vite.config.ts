import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const DEV_PORT = Number(process.env.PORT || 3100);
const HOST = '127.0.0.1';

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
    proxy: {
      '/api/v1/auth': {
        target: process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:4002',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: process.env.API_SERVICE_URL || 'http://127.0.0.1:4001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
