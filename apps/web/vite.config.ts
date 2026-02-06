import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // Vite loads .env from this directory (apps/web). Put VITE_GOOGLE_CLIENT_ID etc. in apps/web/.env
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@lunaz/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@lunaz/types': path.resolve(__dirname, '../../packages/types/src'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
