import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { getConfig } from '../../config/index.js';
import { UserRole } from '../../constants/enums';
import * as dashboardService from './dashboard.service.js';

const router = Router();
const getConfigFn = getConfig;

// All routes require admin access
router.use(authMiddleware(getConfigFn));
router.use(requireRole(UserRole.ADMIN));

// GET /dashboard/stats — main dashboard statistics
router.get('/stats', async (_req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.json(stats);
  } catch (e) {
    next(e);
  }
});

// GET /dashboard/recent-orders — recent orders for dashboard
router.get('/recent-orders', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 5, 20);
    const orders = await dashboardService.getRecentOrders(limit);
    res.json({ data: orders });
  } catch (e) {
    next(e);
  }
});

// GET /dashboard/top-products — best selling products
router.get('/top-products', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 5, 20);
    const products = await dashboardService.getTopProducts(limit);
    res.json({ data: products });
  } catch (e) {
    next(e);
  }
});

// GET /dashboard/sales-chart — sales data for chart
router.get('/sales-chart', async (req, res, next) => {
  try {
    const days = Math.min(parseInt(req.query.days as string) || 30, 90);
    const data = await dashboardService.getSalesChartData(days);
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

export const dashboardRoutes = router;
