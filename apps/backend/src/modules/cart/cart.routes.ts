import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validateBody } from '../../middleware/validate.js';
import { getConfig } from '../../config/index.js';
import { UserRole } from 'constants/enums';
import { replaceCartSchema, addCartItemSchema, updateCartItemSchema } from './cart.validation.js';
import {
  getCart,
  replaceCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
} from './cart.service.js';

const router = Router();
const getConfigFn = getConfig;

router.use(authMiddleware(getConfigFn));
router.use(requireRole(UserRole.CUSTOMER));

// GET /cart — get current cart
router.get('/', async (req, res, next) => {
  try {
    const cart = await getCart(req.user!.id);
    res.json(cart);
  } catch (e) {
    next(e);
  }
});

// PUT /cart — replace cart
router.put('/', validateBody(replaceCartSchema), async (req, res, next) => {
  try {
    const cart = await replaceCart(req.user!.id, req.body);
    res.json(cart);
  } catch (e) {
    next(e);
  }
});

// POST /cart/items — add item
router.post('/items', validateBody(addCartItemSchema), async (req, res, next) => {
  try {
    const cart = await addCartItem(req.user!.id, req.body);
    res.status(201).json(cart);
  } catch (e) {
    next(e);
  }
});

// PATCH /cart/items/:id — update quantity
router.patch('/items/:id', validateBody(updateCartItemSchema), async (req, res, next) => {
  try {
    const cart = await updateCartItem(req.user!.id, req.params.id, req.body);
    res.json(cart);
  } catch (e) {
    next(e);
  }
});

// DELETE /cart/items/:id — remove item
router.delete('/items/:id', async (req, res, next) => {
  try {
    const cart = await removeCartItem(req.user!.id, req.params.id);
    res.json(cart);
  } catch (e) {
    next(e);
  }
});

export const cartRoutes = router;
