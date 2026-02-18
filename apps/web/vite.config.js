import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
  // Vite loads .env from this directory (apps/web). Put VITE_GOOGLE_CLIENT_ID etc. in apps/web/.env
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      types: path.resolve(__dirname, '../../types'),
      constants: path.resolve(__dirname, '../../constants'),
      interfaces: path.resolve(__dirname, '../../interfaces'),
      'manage-settings': path.resolve(__dirname, 'src/features/manage/settings'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  server: {
    port: Number(process.env.VITE_DEV_PORT) || 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:'.concat(process.env.PORT || 4000),
        changeOrigin: true,
      },
    },
  },
});
