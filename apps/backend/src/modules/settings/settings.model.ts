import mongoose from 'mongoose';

/**
 * Settings schema for store configuration.
 * Uses a singleton pattern - only one document exists.
 */
const settingsSchema = new mongoose.Schema(
  {
    // Store information
    storeName: { type: String, default: 'Lunaz Store' },
    storeEmail: { type: String, default: '' },
    supportEmail: { type: String, default: '' },
    currency: { type: String, default: 'USD' },
    
    // Shipping settings
    freeShippingThreshold: { type: Number, default: 0 },
    flatShippingRate: { type: Number, default: 0 },
    
    // Tax settings
    taxRate: { type: Number, default: 0 }, // Percentage (e.g., 8.5 for 8.5%)
    taxIncludedInPrices: { type: Boolean, default: false },
    
    // Order settings
    orderPrefix: { type: String, default: 'LN' },
    
    // Features toggles
    allowGuestCheckout: { type: Boolean, default: true },
    requireEmailVerification: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SettingsModel = mongoose.model('Settings', settingsSchema);

/**
 * Get or create the singleton settings document.
 */
export async function getSettings() {
  let settings = await SettingsModel.findOne();
  if (!settings) {
    settings = await SettingsModel.create({});
  }
  return settings;
}
