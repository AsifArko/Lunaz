import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*                              Collection Validation                         */
/* -------------------------------------------------------------------------- */

// Event types as literal array for Zod
const analyticsEventTypes = [
  'pageview',
  'session_start',
  'session_end',
  'click',
  'scroll',
  'product_view',
  'add_to_cart',
  'remove_from_cart',
  'checkout_start',
  'purchase',
  'search',
  'error',
  'custom',
] as const;

// Device types
const deviceTypes = ['desktop', 'mobile', 'tablet', 'bot'] as const;

// Log levels
const logLevels = ['info', 'warn', 'error', 'fatal'] as const;

const pageDataSchema = z.object({
  url: z.string(),
  path: z.string().min(1),
  route: z.string().optional(),
  title: z.string().optional(),
  hostname: z.string().min(1),
  search: z.string().optional(),
  hash: z.string().optional(),
});

const referrerSchema = z.object({
  url: z.string().optional(),
}).optional();

const utmSchema = z.object({
  source: z.string().optional(),
  medium: z.string().optional(),
  campaign: z.string().optional(),
  term: z.string().optional(),
  content: z.string().optional(),
}).optional();

const customEventSchema = z.object({
  name: z.string().min(1).max(100),
  properties: z.record(z.unknown()).optional(),
}).optional();

const deviceSchema = z.object({
  type: z.enum(deviceTypes).optional(),
  screenWidth: z.number().optional(),
  screenHeight: z.number().optional(),
  viewportWidth: z.number().optional(),
  viewportHeight: z.number().optional(),
  touchEnabled: z.boolean().optional(),
  language: z.string().optional(),
}).optional();

const eventSchema = z.object({
  type: z.enum(analyticsEventTypes),
  timestamp: z.string(),
  page: pageDataSchema,
  referrer: referrerSchema,
  utm: utmSchema,
  event: customEventSchema,
  device: deviceSchema,
});

export const collectEventsSchema = z.object({
  visitorId: z.string().min(1).max(100),
  sessionId: z.string().min(1).max(100),
  events: z.array(eventSchema).min(1).max(50),
});

export const collectPerformanceSchema = z.object({
  visitorId: z.string().min(1).max(100),
  sessionId: z.string().min(1).max(100),
  page: pageDataSchema,
  metrics: z.object({
    lcp: z.number().optional(),
    fid: z.number().optional(),
    cls: z.number().optional(),
    inp: z.number().optional(),
    ttfb: z.number().optional(),
    fcp: z.number().optional(),
    domContentLoaded: z.number().optional(),
    loadComplete: z.number().optional(),
    resourceCount: z.number().optional(),
    totalResourceSize: z.number().optional(),
    cachedResources: z.number().optional(),
    customMarks: z.record(z.number()).optional(),
  }),
  connection: z.object({
    effectiveType: z.string().optional(),
    downlink: z.number().optional(),
    rtt: z.number().optional(),
    saveData: z.boolean().optional(),
  }).optional(),
  device: deviceSchema,
});

/* -------------------------------------------------------------------------- */
/*                              Query Validation                              */
/* -------------------------------------------------------------------------- */

export const analyticsQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  period: z.enum(['hour', 'day', 'week', 'month']).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

export const serverLogsQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  level: z.enum(logLevels).optional(),
  status: z.string().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']).optional(),
  path: z.string().optional(),
  country: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type CollectEventsInput = z.infer<typeof collectEventsSchema>;
export type CollectPerformanceInput = z.infer<typeof collectPerformanceSchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type ServerLogsQuery = z.infer<typeof serverLogsQuerySchema>;
