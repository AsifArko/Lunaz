import express from 'express';
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

export function createApp() {
  const config = getConfig();
  const app = express();

  // Security
  app.use(helmet());
  app.use(
    cors({
      origin: [config.FRONTEND_WEB_URL, config.FRONTEND_MANAGE_URL],
      credentials: true,
    })
  );
  app.use(express.json());

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

  app.use(errorHandler);
  return app;
}
