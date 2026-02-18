import mongoose from 'mongoose';
import { PaymentMethod } from '../../constants/enums';

// Bank account schema for bank transfers
const bankAccountSchema = new mongoose.Schema(
  {
    bankName: { type: String, required: true },
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    branchName: String,
    routingNumber: String,
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

// Payment settings schemas
const bkashSettingsSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    sandbox: { type: Boolean, default: true },
    appKey: String,
    appSecret: String,
    username: String,
    password: String,
    callbackUrl: String,
  },
  { _id: false }
);

const nagadSettingsSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    sandbox: { type: Boolean, default: true },
    merchantId: String,
    merchantPrivateKey: String,
    pgPublicKey: String,
    callbackUrl: String,
  },
  { _id: false }
);

const bankTransferSettingsSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    accounts: [bankAccountSchema],
    instructions: String,
    expiryHours: { type: Number, default: 48 },
  },
  { _id: false }
);

const sslcommerzSettingsSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    sandbox: { type: Boolean, default: true },
    storeId: String,
    storePassword: String,
    successUrl: String,
    failUrl: String,
    cancelUrl: String,
    ipnUrl: String,
  },
  { _id: false }
);

const codSettingsSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    instructions: String,
    minimumOrder: { type: Number, default: 0 },
    maximumOrder: Number,
    availableAreas: [String],
  },
  { _id: false }
);

const paymentSettingsSchema = new mongoose.Schema(
  {
    enabledMethods: [
      {
        type: String,
        enum: Object.values(PaymentMethod),
      },
    ],
    bkash: { type: bkashSettingsSchema, default: () => ({}) },
    nagad: { type: nagadSettingsSchema, default: () => ({}) },
    bankTransfer: { type: bankTransferSettingsSchema, default: () => ({}) },
    sslcommerz: { type: sslcommerzSettingsSchema, default: () => ({}) },
    cod: { type: codSettingsSchema, default: () => ({}) },
  },
  { _id: false }
);

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
    currency: { type: String, default: 'BDT' },

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

    // Payment settings
    payments: {
      type: paymentSettingsSchema,
      default: () => ({
        enabledMethods: [PaymentMethod.CASH_ON_DELIVERY, PaymentMethod.BANK_TRANSFER],
        bkash: { enabled: false, sandbox: true },
        nagad: { enabled: false, sandbox: true },
        bankTransfer: { enabled: true, accounts: [], expiryHours: 48 },
        sslcommerz: { enabled: false, sandbox: true },
        cod: { enabled: true, minimumOrder: 0 },
      }),
    },
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
