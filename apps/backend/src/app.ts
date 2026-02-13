import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { getConfig } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter, authLimiter } from './middleware/rateLimit.js';
import { serverLoggerMiddleware } from './middleware/serverLogger.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';
import { categoriesRoutes } from './modules/categories/categories.routes.js';
import { productsRoutes } from './modules/products/products.routes.js';
import { cartRoutes } from './modules/cart/cart.routes.js';
import { ordersRoutes } from './modules/orders/orders.routes.js';
import { transactionsRoutes } from './modules/transactions/transactions.routes.js';
import { customersRoutes } from './modules/customers/customers.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { settingsRoutes } from './modules/settings/settings.routes.js';
import { analyticsRoutes } from './modules/analytics/analytics.routes.js';
import { paymentsRoutes } from './modules/payments/payments.routes.js';
import { complianceRoutes } from './modules/compliance/index.js';

/** Build CORS allowed origins: config URLs plus 127.0.0.1 variants so both localhost and 127.0.0.1 work */
function getAllowedOrigins(webUrl: string, manageUrl: string, isDev: boolean): string[] {
  const origins = new Set([webUrl, manageUrl]);
  try {
    const web = new URL(webUrl);
    const manage = new URL(manageUrl);
    if (web.hostname === 'localhost') {
      web.hostname = '127.0.0.1';
      origins.add(web.origin);
    }
    if (manage.hostname === 'localhost') {
      manage.hostname = '127.0.0.1';
      origins.add(manage.origin);
    }
  } catch {
    // ignore
  }
  // In development, explicitly add localhost:3000 and :3001 so Docker/Compose always works
  if (isDev) {
    origins.add('http://localhost:3000');
    origins.add('http://localhost:3001');
    origins.add('http://127.0.0.1:3000');
    origins.add('http://127.0.0.1:3001');
  }
  return Array.from(origins);
}

/** Check if origin is a local development origin (localhost or 127.0.0.1) */
function isLocalOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

export function createApp() {
  const config = getConfig();
  const app = express();

  const isDev = config.NODE_ENV === 'development';
  const allowedOrigins = getAllowedOrigins(
    config.FRONTEND_WEB_URL,
    config.FRONTEND_MANAGE_URL,
    isDev
  );

  const corsAllowMethods = 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS';
  const corsAllowHeaders =
    'Content-Type, Authorization, Accept, Accept-Language, Origin, X-Requested-With, X-CSRF-Token';

  // Preflight: must run FIRST, handle OPTIONS before cors package
  app.use((req, res, next) => {
    if (req.method !== 'OPTIONS') return next();
    const origin = req.headers.origin as string | undefined;
    const allowed = origin && (allowedOrigins.includes(origin) || (isDev && isLocalOrigin(origin)));
    if (allowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', corsAllowMethods);
      res.setHeader('Access-Control-Allow-Headers', corsAllowHeaders);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      // Max-Age 0 disables preflight cache; avoids stale cached responses breaking CORS
      res.setHeader('Access-Control-Max-Age', '0');
    }
    res.status(204).setHeader('Content-Length', '0').end();
  });

  // CORS for non-OPTIONS requests
  app.use(
    cors({
      origin: (origin, cb) => {
        if (origin) {
          if (allowedOrigins.includes(origin) || (isDev && isLocalOrigin(origin))) {
            cb(null, origin);
            return;
          }
          cb(null, false);
          return;
        }
        cb(null, allowedOrigins[0]);
      },
      credentials: true,
      methods: corsAllowMethods.split(', '),
      allowedHeaders: corsAllowHeaders.split(', '),
      optionsSuccessStatus: 204,
      preflightContinue: false,
    })
  );

  // Security — in development, disable CSP to avoid blocking API calls from different ports
  app.use(
    helmet({
      ...(isDev && {
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      }),
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Server logging middleware (logs all requests to MongoDB)
  app.use(serverLoggerMiddleware());

  // Rate limiting
  app.use('/api/v1/auth', authLimiter);
  app.use('/api/v1', generalLimiter);

  const api = express.Router();

  // Auth & Users
  api.use('/auth', authRoutes);
  api.use('/users', usersRoutes);

  // Catalog
  api.use('/categories', categoriesRoutes);
  api.use('/products', productsRoutes);

  // Shopping
  api.use('/cart', cartRoutes);
  api.use('/orders', ordersRoutes);
  api.use('/payments', paymentsRoutes);

  // Admin
  api.use('/customers', customersRoutes);
  api.use('/dashboard', dashboardRoutes);
  api.use('/transactions', transactionsRoutes);
  api.use('/settings', settingsRoutes);

  // Analytics
  api.use('/analytics', analyticsRoutes);

  // Compliance
  api.use('/compliance', complianceRoutes);

  app.use('/api/v1', api);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Serve static files when STATIC_DIR is set (e.g. single-container ECS deployment)
  const staticDir = config.STATIC_DIR;
  if (staticDir) {
    const publicDir = path.resolve(staticDir);
    app.use('/manage', express.static(path.join(publicDir, 'manage')));
    app.use(express.static(publicDir));
    app.get('/manage', (_req, res) => res.redirect(301, '/manage/'));
    app.get('/manage/*', (_req, res) => {
      res.sendFile(path.join(publicDir, 'manage', 'index.html'));
    });
    app.get('*', (_req, res) => {
      res.sendFile(path.join(publicDir, 'index.html'));
    });
  }

  app.use(errorHandler);
  return app;
}
