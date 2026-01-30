import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validateBody } from '../../middleware/validate.js';
import { getConfig } from '../../config/index.js';
import { UserRole } from '@lunaz/types';
import { createOrderSchema, updateOrderStatusSchema } from './orders.validation.js';
import { createOrder, listOrders, getOrder, updateOrderStatus } from './orders.service.js';

const router = Router();
const getConfigFn = getConfig;

// All routes require auth
router.use(authMiddleware(getConfigFn));

// POST /orders — customer create order from cart
router.post('/', requireRole(UserRole.CUSTOMER), validateBody(createOrderSchema), async (req, res, next) => {
  try {
    const order = await createOrder(req.user!.id, req.body);
    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
});

// GET /orders — list orders (customer: own; admin: all)
router.get('/', async (req, res, next) => {
  try {
    const isAdmin = req.user!.role === UserRole.ADMIN;
    const query = {
      status: req.query.status as string | undefined,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    };
    const result = await listOrders(req.user!.id, isAdmin, query);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// GET /orders/:id — order detail
router.get('/:id', async (req, res, next) => {
  try {
    const isAdmin = req.user!.role === UserRole.ADMIN;
    const order = await getOrder(req.user!.id, req.params.id, isAdmin);
    res.json(order);
  } catch (e) {
    next(e);
  }
});

// PATCH /orders/:id/status — admin update status
router.patch('/:id/status', requireRole(UserRole.ADMIN), validateBody(updateOrderStatusSchema), async (req, res, next) => {
  try {
    const order = await updateOrderStatus(req.params.id, req.body);
    res.json(order);
  } catch (e) {
    next(e);
  }
});

export const ordersRoutes = router;
