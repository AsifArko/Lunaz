import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { getConfig } from '../../config/index.js';
import { UserRole } from 'constants/enums';
import * as customerService from './customers.service.js';

const router = Router();
const getConfigFn = getConfig;

// All routes require admin access
router.use(authMiddleware(getConfigFn));
router.use(requireRole(UserRole.ADMIN));

// GET /customers — list customers with pagination and search
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const search = req.query.search as string | undefined;
    const sort = (req.query.sort as string) || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const result = await customerService.listCustomers({ page, limit, search, sort, order });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// GET /customers/stats — customer statistics
router.get('/stats', async (_req, res, next) => {
  try {
    const stats = await customerService.getCustomerStats();
    res.json(stats);
  } catch (e) {
    next(e);
  }
});

// GET /customers/:id — single customer detail
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    if (!customer) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Customer not found' } });
      return;
    }
    res.json(customer);
  } catch (e) {
    next(e);
  }
});

// GET /customers/:id/orders — customer's orders
router.get('/:id/orders', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const result = await customerService.getCustomerOrders(req.params.id, { page, limit });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export const customersRoutes = router;
