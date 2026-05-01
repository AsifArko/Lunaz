/**
 * Analytics constants for Lunaz - Web Analytics, Traffic Logs, Speed Insights, Server Logs
 */

export const AnalyticsEventType = {
  PAGEVIEW: 'pageview',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  CLICK: 'click',
  SCROLL: 'scroll',
  PRODUCT_VIEW: 'product_view',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  CHECKOUT_START: 'checkout_start',
  PURCHASE: 'purchase',
  SEARCH: 'search',
  ERROR: 'error',
  CUSTOM: 'custom',
} as const;
export type AnalyticsEventType = (typeof AnalyticsEventType)[keyof typeof AnalyticsEventType];

export const ReferrerType = {
  DIRECT: 'direct',
  SEARCH: 'search',
  SOCIAL: 'social',
  REFERRAL: 'referral',
  EMAIL: 'email',
  PAID: 'paid',
} as const;
export type ReferrerType = (typeof ReferrerType)[keyof typeof ReferrerType];

export const DeviceType = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
  TABLET: 'tablet',
  BOT: 'bot',
} as const;
export type DeviceType = (typeof DeviceType)[keyof typeof DeviceType];

export const LogLevel = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal',
} as const;
export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];
