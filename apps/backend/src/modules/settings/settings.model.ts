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

// Payment settings schemas (backend format)
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

const stripeSettingsSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    publishableKey: String,
    secretKey: String,
  },
  { _id: false }
);

const paypalSettingsSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    sandbox: { type: Boolean, default: true },
    clientId: String,
    clientSecret: String,
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
    stripe: { type: stripeSettingsSchema, default: () => ({}) },
    paypal: { type: paypalSettingsSchema, default: () => ({}) },
    cod: { type: codSettingsSchema, default: () => ({}) },
  },
  { _id: false }
);

// Business info schema
const businessInfoSchema = new mongoose.Schema(
  {
    businessName: String,
    tradingName: String,
    businessType: String,
    registrationDate: String,
    industry: String,
    businessAddress: String,
    businessCity: String,
    businessState: String,
    businessPostalCode: String,
    businessCountry: String,
    businessLat: Number,
    businessLng: Number,
    vatNumber: String,
    binNumber: String,
    tinNumber: String,
    registrationNumber: String,
    taxCertificateUrl: String,
    bankName: String,
    bankAccountName: String,
    bankAccountNumber: String,
    bankRoutingNumber: String,
    bankSwiftCode: String,
    acceptedPaymentMethods: [String],
  },
  { _id: false }
);

// Social settings schema
const socialSettingsSchema = new mongoose.Schema(
  {
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String,
    tiktok: String,
    linkedin: String,
    pinterest: String,
    whatsapp: String,
    enableSocialSharing: { type: Boolean, default: true },
    socialSharingPlatforms: [String],
    socialShareTemplate: String,
    socialShareIncludeImage: { type: Boolean, default: true },
  },
  { _id: false }
);

// Notification settings schema
const notificationSettingsSchema = new mongoose.Schema(
  {
    adminNewOrder: { type: Boolean, default: true },
    adminOrderCancelled: { type: Boolean, default: true },
    adminLowStock: { type: Boolean, default: true },
    adminOutOfStock: { type: Boolean, default: true },
    adminNewCustomer: { type: Boolean, default: false },
    adminFailedPayment: { type: Boolean, default: true },
    adminRefund: { type: Boolean, default: true },
    adminNewReview: { type: Boolean, default: false },
    customerOrderConfirmation: { type: Boolean, default: true },
    customerOrderShipped: { type: Boolean, default: true },
    customerOrderDelivered: { type: Boolean, default: true },
    customerOrderCancelled: { type: Boolean, default: true },
    customerRefund: { type: Boolean, default: true },
    dailyReport: { type: Boolean, default: false },
    dailyReportTime: { type: String, default: '08:00' },
    dailyReportRecipients: [String],
    weeklyReport: { type: Boolean, default: true },
    weeklyReportDay: { type: Number, default: 1 },
    weeklyReportRecipients: [String],
    monthlyReport: { type: Boolean, default: true },
    monthlyReportRecipients: [String],
    enableBrowserNotifications: { type: Boolean, default: true },
    orderNotificationSound: { type: Boolean, default: true },
    notificationSoundFile: { type: String, default: 'default' },
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
    storeDescription: String,
    storeEmail: { type: String, default: '' },
    supportEmail: { type: String, default: '' },
    phone: String,
    logoUrl: String,
    faviconUrl: String,

    // Regional settings
    currency: { type: String, default: 'BDT' },
    currencyPosition: { type: String, default: 'before' },
    decimalSeparator: { type: String, default: '.' },
    thousandsSeparator: { type: String, default: ',' },
    timezone: { type: String, default: 'Asia/Dhaka' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    timeFormat: { type: String, default: '12h' },
    defaultLanguage: { type: String, default: 'en' },
    weightUnit: { type: String, default: 'kg' },
    dimensionUnit: { type: String, default: 'cm' },

    // Features
    enableReviews: { type: Boolean, default: true },
    enableWishlist: { type: Boolean, default: true },
    enableQuickView: { type: Boolean, default: true },
    enableCompare: { type: Boolean, default: false },
    allowGuestCheckout: { type: Boolean, default: true },
    allowRegistration: { type: Boolean, default: true },
    requireEmailVerification: { type: Boolean, default: false },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: String,

    // SEO
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    googleAnalyticsId: String,
    facebookPixelId: String,
    googleTagManagerId: String,

    // Shipping (flat rate: Inside Dhaka vs Outside Dhaka)
    flatShippingRate: { type: Number, default: 0 },
    shippingInsideDhaka: { type: Number, default: 100 },
    shippingOutsideDhaka: { type: Number, default: 150 },

    // Tax
    enableTax: { type: Boolean, default: false },
    taxRate: { type: Number, default: 0 },
    taxIncludedInPrices: { type: Boolean, default: false },
    displayTaxInCart: { type: Boolean, default: true },
    taxLabel: { type: String, default: 'Tax' },
    showTaxNumber: { type: Boolean, default: false },

    // Orders
    orderPrefix: { type: String, default: 'LN' },
    orderNumberStart: { type: Number, default: 1000 },
    autoConfirmOrders: { type: Boolean, default: false },
    lowStockThreshold: { type: Number, default: 10 },
    outOfStockDisplay: { type: String, default: 'show' },
    allowBackorder: { type: Boolean, default: false },
    minimumOrderAmount: { type: Number, default: 0 },
    maximumOrderItems: { type: Number, default: 100 },

    // Business, Social, Notifications (nested)
    business: { type: businessInfoSchema, default: () => ({}) },
    social: { type: socialSettingsSchema, default: () => ({}) },
    notifications: { type: notificationSettingsSchema, default: () => ({}) },
    // Payment settings - frontend format (cashOnDelivery, bkash, etc. + gateways)
    paymentSettings: mongoose.Schema.Types.Mixed,
    gateways: mongoose.Schema.Types.Mixed,
    // Legacy payments (backend format - kept for compatibility)
    payments: {
      type: paymentSettingsSchema,
      default: () => ({
        enabledMethods: [PaymentMethod.CASH_ON_DELIVERY, PaymentMethod.BANK_TRANSFER],
        bkash: { enabled: false, sandbox: true },
        nagad: { enabled: false, sandbox: true },
        bankTransfer: { enabled: true, accounts: [], expiryHours: 48 },
        sslcommerz: { enabled: false, sandbox: true },
        stripe: { enabled: false },
        paypal: { enabled: false, sandbox: true },
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
