import { z } from 'zod';

// Nested schemas for validation
const businessSchema = z
  .object({
    businessName: z.string().optional(),
    tradingName: z.string().optional(),
    businessType: z.string().optional(),
    registrationDate: z.string().optional(),
    industry: z.string().optional(),
    businessAddress: z.string().optional(),
    businessCity: z.string().optional(),
    businessState: z.string().optional(),
    businessPostalCode: z.string().optional(),
    businessCountry: z.string().optional(),
    businessLat: z.number().optional(),
    businessLng: z.number().optional(),
    vatNumber: z.string().optional(),
    binNumber: z.string().optional(),
    tinNumber: z.string().optional(),
    registrationNumber: z.string().optional(),
    taxCertificateUrl: z.string().optional(),
    bankName: z.string().optional(),
    bankAccountName: z.string().optional(),
    bankAccountNumber: z.string().optional(),
    bankRoutingNumber: z.string().optional(),
    bankSwiftCode: z.string().optional(),
    acceptedPaymentMethods: z.array(z.string()).optional(),
  })
  .strict()
  .optional();

const socialSchema = z
  .object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    youtube: z.string().optional(),
    tiktok: z.string().optional(),
    linkedin: z.string().optional(),
    pinterest: z.string().optional(),
    whatsapp: z.string().optional(),
    enableSocialSharing: z.boolean().optional(),
    socialSharingPlatforms: z.array(z.string()).optional(),
    socialShareTemplate: z.string().optional(),
    socialShareIncludeImage: z.boolean().optional(),
  })
  .strict()
  .optional();

const notificationsSchema = z
  .object({
    adminNewOrder: z.boolean().optional(),
    adminOrderCancelled: z.boolean().optional(),
    adminLowStock: z.boolean().optional(),
    adminOutOfStock: z.boolean().optional(),
    adminNewCustomer: z.boolean().optional(),
    adminFailedPayment: z.boolean().optional(),
    adminRefund: z.boolean().optional(),
    adminNewReview: z.boolean().optional(),
    customerOrderConfirmation: z.boolean().optional(),
    customerOrderShipped: z.boolean().optional(),
    customerOrderDelivered: z.boolean().optional(),
    customerOrderCancelled: z.boolean().optional(),
    customerRefund: z.boolean().optional(),
    dailyReport: z.boolean().optional(),
    dailyReportTime: z.string().optional(),
    dailyReportRecipients: z.array(z.string()).optional(),
    weeklyReport: z.boolean().optional(),
    weeklyReportDay: z.number().optional(),
    weeklyReportRecipients: z.array(z.string()).optional(),
    monthlyReport: z.boolean().optional(),
    monthlyReportRecipients: z.array(z.string()).optional(),
    enableBrowserNotifications: z.boolean().optional(),
    orderNotificationSound: z.boolean().optional(),
    notificationSoundFile: z.string().optional(),
  })
  .strict()
  .optional();

const gatewaySchema = z.object({
  enabled: z.boolean().optional(),
  sandbox: z.boolean().optional(),
  storeId: z.string().optional(),
  storePassword: z.string().optional(),
  successUrl: z.string().optional(),
  failUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
  ipnUrl: z.string().optional(),
  publishableKey: z.string().optional(),
  secretKey: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
});

const paymentSettingsSchema = z
  .object({
    cashOnDelivery: z.boolean().optional(),
    codInstructions: z.string().optional(),
    bankTransfer: z.boolean().optional(),
    bankTransferInstructions: z.string().optional(),
    bkash: z.boolean().optional(),
    bkashMerchantNumber: z.string().optional(),
    nagad: z.boolean().optional(),
    nagadMerchantNumber: z.string().optional(),
    cardPayment: z.boolean().optional(),
  })
  .passthrough()
  .optional();

const gatewaysSchema = z
  .object({
    sslcommerz: gatewaySchema.optional(),
    stripe: gatewaySchema.optional(),
    paypal: gatewaySchema.optional(),
  })
  .passthrough()
  .optional();

export const updateSettingsSchema = z.object({
  body: z
    .object({
      // Store info
      storeName: z.string().min(1).max(100).optional(),
      storeDescription: z.string().optional(),
      storeEmail: z.string().email().optional().or(z.literal('')),
      supportEmail: z.string().email().optional().or(z.literal('')),
      phone: z.string().optional(),
      logoUrl: z.string().optional(),
      faviconUrl: z.string().optional(),
      // Regional
      currency: z.string().length(3).optional(),
      currencyPosition: z.enum(['before', 'after']).optional(),
      decimalSeparator: z.string().optional(),
      thousandsSeparator: z.string().optional(),
      timezone: z.string().optional(),
      dateFormat: z.string().optional(),
      timeFormat: z.enum(['12h', '24h']).optional(),
      defaultLanguage: z.string().optional(),
      weightUnit: z.enum(['kg', 'lb', 'g', 'oz']).optional(),
      dimensionUnit: z.enum(['cm', 'in', 'm', 'ft']).optional(),
      // Features
      enableReviews: z.boolean().optional(),
      enableWishlist: z.boolean().optional(),
      enableQuickView: z.boolean().optional(),
      enableCompare: z.boolean().optional(),
      allowGuestCheckout: z.boolean().optional(),
      allowRegistration: z.boolean().optional(),
      requireEmailVerification: z.boolean().optional(),
      maintenanceMode: z.boolean().optional(),
      maintenanceMessage: z.string().optional(),
      // SEO
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      metaKeywords: z.array(z.string()).optional(),
      googleAnalyticsId: z.string().optional(),
      facebookPixelId: z.string().optional(),
      googleTagManagerId: z.string().optional(),
      // Shipping
      flatShippingRate: z.number().min(0).optional(),
      shippingInsideDhaka: z.number().min(0).optional(),
      shippingOutsideDhaka: z.number().min(0).optional(),
      // Tax
      enableTax: z.boolean().optional(),
      taxRate: z.number().min(0).max(100).optional(),
      taxIncludedInPrices: z.boolean().optional(),
      displayTaxInCart: z.boolean().optional(),
      taxLabel: z.string().optional(),
      showTaxNumber: z.boolean().optional(),
      // Orders
      orderPrefix: z.string().min(1).max(10).optional(),
      orderNumberStart: z.number().optional(),
      autoConfirmOrders: z.boolean().optional(),
      lowStockThreshold: z.number().optional(),
      outOfStockDisplay: z.enum(['hide', 'show']).optional(),
      allowBackorder: z.boolean().optional(),
      minimumOrderAmount: z.number().optional(),
      maximumOrderItems: z.number().optional(),
      // Nested
      business: businessSchema,
      social: socialSchema,
      notifications: notificationsSchema,
      paymentSettings: paymentSettingsSchema,
      gateways: gatewaysSchema,
    })
    .passthrough(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>['body'];
