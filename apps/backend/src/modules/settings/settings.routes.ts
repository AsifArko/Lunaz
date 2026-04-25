import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validateBody } from '../../middleware/validate.js';
import { getConfig } from '../../config/index.js';
import { UserRole } from '../../constants/enums';
import { getSettings } from './settings.model.js';
import { updateSettingsSchema } from './settings.validation.js';

const router = Router();
const getConfigFn = getConfig;

/**
 * Convert settings document to response format.
 * Returns all settings for admin use.
 */
function toSettings(doc: Record<string, unknown>) {
  const obj = { ...doc };
  delete obj._id;
  delete obj.__v;
  if (obj.updatedAt instanceof Date) {
    obj.updatedAt = obj.updatedAt.toISOString();
  }
  if (obj.createdAt instanceof Date) {
    obj.createdAt = obj.createdAt.toISOString();
  }
  return obj;
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
      const body = req.body as Record<string, unknown>;

      // Assign top-level and nested - Mongoose will handle subdocuments
      const settingsObj = settings as unknown as Record<string, unknown>;
      for (const [key, value] of Object.entries(body)) {
        if (value === undefined) continue;
        if (key === 'business' || key === 'social' || key === 'notifications') {
          if (typeof value === 'object' && value !== null) {
            const target = settingsObj[key];
            if (target && typeof target === 'object') {
              Object.assign(target, value);
            } else {
              settingsObj[key] = value;
            }
          }
        } else {
          settingsObj[key] = value;
        }
      }

      await settings.save();
      res.json(toSettings(settings.toObject()));
    } catch (e) {
      next(e);
    }
  }
);

// GET /settings/public — public settings (no auth required)
// Only exposes non-sensitive settings needed by frontend (cart, checkout, etc.)
router.get('/public', async (_req, res, next) => {
  try {
    const settings = await getSettings();
    const payload: Record<string, unknown> = {
      storeName: settings.storeName,
      currency: settings.currency,
      allowGuestCheckout: settings.allowGuestCheckout,
    };
    // Tax settings for cart/checkout when displayTaxInCart is enabled
    payload.enableTax = settings.enableTax ?? false;
    payload.taxRate = settings.taxRate ?? 0;
    payload.taxLabel = settings.taxLabel ?? 'Tax';
    payload.taxIncludedInPrices = settings.taxIncludedInPrices ?? false;
    payload.displayTaxInCart = settings.displayTaxInCart ?? false;
    // Shipping rates for cart (flat rate: Inside Dhaka vs Outside Dhaka)
    payload.shippingInsideDhaka = settings.shippingInsideDhaka ?? 100;
    payload.shippingOutsideDhaka = settings.shippingOutsideDhaka ?? 150;
    // Order settings for storefront (allow backorders on product pages, cart)
    payload.allowBackorder = settings.allowBackorder ?? false;
    res.json(payload);
  } catch (e) {
    next(e);
  }
});

export const settingsRoutes = router;
