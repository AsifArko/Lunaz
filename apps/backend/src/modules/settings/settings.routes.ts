import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validateBody } from '../../middleware/validate.js';
import { getConfig } from '../../config/index.js';
import { UserRole } from 'constants/enums';
import { getSettings } from './settings.model.js';
import { updateSettingsSchema } from './settings.validation.js';

const router = Router();
const getConfigFn = getConfig;

/**
 * Convert settings document to response format.
 */
function toSettings(doc: Record<string, unknown>) {
  return {
    storeName: doc.storeName,
    storeEmail: doc.storeEmail,
    supportEmail: doc.supportEmail,
    currency: doc.currency,
    freeShippingThreshold: doc.freeShippingThreshold,
    flatShippingRate: doc.flatShippingRate,
    taxRate: doc.taxRate,
    taxIncludedInPrices: doc.taxIncludedInPrices,
    orderPrefix: doc.orderPrefix,
    allowGuestCheckout: doc.allowGuestCheckout,
    requireEmailVerification: doc.requireEmailVerification,
    updatedAt: (doc.updatedAt as Date)?.toISOString?.(),
  };
}

// GET /settings — get current settings (admin only)
router.get(
  '/',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  async (_req, res, next) => {
    try {
      const settings = await getSettings();
      res.json(toSettings(settings.toObject()));
    } catch (e) {
      next(e);
    }
  }
);

// PATCH /settings — update settings (admin only)
router.patch(
  '/',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  validateBody(updateSettingsSchema),
  async (req, res, next) => {
    try {
      const settings = await getSettings();
      Object.assign(settings, req.body);
      await settings.save();
      res.json(toSettings(settings.toObject()));
    } catch (e) {
      next(e);
    }
  }
);

// GET /settings/public — public settings (no auth required)
// Only exposes non-sensitive settings needed by frontend
router.get('/public', async (_req, res, next) => {
  try {
    const settings = await getSettings();
    res.json({
      storeName: settings.storeName,
      currency: settings.currency,
      freeShippingThreshold: settings.freeShippingThreshold,
      allowGuestCheckout: settings.allowGuestCheckout,
    });
  } catch (e) {
    next(e);
  }
});

export const settingsRoutes = router;
