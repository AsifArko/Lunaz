# Lunaz — Analytics, Logging & Insights Specification

**Version:** 1.0  
**Scope:** Self-hosted analytics, traffic logging, speed insights, user behavior tracking, and server logging for the Lunaz e-commerce platform.

---

## 1. Overview

This specification outlines a complete, self-hosted analytics and logging system for Lunaz. All features are built in-house without dependency on paid third-party analytics services (no Google Analytics, Mixpanel, Vercel Analytics, etc.).

### 1.1 Goals

- **Zero external dependencies** — All analytics data collected and stored in our MongoDB database
- **Privacy-first** — No personal data sold or shared; IP addresses can be anonymized
- **Real-time insights** — Live dashboards for traffic, behavior, and server health
- **Actionable data** — Product engagement, conversion funnels, and user journey analysis

### 1.2 Components

| Component          | Description                                                          |
| ------------------ | -------------------------------------------------------------------- |
| **Web Analytics**  | Visitors, page views, bounce rate, sessions, referrers, geo, devices |
| **Traffic Logs**   | Detailed traffic log table with IP, device, country, events          |
| **Speed Insights** | Page load times, Core Web Vitals, performance metrics                |
| **User Behavior**  | Product interactions, cart analytics, conversion tracking            |
| **Server Logs**    | Request/response logging, errors, warnings, status codes             |

---

## 2. Web Analytics

### 2.1 Metrics Collected

#### 2.1.1 Visitor Metrics

| Metric              | Description               | Calculation                          |
| ------------------- | ------------------------- | ------------------------------------ |
| `visitors`          | Unique visitors           | Count distinct `visitorId` cookies   |
| `uniqueVisitors`    | Unique visitors by period | Distinct visitors per day/week/month |
| `newVisitors`       | First-time visitors       | Visitors with no prior session       |
| `returningVisitors` | Repeat visitors           | Visitors with prior sessions         |

#### 2.1.2 Engagement Metrics

| Metric               | Description            | Calculation                                      |
| -------------------- | ---------------------- | ------------------------------------------------ |
| `pageViews`          | Total page loads       | Count all page view events                       |
| `sessions`           | Visit sessions         | Group by visitorId + 30min inactivity gap        |
| `bounceRate`         | Single-page sessions   | Sessions with 1 page view / total sessions × 100 |
| `avgSessionDuration` | Time spent per session | Sum of session durations / session count         |
| `pagesPerSession`    | Pages viewed per visit | Total page views / total sessions                |

#### 2.1.3 Traffic Sources

| Metric          | Description                           |
| --------------- | ------------------------------------- |
| `referrers`     | Source URLs/domains that sent traffic |
| `utmSource`     | UTM source parameter                  |
| `utmMedium`     | UTM medium parameter                  |
| `utmCampaign`   | UTM campaign parameter                |
| `directTraffic` | No referrer (typed URL or bookmark)   |
| `organicSearch` | Traffic from search engines           |

#### 2.1.4 Content Analytics

| Metric       | Description                              |
| ------------ | ---------------------------------------- |
| `pages`      | Page paths with view counts              |
| `routes`     | Route patterns (e.g., `/products/:slug`) |
| `hostnames`  | Domains serving the site                 |
| `entryPages` | First page of sessions                   |
| `exitPages`  | Last page of sessions                    |

#### 2.1.5 Geographic Data

| Metric      | Description                           |
| ----------- | ------------------------------------- |
| `countries` | Visitor country (from IP geolocation) |
| `regions`   | State/province                        |
| `cities`    | City (optional, less accurate)        |
| `languages` | Browser language preference           |

#### 2.1.6 Technology Data

| Metric              | Description                          |
| ------------------- | ------------------------------------ |
| `devices`           | Device type: Desktop, Mobile, Tablet |
| `browsers`          | Browser name and version             |
| `operatingSystems`  | OS name and version                  |
| `screenResolutions` | Viewport dimensions                  |

### 2.2 Data Collection Architecture

#### 2.2.1 Client-Side Tracking Script

A lightweight JavaScript tracker embedded in Web app:

```
┌─────────────────────────────────────────────────────────────┐
│                    Web App (Browser)                         │
├─────────────────────────────────────────────────────────────┤
│  lunaz-analytics.js (~3KB gzipped)                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • Auto page view tracking                            │   │
│  │ • Session management (cookie-based)                  │   │
│  │ • Event tracking API                                 │   │
│  │ • Performance metrics collection                     │   │
│  │ • Batched beacon requests                            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API                               │
├─────────────────────────────────────────────────────────────┤
│  POST /api/v1/analytics/collect                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • Validate and sanitize payload                      │   │
│  │ • Parse User-Agent → device, browser, OS             │   │
│  │ • GeoIP lookup → country, region                     │   │
│  │ • Enrich with server-side data                       │   │
│  │ • Write to MongoDB (buffered/batched)                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### 2.2.2 Tracker Features

```typescript
// Client-side tracker interface
interface LunazAnalytics {
  // Automatic tracking (enabled by default)
  trackPageView(): void;

  // Manual event tracking
  trackEvent(name: string, properties?: Record<string, any>): void;

  // E-commerce specific
  trackProductView(productId: string, productName: string): void;
  trackAddToCart(productId: string, quantity: number, price: number): void;
  trackRemoveFromCart(productId: string): void;
  trackCheckoutStart(cartValue: number): void;
  trackPurchase(orderId: string, total: number, items: number): void;

  // User identification (optional, for logged-in users)
  identify(userId: string): void;

  // Configuration
  configure(options: AnalyticsConfig): void;
}

interface AnalyticsConfig {
  siteId: string; // Unique site identifier
  apiEndpoint: string; // Backend analytics endpoint
  trackPageViews: boolean; // Auto page view tracking (default: true)
  trackClicks: boolean; // Click tracking (default: false)
  trackScrollDepth: boolean; // Scroll depth tracking (default: false)
  respectDoNotTrack: boolean; // Honor DNT header (default: true)
  sessionTimeout: number; // Session timeout in minutes (default: 30)
  batchSize: number; // Events to batch before sending (default: 10)
  batchInterval: number; // Max time between batches in ms (default: 5000)
}
```

### 2.3 Privacy Considerations

- **Cookie consent** — Tracker respects user consent; no tracking before consent
- **IP anonymization** — Option to hash or truncate IP addresses
- **Do Not Track** — Honor browser DNT setting if enabled
- **Data retention** — Configurable retention period (default: 365 days)
- **No fingerprinting** — No canvas fingerprinting or invasive tracking

---

## 3. Traffic Log Collection (MongoDB)

### 3.1 Collection: `trafficLogs`

Stores detailed traffic events for analysis.

| Field         | Type     | Description                                |
| ------------- | -------- | ------------------------------------------ |
| `_id`         | ObjectId | Unique identifier                          |
| `visitorId`   | string   | Persistent visitor cookie ID               |
| `sessionId`   | string   | Session identifier                         |
| `userId`      | ObjectId | Logged-in user ID (optional)               |
| `timestamp`   | Date     | Event timestamp                            |
| `type`        | enum     | Event type (see 3.2)                       |
| `page`        | object   | Page information (see below)               |
| `referrer`    | object   | Referrer information (see below)           |
| `utm`         | object   | UTM parameters (see below)                 |
| `geo`         | object   | Geographic data (see below)                |
| `device`      | object   | Device information (see below)             |
| `performance` | object   | Performance metrics (see below)            |
| `event`       | object   | Custom event data (see below)              |
| `ip`          | string   | IP address (hashed or raw based on config) |
| `createdAt`   | Date     | Record creation time                       |

#### 3.1.1 Embedded Objects

**Page Object:**

```typescript
interface PageData {
  url: string; // Full URL
  path: string; // URL path only
  route: string; // Route pattern (e.g., /products/:slug)
  title: string; // Page title
  hostname: string; // Domain
  search: string; // Query string
  hash: string; // URL hash
}
```

**Referrer Object:**

```typescript
interface ReferrerData {
  url: string; // Full referrer URL
  domain: string; // Referrer domain
  type: 'direct' | 'search' | 'social' | 'referral' | 'email' | 'paid';
  searchEngine?: string; // If type=search: google, bing, etc.
  socialNetwork?: string; // If type=social: facebook, twitter, etc.
}
```

**UTM Object:**

```typescript
interface UTMData {
  source: string; // utm_source
  medium: string; // utm_medium
  campaign: string; // utm_campaign
  term: string; // utm_term
  content: string; // utm_content
}
```

**Geographic Object:**

```typescript
interface GeoData {
  country: string; // ISO country code (e.g., US)
  countryName: string; // Country name (e.g., United States)
  region: string; // State/province code
  regionName: string; // State/province name
  city: string; // City name (optional)
  timezone: string; // IANA timezone
  latitude: number; // Approximate latitude
  longitude: number; // Approximate longitude
}
```

**Device Object:**

```typescript
interface DeviceData {
  type: 'desktop' | 'mobile' | 'tablet' | 'bot';
  browser: string; // Browser name
  browserVersion: string; // Browser version
  os: string; // Operating system
  osVersion: string; // OS version
  engine: string; // Rendering engine
  screenWidth: number; // Screen width
  screenHeight: number; // Screen height
  viewportWidth: number; // Viewport width
  viewportHeight: number; // Viewport height
  touchEnabled: boolean; // Touch support
  language: string; // Browser language
  userAgent: string; // Raw user agent (optional)
}
```

### 3.2 Event Types

| Type               | Description            | Trigger                  |
| ------------------ | ---------------------- | ------------------------ |
| `pageview`         | Page load              | Automatic on navigation  |
| `session_start`    | New session began      | First event of session   |
| `session_end`      | Session ended          | On close or timeout      |
| `click`            | Link/button click      | Optional click tracking  |
| `scroll`           | Scroll depth milestone | Optional scroll tracking |
| `product_view`     | Product page viewed    | Product detail page      |
| `add_to_cart`      | Item added to cart     | Add to cart action       |
| `remove_from_cart` | Item removed from cart | Remove from cart action  |
| `checkout_start`   | Checkout initiated     | Checkout page load       |
| `purchase`         | Order completed        | Order confirmation       |
| `search`           | Search performed       | Search submission        |
| `error`            | JavaScript error       | Error handler            |
| `custom`           | Custom event           | Manual tracking call     |

### 3.3 Indexes

```javascript
// trafficLogs collection indexes
db.trafficLogs.createIndex({ timestamp: -1 });
db.trafficLogs.createIndex({ visitorId: 1, timestamp: -1 });
db.trafficLogs.createIndex({ sessionId: 1 });
db.trafficLogs.createIndex({ userId: 1 }, { sparse: true });
db.trafficLogs.createIndex({ type: 1, timestamp: -1 });
db.trafficLogs.createIndex({ 'page.path': 1, timestamp: -1 });
db.trafficLogs.createIndex({ 'geo.country': 1 });
db.trafficLogs.createIndex({ 'device.type': 1 });
db.trafficLogs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // TTL: 1 year
```

---

## 4. Speed Insights & Performance

### 4.1 Metrics Collected

#### 4.1.1 Core Web Vitals

| Metric                              | Description                             | Target  |
| ----------------------------------- | --------------------------------------- | ------- |
| **LCP** (Largest Contentful Paint)  | Time to render largest content element  | < 2.5s  |
| **FID** (First Input Delay)         | Time from first interaction to response | < 100ms |
| **CLS** (Cumulative Layout Shift)   | Visual stability score                  | < 0.1   |
| **INP** (Interaction to Next Paint) | Overall responsiveness                  | < 200ms |

#### 4.1.2 Additional Performance Metrics

| Metric           | Description                              |
| ---------------- | ---------------------------------------- |
| `ttfb`           | Time to First Byte                       |
| `fcp`            | First Contentful Paint                   |
| `domLoad`        | DOM Content Loaded time                  |
| `windowLoad`     | Window Load time                         |
| `resourceCount`  | Number of resources loaded               |
| `resourceSize`   | Total resource size (bytes)              |
| `connectionType` | Network connection type                  |
| `effectiveType`  | Effective connection type (4g, 3g, etc.) |

### 4.2 Collection: `performanceMetrics`

| Field        | Type     | Description         |
| ------------ | -------- | ------------------- |
| `_id`        | ObjectId | Unique identifier   |
| `visitorId`  | string   | Visitor identifier  |
| `sessionId`  | string   | Session identifier  |
| `timestamp`  | Date     | Measurement time    |
| `page`       | object   | Page URL and route  |
| `metrics`    | object   | Performance metrics |
| `connection` | object   | Network info        |
| `device`     | object   | Device summary      |

**Metrics Object:**

```typescript
interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift (score)
  inp: number; // Interaction to Next Paint (ms)

  // Navigation Timing
  ttfb: number; // Time to First Byte (ms)
  fcp: number; // First Contentful Paint (ms)
  domContentLoaded: number; // DOMContentLoaded (ms)
  loadComplete: number; // Load complete (ms)

  // Resource Timing
  resourceCount: number;
  totalResourceSize: number;
  cachedResources: number;

  // Custom Timing Marks
  customMarks?: Record<string, number>;
}
```

### 4.3 Performance Dashboard Features

- **Page-by-page breakdown** — Performance metrics per route
- **Device comparison** — Desktop vs mobile performance
- **Trend analysis** — Performance over time
- **Percentiles** — P50, P75, P90, P95, P99 for each metric
- **Alerts** — Notification when metrics exceed thresholds

---

## 5. User Behavior Analytics

### 5.1 E-Commerce Specific Tracking

#### 5.1.1 Product Analytics

| Metric            | Description                        |
| ----------------- | ---------------------------------- |
| `productViews`    | Number of times product was viewed |
| `addToCartRate`   | Views → Add to cart conversion     |
| `purchaseRate`    | Add to cart → Purchase conversion  |
| `averageViewTime` | Time spent on product pages        |
| `productSearches` | Times product appeared in search   |
| `wishlistAdds`    | Times added to wishlist            |

#### 5.1.2 Collection: `productAnalytics`

Aggregated product engagement data.

| Field               | Type     | Description                     |
| ------------------- | -------- | ------------------------------- |
| `_id`               | ObjectId | Unique identifier               |
| `productId`         | ObjectId | Reference to product            |
| `date`              | Date     | Aggregation date                |
| `views`             | number   | View count                      |
| `uniqueViewers`     | number   | Unique visitor views            |
| `addToCart`         | number   | Add to cart count               |
| `purchases`         | number   | Purchase count                  |
| `revenue`           | number   | Revenue generated               |
| `avgViewDuration`   | number   | Average view duration (seconds) |
| `searchAppearances` | number   | Search result appearances       |
| `searchClicks`      | number   | Clicks from search              |
| `categoryViews`     | number   | Views from category page        |
| `directViews`       | number   | Direct URL visits               |

#### 5.1.3 Conversion Funnel

Track user journey through purchase funnel:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Homepage   │ ──▶ │   Product    │ ──▶ │  Add to Cart │ ──▶ │   Checkout   │ ──▶ │   Purchase   │
│              │     │     View     │     │              │     │              │     │              │
│   Visitors   │     │   Viewers    │     │   Cart Users │     │  Checkout    │     │  Customers   │
│     100%     │     │     60%      │     │     25%      │     │     15%      │     │     10%      │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
        │                   │                    │                    │                    │
        └───────────────────┴────────────────────┴────────────────────┴────────────────────┘
                                    Conversion Funnel Report
```

#### 5.1.4 Collection: `conversionFunnels`

| Field    | Type     | Description                  |
| -------- | -------- | ---------------------------- |
| `_id`    | ObjectId | Unique identifier            |
| `date`   | Date     | Aggregation date             |
| `period` | enum     | `daily`, `weekly`, `monthly` |
| `stages` | array    | Funnel stage data            |

**Stage Object:**

```typescript
interface FunnelStage {
  name: string; // Stage name
  visitors: number; // Visitors reaching stage
  dropoff: number; // Visitors who dropped
  conversionRate: number; // Conversion to next stage
  avgTimeToNext: number; // Time to reach next stage (seconds)
}
```

### 5.2 Session Replay Data (Optional)

Capture session interactions for debugging (without full video):

| Field       | Type   | Description        |
| ----------- | ------ | ------------------ |
| `sessionId` | string | Session identifier |
| `events`    | array  | Interaction events |
| `duration`  | number | Session duration   |
| `pages`     | array  | Pages visited      |
| `errors`    | array  | Errors encountered |

---

## 6. Server Logs

### 6.1 Collection: `serverLogs`

Comprehensive server-side request/response logging.

| Field        | Type     | Description                                 |
| ------------ | -------- | ------------------------------------------- |
| `_id`        | ObjectId | Unique identifier                           |
| `timestamp`  | Date     | Request timestamp                           |
| `requestId`  | string   | Unique request ID                           |
| `method`     | string   | HTTP method (GET, POST, etc.)               |
| `path`       | string   | Request path                                |
| `route`      | string   | Matched route pattern                       |
| `statusCode` | number   | HTTP status code                            |
| `statusText` | string   | Status description                          |
| `duration`   | number   | Response time (ms)                          |
| `request`    | object   | Request details (see below)                 |
| `response`   | object   | Response details (see below)                |
| `client`     | object   | Client information (see below)              |
| `server`     | object   | Server information (see below)              |
| `error`      | object   | Error details if applicable                 |
| `level`      | enum     | Log level: `info`, `warn`, `error`, `fatal` |
| `message`    | string   | Log message                                 |
| `tags`       | array    | Custom tags                                 |
| `metadata`   | object   | Additional metadata                         |

#### 6.1.1 Request Object

```typescript
interface RequestDetails {
  headers: Record<string, string>; // Request headers (sanitized)
  query: Record<string, string>; // Query parameters
  body: object; // Request body (sanitized, truncated)
  contentType: string; // Content-Type header
  contentLength: number; // Content-Length
  cookies: string[]; // Cookie names (not values)
  authorization: string; // Auth type (e.g., "Bearer", redacted)
}
```

#### 6.1.2 Response Object

```typescript
interface ResponseDetails {
  headers: Record<string, string>; // Response headers
  contentType: string; // Content-Type
  contentLength: number; // Response size
  cached: boolean; // Served from cache
  compressed: boolean; // Response compressed
}
```

#### 6.1.3 Client Object

```typescript
interface ClientDetails {
  ip: string; // Client IP (can be hashed)
  country: string; // Country code
  region: string; // Region
  userAgent: string; // User-Agent header
  device: string; // Device type
  os: string; // Operating system
  browser: string; // Browser
}
```

#### 6.1.4 Server Object

```typescript
interface ServerDetails {
  host: string; // Server hostname
  environment: string; // Environment (dev/staging/prod)
  version: string; // App version
  nodeVersion: string; // Node.js version
  pid: number; // Process ID
  memory: {
    // Memory usage
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
}
```

#### 6.1.5 Error Object

```typescript
interface ErrorDetails {
  name: string; // Error name/type
  message: string; // Error message
  stack: string; // Stack trace
  code: string; // Error code
  originalError?: object; // Original error if wrapped
}
```

### 6.2 Log Levels

| Level   | Description        | Use Case                                 |
| ------- | ------------------ | ---------------------------------------- |
| `info`  | Normal operation   | Successful requests, standard operations |
| `warn`  | Warning conditions | Rate limiting, deprecation, slow queries |
| `error` | Error conditions   | 4xx/5xx responses, caught exceptions     |
| `fatal` | Fatal errors       | Unhandled exceptions, service failures   |

### 6.3 Indexes

```javascript
// serverLogs collection indexes
db.serverLogs.createIndex({ timestamp: -1 });
db.serverLogs.createIndex({ level: 1, timestamp: -1 });
db.serverLogs.createIndex({ statusCode: 1, timestamp: -1 });
db.serverLogs.createIndex({ 'client.ip': 1, timestamp: -1 });
db.serverLogs.createIndex({ 'client.country': 1 });
db.serverLogs.createIndex({ path: 1, timestamp: -1 });
db.serverLogs.createIndex({ route: 1, method: 1 });
db.serverLogs.createIndex({ requestId: 1 }, { unique: true });
db.serverLogs.createIndex({ 'error.name': 1 }, { sparse: true });
db.serverLogs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // TTL: 30 days
```

---

## 7. Backend API Endpoints

### 7.1 Analytics Collection (Public - Web App)

| Method | Path                            | Description                        |
| ------ | ------------------------------- | ---------------------------------- |
| POST   | `/api/v1/analytics/collect`     | Collect analytics events (batched) |
| POST   | `/api/v1/analytics/performance` | Collect performance metrics        |
| POST   | `/api/v1/analytics/error`       | Report client-side errors          |

### 7.2 Analytics Dashboard (Admin Only)

| Method | Path                          | Description                 |
| ------ | ----------------------------- | --------------------------- |
| GET    | `/api/v1/analytics/overview`  | Dashboard overview metrics  |
| GET    | `/api/v1/analytics/visitors`  | Visitor statistics          |
| GET    | `/api/v1/analytics/pageviews` | Page view statistics        |
| GET    | `/api/v1/analytics/pages`     | Top pages report            |
| GET    | `/api/v1/analytics/referrers` | Traffic sources             |
| GET    | `/api/v1/analytics/countries` | Geographic breakdown        |
| GET    | `/api/v1/analytics/devices`   | Device/browser/OS breakdown |
| GET    | `/api/v1/analytics/realtime`  | Real-time visitor count     |
| GET    | `/api/v1/analytics/events`    | Custom events report        |

### 7.3 Speed Insights (Admin Only)

| Method | Path                                     | Description          |
| ------ | ---------------------------------------- | -------------------- |
| GET    | `/api/v1/analytics/performance/overview` | Performance summary  |
| GET    | `/api/v1/analytics/performance/vitals`   | Core Web Vitals      |
| GET    | `/api/v1/analytics/performance/pages`    | Per-page performance |
| GET    | `/api/v1/analytics/performance/trends`   | Performance trends   |

### 7.4 User Behavior (Admin Only)

| Method | Path                                | Description              |
| ------ | ----------------------------------- | ------------------------ |
| GET    | `/api/v1/analytics/products`        | Product analytics        |
| GET    | `/api/v1/analytics/products/:id`    | Single product analytics |
| GET    | `/api/v1/analytics/funnel`          | Conversion funnel        |
| GET    | `/api/v1/analytics/behavior/search` | Search analytics         |
| GET    | `/api/v1/analytics/behavior/cart`   | Cart analytics           |

### 7.5 Server Logs (Admin Only)

| Method | Path                      | Description                       |
| ------ | ------------------------- | --------------------------------- |
| GET    | `/api/v1/logs`            | Server logs (paginated, filtered) |
| GET    | `/api/v1/logs/:requestId` | Single log entry                  |
| GET    | `/api/v1/logs/stats`      | Log statistics                    |
| GET    | `/api/v1/logs/errors`     | Error log summary                 |
| DELETE | `/api/v1/logs`            | Purge old logs (admin)            |

### 7.6 Query Parameters

Common query parameters for analytics endpoints:

| Parameter | Type   | Description                    |
| --------- | ------ | ------------------------------ |
| `from`    | Date   | Start date (ISO format)        |
| `to`      | Date   | End date (ISO format)          |
| `period`  | enum   | `hour`, `day`, `week`, `month` |
| `page`    | number | Page number                    |
| `limit`   | number | Items per page (max 100)       |
| `sort`    | string | Sort field                     |
| `order`   | enum   | `asc`, `desc`                  |

For server logs:

| Parameter | Type   | Description                                |
| --------- | ------ | ------------------------------------------ |
| `level`   | enum   | Log level filter                           |
| `status`  | string | Status code(s) filter (e.g., "4xx", "500") |
| `method`  | string | HTTP method filter                         |
| `path`    | string | Path pattern filter                        |
| `country` | string | Country code filter                        |
| `search`  | string | Full-text search                           |

---

## 8. Manage App UI

### 8.1 New Routes

| Route                   | Screen              | Description                       |
| ----------------------- | ------------------- | --------------------------------- |
| `/analytics`            | Analytics Dashboard | Overview of all analytics metrics |
| `/analytics/visitors`   | Visitors Report     | Detailed visitor analytics        |
| `/analytics/pages`      | Pages Report        | Page-level analytics              |
| `/analytics/referrers`  | Traffic Sources     | Referrer and UTM analysis         |
| `/analytics/geo`        | Geographic Report   | Country/region breakdown with map |
| `/analytics/technology` | Technology Report   | Devices, browsers, OS             |
| `/analytics/events`     | Events Report       | Custom events tracking            |
| `/analytics/behavior`   | User Behavior       | Product engagement, funnels       |
| `/speed-insights`       | Speed Insights      | Performance metrics and vitals    |
| `/logs`                 | Server Logs         | Server log viewer                 |

### 8.2 Analytics Dashboard (`/analytics`)

#### 8.2.1 Overview Panel

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Date Range: [Last 7 Days ▼]    Compare: [Previous Period ▼]    [Export CSV]   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Visitors   │  │  Page Views  │  │ Bounce Rate  │  │ Avg. Session │       │
│  │    1,234     │  │    5,678     │  │    42.5%     │  │    3m 24s    │       │
│  │   ▲ +12.3%   │  │   ▲ +8.7%    │  │   ▼ -2.1%   │  │   ▲ +15.2%   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    Visitors Over Time (Area Chart)                       │   │
│  │  ^                                                                       │   │
│  │  │    ████                                                               │   │
│  │  │  ██████████                     ████████                              │   │
│  │  │██████████████████████████████████████████████████████████████         │   │
│  │  └──────────────────────────────────────────────────────────────────▶    │   │
│  │    Mon   Tue   Wed   Thu   Fri   Sat   Sun                               │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌────────────────────────────────┐  ┌────────────────────────────────────┐   │
│  │  Top Pages                     │  │  Traffic Sources                   │   │
│  │  ─────────────────────────     │  │  ─────────────────────────         │   │
│  │  /                    1,234    │  │  ▲ vercel.com              234     │   │
│  │  /products            892      │  │  G accounts.google.com    156     │   │
│  │  /products/lamp       456      │  │  github.com             89      │   │
│  │  /categories          321      │  │  Direct                 678     │   │
│  │  [View All →]                  │  │  [View All →]                       │   │
│  └────────────────────────────────┘  └────────────────────────────────────┘   │
│                                                                                 │
│  ┌────────────────────────────────┐  ┌────────────────────────────────────┐   │
│  │  Countries                     │  │  Devices                           │   │
│  │  ─────────────────────────     │  │  ─────────────────────────         │   │
│  │  US United States       81%    │  │  Desktop               74%      │   │
│  │  Canada              11%    │  │  Mobile                22%      │   │
│  │  Brazil               4%    │  │  Tablet                 4%      │   │
│  │  United Kingdom       4%    │  │                                    │   │
│  │  [View Map →]                  │  │  [View Details →]                  │   │
│  └────────────────────────────────┘  └────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### 8.2.2 Real-Time Panel (Optional)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Real-Time                                                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────┐  Active Visitors: 12                                         │
│  │              │                                                               │
│  │    ████      │  Top Active Pages:                                           │
│  │   ██████     │  ├── /products/modern-lamp (4 visitors)                      │
│  │  ████████    │  ├── /checkout (3 visitors)                                  │
│  │ ██████████   │  └── / (5 visitors)                                          │
│  │              │                                                               │
│  │  Last 30min  │  Recent Events:                                              │
│  └──────────────┘  • purchase - $124.00 - 2s ago                               │
│                    • add_to_cart - Modern Lamp - 15s ago                       │
│                    • pageview - /products - 23s ago                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 8.3 Speed Insights (`/speed-insights`)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Speed Insights                                           [Last 7 Days ▼]      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Core Web Vitals                                                                │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐     │
│  │       LCP           │  │       FID           │  │       CLS           │     │
│  │  ┌─────────────┐    │  │  ┌─────────────┐    │  │  ┌─────────────┐    │     │
│  │  │    2.1s     │    │  │  │    45ms     │    │  │  │    0.05     │    │     │
│  │  │   Good   │    │  │  │   Good   │    │  │  │   Good   │    │     │
│  │  └─────────────┘    │  │  └─────────────┘    │  │  └─────────────┘    │     │
│  │  Target: < 2.5s     │  │  Target: < 100ms    │  │  Target: < 0.1      │     │
│  │  P75: 2.3s          │  │  P75: 67ms          │  │  P75: 0.08          │     │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘     │
│                                                                                 │
│  Performance by Page                                                            │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  Page                    LCP     FID     CLS     TTFB    Samples               │
│  ──────────────────────────────────────────────────────────────────────────    │
│  /                      1.8s    32ms    0.02    180ms   1,234                  │
│  /products              2.1s    45ms    0.05    210ms   892                    │
│  /products/:slug        2.4s    52ms    0.08    245ms   2,345                  │
│  /checkout              1.9s    28ms    0.01    190ms   456                    │
│                                                                                 │
│  Performance Trend                                                              │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  [Line chart showing LCP, FID, CLS over time]                            │   │
│  │                                                                          │   │
│  │  Legend: ── LCP  ── FID  ── CLS                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 8.4 Server Logs (`/logs`)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Server Logs                                                      [Live]    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Filters                                                                        │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  Timeline: [Last 30 minutes ▼]    [Search logs...                        ]  │
│                                                                                 │
│  Level: [All ▼]  Status: [All ▼]  Method: [All ▼]  Country: [All ▼]           │
│                                                                                 │
│  Contains:  [ ] Warning (12)  [ ] Error (3)  [ ] Fatal (0)                           │
│                                                                                 │
│  Log Entries                                                                    │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  Time         Status  Host           Request                    Messages       │
│  ──────────────────────────────────────────────────────────────────────────    │
│  16:45:23     200     api.lunaz.com  GET /api/v1/products      OK             │
│  16:45:21     201     api.lunaz.com  POST /api/v1/orders       Created        │
│  16:45:18     401  api.lunaz.com  GET /api/v1/users/me      Unauthorized   │
│  16:45:15     200     api.lunaz.com  GET /api/v1/categories    OK             │
│  16:45:12     500  api.lunaz.com  POST /api/v1/checkout     Server Error   │
│  16:45:10     200     api.lunaz.com  GET /api/v1/products/123  OK             │
│                                                                                 │
│  [Click to expand log entry details]                                           │
│                                                                                 │
│  ◀ Previous  Page 1 of 234  Next ▶                                             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│  Log Entry Detail (expanded)                                            [x]    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Request ID: req_abc123xyz                                                      │
│  Timestamp: 2026-01-31T16:45:12.345Z                                           │
│  Duration: 234ms                                                                │
│                                                                                 │
│  Request                              Response                                  │
│  ─────────────────────                ─────────────────────                    │
│  Method: POST                         Status: 500                              │
│  Path: /api/v1/checkout               Content-Type: application/json          │
│  Route: /api/v1/checkout              Size: 156 bytes                          │
│  Content-Type: application/json                                                 │
│  Content-Length: 1,234 bytes                                                   │
│                                                                                 │
│  Client                               Server                                    │
│  ─────────────────────                ─────────────────────                    │
│  IP: 192.168.x.x (hashed)             Host: api-server-1                       │
│  Country: US United States            Environment: production                  │
│  Device: Desktop                      Version: 1.2.3                           │
│  Browser: Chrome 120                  Node: 20.10.0                            │
│  OS: macOS 14.2                       Memory: 512MB / 1GB                      │
│                                                                                 │
│  Error                                                                          │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  Name: PaymentProcessingError                                                   │
│  Message: Failed to process payment: insufficient funds                         │
│  Stack:                                                                         │
│    at processPayment (/app/src/modules/checkout/checkout.service.ts:145:11)   │
│    at CheckoutService.createOrder (/app/src/modules/checkout/...ts:89:20)     │
│    at async /app/src/modules/checkout/checkout.routes.ts:34:18                │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 8.5 Sidebar Navigation Update

Add new section to Manage app sidebar:

```
┌────────────────────┐
│  Dashboard         │
├────────────────────┤
│  Products          │
│  Categories        │
├────────────────────┤
│  Orders            │
│  Customers         │
├────────────────────┤
│  Transactions      │
│  Reports           │
├────────────────────┤
│  Analytics         │  <- NEW
│    - Overview      │
│    - Visitors      │
│    - Pages         │
│    - Referrers     │
│    - Geography     │
│    - Technology    │
│    - Behavior      │
│  Speed Insights    │  <- NEW
│  Server Logs       │  <- NEW
├────────────────────┤
│  Settings          │
└────────────────────┘
```

---

## 9. Implementation Requirements

### 9.1 GeoIP Database

For IP-to-location lookup without external API calls:

- **Option 1:** MaxMind GeoLite2 (free) — Download and include database file
- **Option 2:** ip2location Lite (free) — Similar approach
- **Update frequency:** Monthly database updates via script

### 9.2 User-Agent Parsing

For device/browser/OS detection:

- **Library:** `ua-parser-js` (MIT license, runs locally)
- **No external calls** — All parsing done in-memory

### 9.3 Data Aggregation

For efficient dashboard queries:

- **Pre-aggregated collections** — Daily/hourly rollups for common metrics
- **Background jobs** — Aggregate raw logs periodically
- **Materialized views** — Use MongoDB aggregation pipelines

### 9.4 Configuration

New environment variables:

| Variable                   | Description                  | Default                     |
| -------------------------- | ---------------------------- | --------------------------- |
| `ANALYTICS_ENABLED`        | Enable analytics collection  | `true`                      |
| `ANALYTICS_RETENTION_DAYS` | Days to keep raw analytics   | `365`                       |
| `LOGS_RETENTION_DAYS`      | Days to keep server logs     | `30`                        |
| `GEOIP_DATABASE_PATH`      | Path to GeoLite2 database    | `./data/GeoLite2-City.mmdb` |
| `ANONYMIZE_IP`             | Hash IP addresses            | `false`                     |
| `ANALYTICS_BATCH_SIZE`     | Events to batch before write | `100`                       |

---

## 10. Dependencies

### 10.1 Backend Packages

| Package        | Purpose             | License |
| -------------- | ------------------- | ------- |
| `ua-parser-js` | User-Agent parsing  | MIT     |
| `maxmind`      | GeoIP lookup        | ISC     |
| `uuid`         | Generate unique IDs | MIT     |
| `nanoid`       | Short unique IDs    | MIT     |

### 10.2 Frontend Packages

| Package             | Purpose           | License |
| ------------------- | ----------------- | ------- |
| `recharts`          | Chart components  | MIT     |
| `date-fns`          | Date manipulation | MIT     |
| `react-simple-maps` | Geographic map    | MIT     |

### 10.3 Self-Hosted Assets

| Asset                 | Source  | Update Frequency |
| --------------------- | ------- | ---------------- |
| GeoLite2-City.mmdb    | MaxMind | Monthly          |
| GeoLite2-Country.mmdb | MaxMind | Monthly          |

---

## 11. Security Considerations

### 11.1 Data Protection

- **Sanitize request bodies** — Remove passwords, tokens, PII from logs
- **Hash sensitive IPs** — Option to hash IP addresses
- **Limit stored headers** — Don't store Authorization header values
- **Access control** — Analytics endpoints require admin role

### 11.2 Rate Limiting

- **Collection endpoint** — Rate limit to prevent abuse
- **Batch validation** — Limit batch size per request
- **Origin validation** — Verify requests come from allowed origins

### 11.3 Storage Limits

- **TTL indexes** — Auto-expire old data
- **Collection size caps** — Monitor and alert on growth
- **Archival** — Option to archive old data to cold storage

---

## 12. Performance Considerations

### 12.1 Write Optimization

- **Buffered writes** — Batch analytics events before writing
- **Async processing** — Don't block request response for logging
- **Indexed fields** — Only index fields used in queries

### 12.2 Read Optimization

- **Pre-aggregation** — Compute daily/hourly summaries
- **Caching** — Cache dashboard data with short TTL
- **Pagination** — Always paginate large result sets

### 12.3 Client-Side

- **Lightweight tracker** — Keep < 5KB gzipped
- **Batched requests** — Reduce HTTP overhead
- **Beacon API** — Use `sendBeacon` for reliability

---

## 13. Future Enhancements

- **Heatmaps** — Click/scroll heatmap visualization
- **Session replay** — Record and replay user sessions
- **A/B testing** — Built-in experiment framework
- **Alerts** — Anomaly detection and notifications
- **Export** — Scheduled report exports
- **API access** — Public analytics API for external integrations

---

## 14. Document References

- [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) — System architecture
- [02-BACKEND.md](./02-BACKEND.md) — Backend API design
- [03-DATABASE.md](./03-DATABASE.md) — Database schema
- [05-MANAGE-APP.md](./05-MANAGE-APP.md) — Manage app screens
