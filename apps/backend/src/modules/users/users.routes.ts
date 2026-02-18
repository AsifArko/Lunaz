import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validateBody } from '../../middleware/validate.js';
import { getConfig } from '../../config/index.js';
import { UserRole } from '../../constants/enums';
import {
  updateProfileSchema,
  changePasswordSchema,
  createAddressSchema,
  updateAddressSchema,
} from './users.validation.js';
import {
  getProfile,
  updateProfile,
  changePassword,
  listAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from './users.service.js';

const router = Router();
const getConfigFn = getConfig;

router.use(authMiddleware(getConfigFn));
router.use(requireRole(UserRole.CUSTOMER, UserRole.ADMIN));

// GET /users/me — full profile
router.get('/me', async (req, res, next) => {
  try {
    const profile = await getProfile(req.user!.id);
    res.json(profile);
  } catch (e) {
    next(e);
  }
});

// PATCH /users/me — update profile
router.patch('/me', validateBody(updateProfileSchema), async (req, res, next) => {
  try {
    const profile = await updateProfile(req.user!.id, req.body);
    res.json(profile);
  } catch (e) {
    next(e);
  }
});

// PUT /users/me/password — change password
router.put('/me/password', validateBody(changePasswordSchema), async (req, res, next) => {
  try {
    const result = await changePassword(req.user!.id, req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// GET /users/me/addresses — list addresses
router.get('/me/addresses', async (req, res, next) => {
  try {
    const addresses = await listAddresses(req.user!.id);
    res.json({ addresses });
  } catch (e) {
    next(e);
  }
});

// POST /users/me/addresses — add address
router.post('/me/addresses', validateBody(createAddressSchema), async (req, res, next) => {
  try {
    const address = await addAddress(req.user!.id, req.body);
    res.status(201).json(address);
  } catch (e) {
    next(e);
  }
});

// PATCH /users/me/addresses/:id — update address
router.patch('/me/addresses/:id', validateBody(updateAddressSchema), async (req, res, next) => {
  try {
    const address = await updateAddress(req.user!.id, req.params.id, req.body);
    res.json(address);
  } catch (e) {
    next(e);
  }
});

// DELETE /users/me/addresses/:id — delete address
router.delete('/me/addresses/:id', async (req, res, next) => {
  try {
    await deleteAddress(req.user!.id, req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

// PATCH /users/me/addresses/:id/default — set default address
router.patch('/me/addresses/:id/default', async (req, res, next) => {
  try {
    const address = await setDefaultAddress(req.user!.id, req.params.id);
    res.json(address);
  } catch (e) {
    next(e);
  }
});

export const usersRoutes = router;
