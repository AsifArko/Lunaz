// Core Settings Types

export interface StoreSettings {
  // Store Information
  storeName: string;
  storeDescription: string;
  storeEmail: string;
  supportEmail: string;
  phone: string;
  logoUrl: string;
  faviconUrl: string;

  // Regional Settings
  currency: string;
  currencyPosition: 'before' | 'after';
  decimalSeparator: string;
  thousandsSeparator: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  defaultLanguage: string;
  weightUnit: 'kg' | 'lb' | 'g' | 'oz';
  dimensionUnit: 'cm' | 'in' | 'm' | 'ft';

  // Features
  enableReviews: boolean;
  enableWishlist: boolean;
  enableQuickView: boolean;
  enableCompare: boolean;
  allowGuestCheckout: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;

  // SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  googleAnalyticsId: string;
  facebookPixelId: string;
  googleTagManagerId: string;

  // Shipping
  freeShippingThreshold: number;
  standardShippingRate: number;
  expressShippingRate: number;
  sameDayShippingRate: number;
  shippingCalculation: 'flat' | 'weight' | 'price' | 'items';

  // Tax
  enableTax: boolean;
  taxRate: number;
  taxIncludedInPrices: boolean;
  displayTaxInCart: boolean;
  taxLabel: string;
  showTaxNumber: boolean;

  // Orders
  orderPrefix: string;
  orderNumberStart: number;
  autoConfirmOrders: boolean;
  lowStockThreshold: number;
  outOfStockDisplay: 'hide' | 'show';
  allowBackorder: boolean;
  minimumOrderAmount: number;
  maximumOrderItems: number;
}

export interface BusinessInfo {
  businessName: string;
  tradingName: string;
  businessType: string;
  registrationDate: string;
  industry: string;

  // Address
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessPostalCode: string;
  businessCountry: string;
  businessLat?: number;
  businessLng?: number;

  // Tax Information
  vatNumber: string;
  binNumber: string;
  tinNumber: string;
  registrationNumber: string;
  taxCertificateUrl: string;

  // Banking
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
  bankSwiftCode: string;
  acceptedPaymentMethods: string[];
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  tiktok: string;
  linkedin: string;
  pinterest: string;
  whatsapp: string;
}

export interface SocialSettings extends SocialLinks {
  enableSocialSharing: boolean;
  socialSharingPlatforms: string[];
  socialShareTemplate: string;
  socialShareIncludeImage: boolean;
}

export interface NotificationSettings {
  // Admin notifications
  adminNewOrder: boolean;
  adminOrderCancelled: boolean;
  adminLowStock: boolean;
  adminOutOfStock: boolean;
  adminNewCustomer: boolean;
  adminFailedPayment: boolean;
  adminRefund: boolean;
  adminNewReview: boolean;

  // Customer notifications
  customerOrderConfirmation: boolean;
  customerOrderShipped: boolean;
  customerOrderDelivered: boolean;
  customerOrderCancelled: boolean;
  customerRefund: boolean;

  // Reports
  dailyReport: boolean;
  dailyReportTime: string;
  dailyReportRecipients: string[];
  weeklyReport: boolean;
  weeklyReportDay: number;
  weeklyReportRecipients: string[];
  monthlyReport: boolean;
  monthlyReportRecipients: string[];

  // Browser
  enableBrowserNotifications: boolean;
  orderNotificationSound: boolean;
  notificationSoundFile: string;
}

export interface PaymentSettings {
  cashOnDelivery: boolean;
  codInstructions: string;
  bankTransfer: boolean;
  bankTransferInstructions: string;
  bkash: boolean;
  bkashMerchantNumber: string;
  nagad: boolean;
  nagadMerchantNumber: string;
  cardPayment: boolean;
}

export interface PaymentGatewaySSLCommerz {
  enabled: boolean;
  storeId: string;
  storePassword: string;
  sandbox: boolean;
}

export interface PaymentGatewayStripe {
  enabled: boolean;
  publishableKey: string;
  secretKey: string;
}

export interface PaymentGatewayPayPal {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  sandbox: boolean;
}

export interface PaymentGateways {
  sslcommerz: PaymentGatewaySSLCommerz;
  stripe: PaymentGatewayStripe;
  paypal: PaymentGatewayPayPal;
}

export interface SecuritySettings {
  sessionTimeout: number;
  rememberMeDuration: number;
  loginNotifications: boolean;
  blockAfterFailures: number;
  require2FA: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  defaultDashboard: string;
  sidebarCollapsed: boolean;
  itemsPerPage: number;
}

// Combined Settings
export interface AllSettings {
  store: StoreSettings;
  business: BusinessInfo;
  social: SocialSettings;
  notifications: NotificationSettings;
  payments: PaymentSettings;
  gateways: PaymentGateways;
  security: SecuritySettings;
}
