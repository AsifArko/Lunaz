import type {
  StoreSettings,
  BusinessInfo,
  SocialSettings,
  NotificationSettings,
  PaymentSettings,
  PaymentGateways,
  SecuritySettings,
  UserPreferences,
} from 'manage-settings/types';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  // Store Information
  storeName: 'Lunaz Store',
  storeDescription: '',
  storeEmail: '',
  supportEmail: '',
  phone: '',
  logoUrl: '',
  faviconUrl: '',

  // Regional Settings
  currency: 'BDT',
  currencyPosition: 'before',
  decimalSeparator: '.',
  thousandsSeparator: ',',
  timezone: 'Asia/Dhaka',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  defaultLanguage: 'en',
  weightUnit: 'kg',
  dimensionUnit: 'cm',

  // Features
  enableReviews: true,
  enableWishlist: true,
  enableQuickView: true,
  enableCompare: false,
  allowGuestCheckout: true,
  allowRegistration: true,
  requireEmailVerification: false,
  maintenanceMode: false,
  maintenanceMessage: '',

  // SEO
  metaTitle: '',
  metaDescription: '',
  metaKeywords: [],
  googleAnalyticsId: '',
  facebookPixelId: '',
  googleTagManagerId: '',

  // Shipping
  freeShippingThreshold: 0,
  standardShippingRate: 0,
  expressShippingRate: 0,
  sameDayShippingRate: 0,
  shippingCalculation: 'flat',

  // Tax
  enableTax: false,
  taxRate: 0,
  taxIncludedInPrices: false,
  displayTaxInCart: true,
  taxLabel: 'Tax',
  showTaxNumber: false,

  // Orders
  orderPrefix: 'LN',
  orderNumberStart: 1000,
  autoConfirmOrders: false,
  lowStockThreshold: 10,
  outOfStockDisplay: 'show',
  allowBackorder: false,
  minimumOrderAmount: 0,
  maximumOrderItems: 100,
};

export const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  businessName: '',
  tradingName: '',
  businessType: '',
  registrationDate: '',
  industry: '',

  businessAddress: '',
  businessCity: '',
  businessState: '',
  businessPostalCode: '',
  businessCountry: 'Bangladesh',
  businessLat: undefined,
  businessLng: undefined,

  vatNumber: '',
  binNumber: '',
  tinNumber: '',
  registrationNumber: '',
  taxCertificateUrl: '',

  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankRoutingNumber: '',
  bankSwiftCode: '',
  acceptedPaymentMethods: [],
};

export const DEFAULT_SOCIAL_SETTINGS: SocialSettings = {
  facebook: '',
  instagram: '',
  twitter: '',
  youtube: '',
  tiktok: '',
  linkedin: '',
  pinterest: '',
  whatsapp: '',
  enableSocialSharing: true,
  socialSharingPlatforms: ['facebook', 'twitter', 'whatsapp'],
  socialShareTemplate: '',
  socialShareIncludeImage: true,
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  // Admin notifications
  adminNewOrder: true,
  adminOrderCancelled: true,
  adminLowStock: true,
  adminOutOfStock: true,
  adminNewCustomer: false,
  adminFailedPayment: true,
  adminRefund: true,
  adminNewReview: false,

  // Customer notifications
  customerOrderConfirmation: true,
  customerOrderShipped: true,
  customerOrderDelivered: true,
  customerOrderCancelled: true,
  customerRefund: true,

  // Reports
  dailyReport: false,
  dailyReportTime: '08:00',
  dailyReportRecipients: [],
  weeklyReport: true,
  weeklyReportDay: 1,
  weeklyReportRecipients: [],
  monthlyReport: true,
  monthlyReportRecipients: [],

  // Browser
  enableBrowserNotifications: true,
  orderNotificationSound: true,
  notificationSoundFile: 'default',
};

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  cashOnDelivery: true,
  codInstructions: '',
  bankTransfer: true,
  bankTransferInstructions: '',
  bkash: false,
  bkashMerchantNumber: '',
  nagad: false,
  nagadMerchantNumber: '',
  cardPayment: false,
};

export const DEFAULT_PAYMENT_GATEWAYS: PaymentGateways = {
  sslcommerz: {
    enabled: false,
    storeId: '',
    storePassword: '',
    sandbox: true,
  },
  stripe: {
    enabled: false,
    publishableKey: '',
    secretKey: '',
  },
  paypal: {
    enabled: false,
    clientId: '',
    clientSecret: '',
    sandbox: true,
  },
};

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  sessionTimeout: 60,
  rememberMeDuration: 7,
  loginNotifications: true,
  blockAfterFailures: 5,
  require2FA: false,
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  compactMode: false,
  defaultDashboard: 'overview',
  sidebarCollapsed: false,
  itemsPerPage: 25,
};
