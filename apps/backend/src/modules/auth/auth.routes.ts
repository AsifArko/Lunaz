import { Router } from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  validateResetToken,
} from './auth.service.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validateTokenSchema,
} from './auth.validation.js';
import { validateBody } from '../../middleware/validate.js';
import { authMiddleware } from '../../middleware/auth.js';
import { getConfig } from '../../config/index.js';

const router = Router();
const getConfigFn = getConfig;

// POST /auth/register
router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const result = await register(req.body, getConfigFn);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// POST /auth/login
router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const result = await login(req.body, getConfigFn);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// GET /auth/me
router.get('/me', authMiddleware(getConfigFn), (req, res) => {
  res.json({ user: req.user });
});

// POST /auth/forgot-password
router.post('/forgot-password', validateBody(forgotPasswordSchema), async (req, res, next) => {
  try {
    const result = await forgotPassword(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /auth/reset-password
router.post('/reset-password', validateBody(resetPasswordSchema), async (req, res, next) => {
  try {
    const result = await resetPassword(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /auth/validate-reset-token
router.post('/validate-reset-token', validateBody(validateTokenSchema), async (req, res, next) => {
  try {
    const result = await validateResetToken(req.body.token);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export const authRoutes = router;
