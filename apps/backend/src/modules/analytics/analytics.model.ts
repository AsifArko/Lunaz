import mongoose from 'mongoose';
import { AnalyticsEventType, ReferrerType, DeviceType, LogLevel } from '@lunaz/types';

/* -------------------------------------------------------------------------- */
/*                              Traffic Logs                                  */
/* -------------------------------------------------------------------------- */

const pageDataSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    path: { type: String, required: true },
    route: String,
    title: String,
    hostname: { type: String, required: true },
    search: String,
    hash: String,
  },
  { _id: false }
);

const referrerDataSchema = new mongoose.Schema(
  {
    url: String,
    domain: String,
    type: { type: String, enum: Object.values(ReferrerType), required: true },
    searchEngine: String,
    socialNetwork: String,
  },
  { _id: false }
);

const utmDataSchema = new mongoose.Schema(
  {
    source: String,
    medium: String,
    campaign: String,
    term: String,
    content: String,
  },
  { _id: false }
);

const geoDataSchema = new mongoose.Schema(
  {
    country: String,
    countryName: String,
    region: String,
    regionName: String,
    city: String,
    timezone: String,
    latitude: Number,
    longitude: Number,
  },
  { _id: false }
);

const deviceDataSchema = new mongoose.Schema(
  {
    type: { type: String, enum: Object.values(DeviceType), required: true },
    browser: String,
    browserVersion: String,
    os: String,
    osVersion: String,
    engine: String,
    screenWidth: Number,
    screenHeight: Number,
    viewportWidth: Number,
    viewportHeight: Number,
    touchEnabled: Boolean,
    language: String,
    userAgent: String,
  },
  { _id: false }
);

const customEventDataSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    properties: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const trafficLogSchema = new mongoose.Schema(
  {
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', sparse: true },
    timestamp: { type: Date, required: true, index: true },
    type: { type: String, enum: Object.values(AnalyticsEventType), required: true, index: true },
    page: { type: pageDataSchema, required: true },
    referrer: referrerDataSchema,
    utm: utmDataSchema,
    geo: geoDataSchema,
    device: deviceDataSchema,
    event: customEventDataSchema,
    ip: String,
  },
  { timestamps: true }
);

// Compound indexes for common queries
trafficLogSchema.index({ 'page.path': 1, timestamp: -1 });
trafficLogSchema.index({ 'geo.country': 1 });
trafficLogSchema.index({ 'device.type': 1 });
trafficLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 }); // 1 year TTL

export const TrafficLogModel = mongoose.model('TrafficLog', trafficLogSchema);

/* -------------------------------------------------------------------------- */
/*                              Performance Metrics                           */
/* -------------------------------------------------------------------------- */

const performanceMetricsSchema = new mongoose.Schema(
  {
    // Core Web Vitals
    lcp: Number,
    fid: Number,
    cls: Number,
    inp: Number,
    // Navigation Timing
    ttfb: Number,
    fcp: Number,
    domContentLoaded: Number,
    loadComplete: Number,
    // Resource Timing
    resourceCount: Number,
    totalResourceSize: Number,
    cachedResources: Number,
    // Custom marks
    customMarks: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const connectionDataSchema = new mongoose.Schema(
  {
    effectiveType: String,
    downlink: Number,
    rtt: Number,
    saveData: Boolean,
  },
  { _id: false }
);

const performanceLogSchema = new mongoose.Schema(
  {
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true },
    timestamp: { type: Date, required: true, index: true },
    page: { type: pageDataSchema, required: true },
    metrics: { type: performanceMetricsSchema, required: true },
    connection: connectionDataSchema,
    device: deviceDataSchema,
  },
  { timestamps: true }
);

performanceLogSchema.index({ 'page.path': 1, timestamp: -1 });
performanceLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 }); // 1 year TTL

export const PerformanceLogModel = mongoose.model('PerformanceLog', performanceLogSchema);

/* -------------------------------------------------------------------------- */
/*                              Product Analytics                             */
/* -------------------------------------------------------------------------- */

const productAnalyticsSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    date: { type: Date, required: true },
    views: { type: Number, default: 0 },
    uniqueViewers: { type: Number, default: 0 },
    addToCart: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    avgViewDuration: { type: Number, default: 0 },
    searchAppearances: { type: Number, default: 0 },
    searchClicks: { type: Number, default: 0 },
    categoryViews: { type: Number, default: 0 },
    directViews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productAnalyticsSchema.index({ productId: 1, date: 1 }, { unique: true });
productAnalyticsSchema.index({ date: -1 });

export const ProductAnalyticsModel = mongoose.model('ProductAnalytics', productAnalyticsSchema);

/* -------------------------------------------------------------------------- */
/*                              Server Logs                                   */
/* -------------------------------------------------------------------------- */

const requestDetailsSchema = new mongoose.Schema(
  {
    headers: mongoose.Schema.Types.Mixed,
    query: mongoose.Schema.Types.Mixed,
    body: mongoose.Schema.Types.Mixed,
    contentType: String,
    contentLength: Number,
    cookies: [String],
    authorization: String,
  },
  { _id: false }
);

const responseDetailsSchema = new mongoose.Schema(
  {
    headers: mongoose.Schema.Types.Mixed,
    contentType: String,
    contentLength: Number,
    cached: Boolean,
    compressed: Boolean,
  },
  { _id: false }
);

const clientDetailsSchema = new mongoose.Schema(
  {
    ip: String,
    country: String,
    region: String,
    userAgent: String,
    device: String,
    os: String,
    browser: String,
  },
  { _id: false }
);

const serverDetailsSchema = new mongoose.Schema(
  {
    host: String,
    environment: String,
    version: String,
    nodeVersion: String,
    pid: Number,
    memory: {
      heapUsed: Number,
      heapTotal: Number,
      rss: Number,
    },
  },
  { _id: false }
);

const errorDetailsSchema = new mongoose.Schema(
  {
    name: String,
    message: String,
    stack: String,
    code: String,
  },
  { _id: false }
);

const serverLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true, index: true },
    requestId: { type: String, required: true, unique: true },
    method: { type: String, required: true },
    path: { type: String, required: true, index: true },
    route: String,
    statusCode: { type: Number, required: true, index: true },
    statusText: String,
    duration: { type: Number, required: true },
    request: requestDetailsSchema,
    response: responseDetailsSchema,
    client: clientDetailsSchema,
    server: serverDetailsSchema,
    error: errorDetailsSchema,
    level: { type: String, enum: Object.values(LogLevel), required: true, index: true },
    message: String,
    tags: [String],
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

// Compound indexes for common queries
serverLogSchema.index({ level: 1, timestamp: -1 });
serverLogSchema.index({ 'client.ip': 1, timestamp: -1 });
serverLogSchema.index({ 'client.country': 1 });
serverLogSchema.index({ route: 1, method: 1 });
serverLogSchema.index({ 'error.name': 1 }, { sparse: true });
serverLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // 30 days TTL

export const ServerLogModel = mongoose.model('ServerLog', serverLogSchema);

/* -------------------------------------------------------------------------- */
/*                              Sessions (for aggregation)                    */
/* -------------------------------------------------------------------------- */

const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    visitorId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', sparse: true },
    startedAt: { type: Date, required: true },
    endedAt: Date,
    duration: Number,
    pageViews: { type: Number, default: 0 },
    events: { type: Number, default: 0 },
    entryPage: String,
    exitPage: String,
    referrer: referrerDataSchema,
    utm: utmDataSchema,
    geo: geoDataSchema,
    device: deviceDataSchema,
    isBounce: { type: Boolean, default: true },
  },
  { timestamps: true }
);

sessionSchema.index({ startedAt: -1 });
sessionSchema.index({ 'geo.country': 1 });
sessionSchema.index({ 'device.type': 1 });
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 }); // 1 year TTL

export const SessionModel = mongoose.model('Session', sessionSchema);

/* -------------------------------------------------------------------------- */
/*                              Daily Aggregates (for dashboard)              */
/* -------------------------------------------------------------------------- */

const dailyAnalyticsSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, unique: true },
    visitors: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 },
    sessions: { type: Number, default: 0 },
    bounces: { type: Number, default: 0 },
    totalSessionDuration: { type: Number, default: 0 },
    newVisitors: { type: Number, default: 0 },
    returningVisitors: { type: Number, default: 0 },
  },
  { timestamps: true }
);

dailyAnalyticsSchema.index({ date: -1 });

export const DailyAnalyticsModel = mongoose.model('DailyAnalytics', dailyAnalyticsSchema);
