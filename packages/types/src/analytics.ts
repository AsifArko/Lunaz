/**
 * Analytics types for Lunaz - Web Analytics, Traffic Logs, Speed Insights, Server Logs
 */

import type { Id } from './user.js';

/* -------------------------------------------------------------------------- */
/*                              Enums                                         */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                              Traffic Log Types                             */
/* -------------------------------------------------------------------------- */

export interface PageData {
  url: string;
  path: string;
  route?: string;
  title?: string;
  hostname: string;
  search?: string;
  hash?: string;
}

export interface ReferrerData {
  url?: string;
  domain?: string;
  type: ReferrerType;
  searchEngine?: string;
  socialNetwork?: string;
}

export interface UTMData {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface GeoData {
  country?: string;
  countryName?: string;
  region?: string;
  regionName?: string;
  city?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

export interface DeviceData {
  type: DeviceType;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  engine?: string;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  touchEnabled?: boolean;
  language?: string;
  userAgent?: string;
}

export interface CustomEventData {
  name: string;
  properties?: Record<string, unknown>;
}

export interface TrafficLog {
  id: Id;
  visitorId: string;
  sessionId: string;
  userId?: Id;
  timestamp: string;
  type: AnalyticsEventType;
  page: PageData;
  referrer?: ReferrerData;
  utm?: UTMData;
  geo?: GeoData;
  device?: DeviceData;
  event?: CustomEventData;
  ip?: string;
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/*                              Performance Types                             */
/* -------------------------------------------------------------------------- */

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number;
  fid?: number;
  cls?: number;
  inp?: number;
  // Navigation Timing
  ttfb?: number;
  fcp?: number;
  domContentLoaded?: number;
  loadComplete?: number;
  // Resource Timing
  resourceCount?: number;
  totalResourceSize?: number;
  cachedResources?: number;
  // Custom marks
  customMarks?: Record<string, number>;
}

export interface ConnectionData {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export interface PerformanceLog {
  id: Id;
  visitorId: string;
  sessionId: string;
  timestamp: string;
  page: PageData;
  metrics: PerformanceMetrics;
  connection?: ConnectionData;
  device?: Partial<DeviceData>;
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/*                              Product Analytics                             */
/* -------------------------------------------------------------------------- */

export interface ProductAnalytics {
  id: Id;
  productId: Id;
  date: string;
  views: number;
  uniqueViewers: number;
  addToCart: number;
  purchases: number;
  revenue: number;
  avgViewDuration: number;
  searchAppearances: number;
  searchClicks: number;
  categoryViews: number;
  directViews: number;
}

/* -------------------------------------------------------------------------- */
/*                              Server Log Types                              */
/* -------------------------------------------------------------------------- */

export interface RequestDetails {
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
  contentType?: string;
  contentLength?: number;
  cookies?: string[];
  authorization?: string;
}

export interface ResponseDetails {
  headers?: Record<string, string>;
  contentType?: string;
  contentLength?: number;
  cached?: boolean;
  compressed?: boolean;
}

export interface ClientDetails {
  ip?: string;
  country?: string;
  region?: string;
  userAgent?: string;
  device?: string;
  os?: string;
  browser?: string;
}

export interface ServerDetails {
  host?: string;
  environment?: string;
  version?: string;
  nodeVersion?: string;
  pid?: number;
  memory?: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
}

export interface ErrorDetails {
  name?: string;
  message?: string;
  stack?: string;
  code?: string;
}

export interface ServerLog {
  id: Id;
  timestamp: string;
  requestId: string;
  method: string;
  path: string;
  route?: string;
  statusCode: number;
  statusText?: string;
  duration: number;
  request?: RequestDetails;
  response?: ResponseDetails;
  client?: ClientDetails;
  server?: ServerDetails;
  error?: ErrorDetails;
  level: LogLevel;
  message?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/*                              API Request/Response                          */
/* -------------------------------------------------------------------------- */

// Collection endpoints (from client)
export interface AnalyticsCollectPayload {
  visitorId: string;
  sessionId: string;
  events: Array<{
    type: AnalyticsEventType;
    timestamp: string;
    page: PageData;
    referrer?: ReferrerData;
    utm?: UTMData;
    event?: CustomEventData;
    device?: Partial<DeviceData>;
  }>;
}

export interface PerformanceCollectPayload {
  visitorId: string;
  sessionId: string;
  page: PageData;
  metrics: PerformanceMetrics;
  connection?: ConnectionData;
  device?: Partial<DeviceData>;
}

// Dashboard response types
export interface AnalyticsOverview {
  visitors: number;
  uniqueVisitors: number;
  pageViews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  pagesPerSession: number;
  // Comparison to previous period
  visitorsChange?: number;
  pageViewsChange?: number;
  bounceRateChange?: number;
  avgSessionDurationChange?: number;
}

export interface AnalyticsTimeSeries {
  date: string;
  visitors: number;
  pageViews: number;
  sessions: number;
}

export interface TopPage {
  path: string;
  title?: string;
  views: number;
  uniqueVisitors: number;
  avgDuration?: number;
  bounceRate?: number;
}

export interface TopReferrer {
  domain: string;
  type: ReferrerType;
  visitors: number;
  icon?: string;
}

export interface CountryStats {
  country: string;
  countryName: string;
  visitors: number;
  percentage: number;
}

export interface DeviceStats {
  type: DeviceType;
  count: number;
  percentage: number;
}

export interface BrowserStats {
  browser: string;
  count: number;
  percentage: number;
}

export interface OSStats {
  os: string;
  count: number;
  percentage: number;
}

export interface RealTimeData {
  activeVisitors: number;
  activePages: Array<{
    path: string;
    visitors: number;
  }>;
  recentEvents: Array<{
    type: AnalyticsEventType;
    timestamp: string;
    page?: string;
    data?: Record<string, unknown>;
  }>;
}

// Speed insights response
export interface SpeedInsightsOverview {
  lcp: { value: number; rating: 'good' | 'needs-improvement' | 'poor'; p75: number };
  fid: { value: number; rating: 'good' | 'needs-improvement' | 'poor'; p75: number };
  cls: { value: number; rating: 'good' | 'needs-improvement' | 'poor'; p75: number };
  inp?: { value: number; rating: 'good' | 'needs-improvement' | 'poor'; p75: number };
  ttfb: { value: number; p75: number };
  samples: number;
}

export interface PagePerformance {
  path: string;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  samples: number;
}

// Funnel analytics
export interface FunnelStage {
  name: string;
  visitors: number;
  dropoff: number;
  conversionRate: number;
  avgTimeToNext?: number;
}

export interface ConversionFunnel {
  date: string;
  period: 'daily' | 'weekly' | 'monthly';
  stages: FunnelStage[];
  overallConversion: number;
}

// Server logs response
export interface ServerLogsQuery {
  from?: string;
  to?: string;
  level?: LogLevel;
  status?: string;
  method?: string;
  path?: string;
  country?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ServerLogStats {
  totalRequests: number;
  errorCount: number;
  warnCount: number;
  avgResponseTime: number;
  statusCodes: Record<string, number>;
  topPaths: Array<{ path: string; count: number }>;
  topErrors: Array<{ message: string; count: number }>;
}
