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
        target: 'http://127.0.0.1:'.concat(process.env.PORT || 4000),
        changeOrigin: true,
        timeout: 30000,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            const reqPath = req.url || req.path || 'unknown';
            console.error('[Vite Proxy] Backend unreachable for', req.method, reqPath, err.message);
            const nodeRes = res;
            if (nodeRes && !nodeRes.headersSent && nodeRes.writeHead) {
              nodeRes.writeHead(503, { 'Content-Type': 'application/json' });
              nodeRes.end(
                JSON.stringify({
                  error: {
                    code: 'SERVICE_UNAVAILABLE',
                    message:
                      'Backend temporarily unavailable. Is it running on port ' +
                      (process.env.PORT || 4000) +
                      '?',
                  },
                })
              );
            }
          });
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setTimeout(30000);
          });
        },
      },
    },
  },
});
