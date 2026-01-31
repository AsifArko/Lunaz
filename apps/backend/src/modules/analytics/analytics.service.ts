import { randomUUID } from 'crypto';
import type {
  AnalyticsEventType,
  DeviceType,
  ReferrerType,
  LogLevel,
  AnalyticsOverview,
  AnalyticsTimeSeries,
  TopPage,
  TopReferrer,
  CountryStats,
  DeviceStats,
  BrowserStats,
  OSStats,
  RealTimeData,
  SpeedInsightsOverview,
  PagePerformance,
  ServerLogStats,
  GeoData,
  DeviceData,
  ReferrerData,
} from '@lunaz/types';
import {
  TrafficLogModel,
  PerformanceLogModel,
  ProductAnalyticsModel,
  ServerLogModel,
  SessionModel,
  DailyAnalyticsModel,
} from './analytics.model.js';

/* -------------------------------------------------------------------------- */
/*                              User Agent Parsing                            */
/* -------------------------------------------------------------------------- */

// Lightweight UA parsing without external dependencies
export function parseUserAgent(ua: string): Partial<DeviceData> {
  const result: Partial<DeviceData> = {
    userAgent: ua,
  };

  // Device type detection
  if (/bot|crawl|spider|slurp|googlebot|bingbot/i.test(ua)) {
    result.type = 'bot' as DeviceType;
  } else if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
    result.type = 'mobile' as DeviceType;
  } else if (/ipad|tablet|playbook|silk/i.test(ua)) {
    result.type = 'tablet' as DeviceType;
  } else {
    result.type = 'desktop' as DeviceType;
  }

  // Browser detection
  if (/edg/i.test(ua)) {
    result.browser = 'Edge';
    const match = ua.match(/edg\/(\d+)/i);
    if (match) result.browserVersion = match[1];
  } else if (/chrome/i.test(ua) && !/chromium/i.test(ua)) {
    result.browser = 'Chrome';
    const match = ua.match(/chrome\/(\d+)/i);
    if (match) result.browserVersion = match[1];
  } else if (/firefox/i.test(ua)) {
    result.browser = 'Firefox';
    const match = ua.match(/firefox\/(\d+)/i);
    if (match) result.browserVersion = match[1];
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    result.browser = 'Safari';
    const match = ua.match(/version\/(\d+)/i);
    if (match) result.browserVersion = match[1];
  } else if (/opera|opr/i.test(ua)) {
    result.browser = 'Opera';
    const match = ua.match(/(?:opera|opr)\/(\d+)/i);
    if (match) result.browserVersion = match[1];
  } else if (/msie|trident/i.test(ua)) {
    result.browser = 'Internet Explorer';
    const match = ua.match(/(?:msie |rv:)(\d+)/i);
    if (match) result.browserVersion = match[1];
  }

  // OS detection
  if (/windows nt 10/i.test(ua)) {
    result.os = 'Windows';
    result.osVersion = '10';
  } else if (/windows nt 6\.3/i.test(ua)) {
    result.os = 'Windows';
    result.osVersion = '8.1';
  } else if (/windows nt 6\.2/i.test(ua)) {
    result.os = 'Windows';
    result.osVersion = '8';
  } else if (/windows nt 6\.1/i.test(ua)) {
    result.os = 'Windows';
    result.osVersion = '7';
  } else if (/windows/i.test(ua)) {
    result.os = 'Windows';
  } else if (/mac os x/i.test(ua)) {
    result.os = 'macOS';
    const match = ua.match(/mac os x (\d+[._]\d+)/i);
    if (match) result.osVersion = match[1].replace('_', '.');
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    result.os = 'iOS';
    const match = ua.match(/os (\d+[._]\d+)/i);
    if (match) result.osVersion = match[1].replace('_', '.');
  } else if (/android/i.test(ua)) {
    result.os = 'Android';
    const match = ua.match(/android (\d+\.?\d*)/i);
    if (match) result.osVersion = match[1];
  } else if (/linux/i.test(ua)) {
    result.os = 'Linux';
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/*                              Referrer Parsing                              */
/* -------------------------------------------------------------------------- */

const searchEngines = ['google', 'bing', 'yahoo', 'duckduckgo', 'baidu', 'yandex'];
const socialNetworks = ['facebook', 'twitter', 'linkedin', 'instagram', 'pinterest', 'reddit', 'youtube', 'tiktok'];

export function parseReferrer(referrerUrl: string | undefined, currentHostname: string): ReferrerData {
  if (!referrerUrl) {
    return { type: 'direct' as ReferrerType };
  }

  try {
    const url = new URL(referrerUrl);
    const domain = url.hostname.replace('www.', '').toLowerCase();

    // Same site referrer = direct
    if (domain === currentHostname.replace('www.', '').toLowerCase()) {
      return { type: 'direct' as ReferrerType };
    }

    // Search engines
    for (const engine of searchEngines) {
      if (domain.includes(engine)) {
        return {
          url: referrerUrl,
          domain,
          type: 'search' as ReferrerType,
          searchEngine: engine,
        };
      }
    }

    // Social networks
    for (const network of socialNetworks) {
      if (domain.includes(network)) {
        return {
          url: referrerUrl,
          domain,
          type: 'social' as ReferrerType,
          socialNetwork: network,
        };
      }
    }

    // Email clients
    if (domain.includes('mail') || domain.includes('outlook') || domain.includes('gmail')) {
      return {
        url: referrerUrl,
        domain,
        type: 'email' as ReferrerType,
      };
    }

    // Default to referral
    return {
      url: referrerUrl,
      domain,
      type: 'referral' as ReferrerType,
    };
  } catch {
    return { type: 'direct' as ReferrerType };
  }
}

/* -------------------------------------------------------------------------- */
/*                              GeoIP (Placeholder - needs MaxMind DB)        */
/* -------------------------------------------------------------------------- */

// Country codes mapping for display
const countryNames: Record<string, string> = {
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  JP: 'Japan',
  AU: 'Australia',
  BR: 'Brazil',
  IN: 'India',
  CN: 'China',
  BD: 'Bangladesh',
  // Add more as needed
};

export function getCountryName(code: string): string {
  return countryNames[code] || code;
}

// Simple IP-based geo lookup (placeholder - should use MaxMind GeoLite2)
// In production, integrate maxmind package with GeoLite2-City.mmdb
export async function geoLookup(ip: string): Promise<GeoData> {
  // Skip private/local IPs
  if (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.')
  ) {
    return {};
  }

  // TODO: Implement MaxMind GeoLite2 lookup
  // For now, return empty - in production:
  // const reader = await maxmind.open('path/to/GeoLite2-City.mmdb');
  // const result = reader.get(ip);
  // return { country: result?.country?.iso_code, ... };
  
  return {};
}

/* -------------------------------------------------------------------------- */
/*                              Analytics Service                             */
/* -------------------------------------------------------------------------- */

export const analyticsService = {
  /* -------------------------- Collection Methods -------------------------- */

  async collectEvents(
    events: Array<{
      type: AnalyticsEventType;
      timestamp: string;
      page: { url: string; path: string; hostname: string; title?: string; search?: string; hash?: string };
      referrer?: { url?: string };
      utm?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string };
      event?: { name: string; properties?: Record<string, unknown> };
      device?: Partial<DeviceData>;
    }>,
    visitorId: string,
    sessionId: string,
    clientIp: string,
    userAgent: string,
    userId?: string
  ): Promise<void> {
    const parsedDevice = parseUserAgent(userAgent);
    const geo = await geoLookup(clientIp);

    const docs = events.map((e) => {
      const referrer = parseReferrer(e.referrer?.url, e.page.hostname);
      return {
        visitorId,
        sessionId,
        userId: userId || undefined,
        timestamp: new Date(e.timestamp),
        type: e.type,
        page: e.page,
        referrer,
        utm: e.utm,
        geo,
        device: { ...parsedDevice, ...e.device },
        event: e.event,
        ip: clientIp,
      };
    });

    await TrafficLogModel.insertMany(docs, { ordered: false });

    // Update session
    await this.updateSession(sessionId, visitorId, events, geo, parsedDevice, userId);

    // Update product analytics for product views
    for (const e of events) {
      if (e.type === 'product_view' && e.event?.properties?.productId) {
        await this.incrementProductAnalytics(
          e.event.properties.productId as string,
          'views',
          visitorId
        );
      } else if (e.type === 'add_to_cart' && e.event?.properties?.productId) {
        await this.incrementProductAnalytics(
          e.event.properties.productId as string,
          'addToCart'
        );
      } else if (e.type === 'purchase' && e.event?.properties?.items) {
        const items = e.event.properties.items as Array<{ productId: string; total: number }>;
        for (const item of items) {
          await this.incrementProductAnalytics(item.productId, 'purchases', undefined, item.total);
        }
      }
    }
  },

  async collectPerformance(
    data: {
      visitorId: string;
      sessionId: string;
      page: { url: string; path: string; hostname: string; title?: string };
      metrics: Record<string, number>;
      connection?: { effectiveType?: string; downlink?: number; rtt?: number };
      device?: Partial<DeviceData>;
    },
    userAgent: string
  ): Promise<void> {
    const parsedDevice = parseUserAgent(userAgent);

    await PerformanceLogModel.create({
      visitorId: data.visitorId,
      sessionId: data.sessionId,
      timestamp: new Date(),
      page: data.page,
      metrics: data.metrics,
      connection: data.connection,
      device: { ...parsedDevice, ...data.device },
    });
  },

  async updateSession(
    sessionId: string,
    visitorId: string,
    events: Array<{ type: AnalyticsEventType; page: { path: string } }>,
    geo: GeoData,
    device: Partial<DeviceData>,
    userId?: string
  ): Promise<void> {
    const pageViews = events.filter((e) => e.type === 'pageview').length;
    const lastPage = events[events.length - 1]?.page?.path;

    const session = await SessionModel.findOne({ sessionId });
    
    if (session) {
      session.pageViews += pageViews;
      session.events += events.length;
      session.exitPage = lastPage || session.exitPage;
      session.isBounce = session.pageViews <= 1;
      session.endedAt = new Date();
      session.duration = (session.endedAt.getTime() - session.startedAt.getTime()) / 1000;
      if (userId) session.userId = userId as any;
      await session.save();
    } else {
      await SessionModel.create({
        sessionId,
        visitorId,
        userId: userId || undefined,
        startedAt: new Date(),
        endedAt: new Date(),
        duration: 0,
        pageViews,
        events: events.length,
        entryPage: events[0]?.page?.path,
        exitPage: lastPage,
        geo,
        device,
        isBounce: pageViews <= 1,
      });
    }
  },

  async incrementProductAnalytics(
    productId: string,
    field: 'views' | 'addToCart' | 'purchases',
    visitorId?: string,
    revenue?: number
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const update: Record<string, unknown> = { $inc: { [field]: 1 } };
    if (revenue) {
      update.$inc = { ...(update.$inc as object), revenue };
    }

    await ProductAnalyticsModel.findOneAndUpdate(
      { productId, date: today },
      update,
      { upsert: true }
    );

    // Track unique viewers
    if (field === 'views' && visitorId) {
      // Use a simple approach - just increment uniqueViewers
      // In production, use a HyperLogLog or set to track actual unique visitors
      await ProductAnalyticsModel.findOneAndUpdate(
        { productId, date: today },
        { $inc: { uniqueViewers: 1 } },
        { upsert: true }
      );
    }
  },

  /* -------------------------- Dashboard Methods --------------------------- */

  async getOverview(from: Date, to: Date): Promise<AnalyticsOverview> {
    const [current, previous] = await Promise.all([
      this.getMetricsForPeriod(from, to),
      this.getMetricsForPeriod(
        new Date(from.getTime() - (to.getTime() - from.getTime())),
        from
      ),
    ]);

    const calcChange = (curr: number, prev: number) =>
      prev === 0 ? 0 : Math.round(((curr - prev) / prev) * 100 * 10) / 10;

    return {
      visitors: current.visitors,
      uniqueVisitors: current.uniqueVisitors,
      pageViews: current.pageViews,
      sessions: current.sessions,
      bounceRate: current.bounceRate,
      avgSessionDuration: current.avgSessionDuration,
      pagesPerSession: current.pagesPerSession,
      visitorsChange: calcChange(current.visitors, previous.visitors),
      pageViewsChange: calcChange(current.pageViews, previous.pageViews),
      bounceRateChange: calcChange(current.bounceRate, previous.bounceRate),
      avgSessionDurationChange: calcChange(current.avgSessionDuration, previous.avgSessionDuration),
    };
  },

  async getMetricsForPeriod(from: Date, to: Date): Promise<AnalyticsOverview> {
    const [trafficStats, sessionStats] = await Promise.all([
      TrafficLogModel.aggregate([
        { $match: { timestamp: { $gte: from, $lte: to } } },
        {
          $group: {
            _id: null,
            pageViews: { $sum: { $cond: [{ $eq: ['$type', 'pageview'] }, 1, 0] } },
            visitors: { $addToSet: '$visitorId' },
          },
        },
        {
          $project: {
            pageViews: 1,
            visitors: { $size: '$visitors' },
            uniqueVisitors: { $size: '$visitors' },
          },
        },
      ]),
      SessionModel.aggregate([
        { $match: { startedAt: { $gte: from, $lte: to } } },
        {
          $group: {
            _id: null,
            sessions: { $sum: 1 },
            bounces: { $sum: { $cond: ['$isBounce', 1, 0] } },
            totalDuration: { $sum: '$duration' },
            totalPageViews: { $sum: '$pageViews' },
          },
        },
      ]),
    ]);

    const traffic = trafficStats[0] || { pageViews: 0, visitors: 0, uniqueVisitors: 0 };
    const sessions = sessionStats[0] || { sessions: 0, bounces: 0, totalDuration: 0, totalPageViews: 0 };

    return {
      visitors: traffic.visitors,
      uniqueVisitors: traffic.uniqueVisitors,
      pageViews: traffic.pageViews,
      sessions: sessions.sessions,
      bounceRate: sessions.sessions > 0 ? Math.round((sessions.bounces / sessions.sessions) * 100 * 10) / 10 : 0,
      avgSessionDuration: sessions.sessions > 0 ? Math.round(sessions.totalDuration / sessions.sessions) : 0,
      pagesPerSession: sessions.sessions > 0 ? Math.round((sessions.totalPageViews / sessions.sessions) * 10) / 10 : 0,
    };
  },

  async getTimeSeries(from: Date, to: Date, period: 'hour' | 'day' | 'week' | 'month'): Promise<AnalyticsTimeSeries[]> {
    const dateFormat = {
      hour: { format: '%Y-%m-%dT%H:00:00Z', dateFromParts: { year: '$year', month: '$month', day: '$day', hour: '$hour' } },
      day: { format: '%Y-%m-%d', dateFromParts: { year: '$year', month: '$month', day: '$day' } },
      week: { format: '%Y-W%V', dateFromParts: { isoWeekYear: '$isoWeekYear', isoWeek: '$isoWeek' } },
      month: { format: '%Y-%m', dateFromParts: { year: '$year', month: '$month' } },
    };

    const result = await TrafficLogModel.aggregate([
      { $match: { timestamp: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat[period].format, date: '$timestamp' },
          },
          pageViews: { $sum: { $cond: [{ $eq: ['$type', 'pageview'] }, 1, 0] } },
          visitors: { $addToSet: '$visitorId' },
          sessions: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          date: '$_id',
          pageViews: 1,
          visitors: { $size: '$visitors' },
          sessions: { $size: '$sessions' },
        },
      },
      { $sort: { date: 1 } },
    ]);

    return result.map((r) => ({
      date: r.date,
      visitors: r.visitors,
      pageViews: r.pageViews,
      sessions: r.sessions,
    }));
  },

  async getTopPages(from: Date, to: Date, limit: number = 10): Promise<TopPage[]> {
    const result = await TrafficLogModel.aggregate([
      { $match: { timestamp: { $gte: from, $lte: to }, type: 'pageview' } },
      {
        $group: {
          _id: '$page.path',
          title: { $first: '$page.title' },
          views: { $sum: 1 },
          visitors: { $addToSet: '$visitorId' },
        },
      },
      {
        $project: {
          path: '$_id',
          title: 1,
          views: 1,
          uniqueVisitors: { $size: '$visitors' },
        },
      },
      { $sort: { views: -1 } },
      { $limit: limit },
    ]);

    return result.map((r) => ({
      path: r.path,
      title: r.title,
      views: r.views,
      uniqueVisitors: r.uniqueVisitors,
    }));
  },

  async getTopReferrers(from: Date, to: Date, limit: number = 10): Promise<TopReferrer[]> {
    const result = await TrafficLogModel.aggregate([
      {
        $match: {
          timestamp: { $gte: from, $lte: to },
          'referrer.type': { $ne: 'direct' },
          'referrer.domain': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: { domain: '$referrer.domain', type: '$referrer.type' },
          visitors: { $addToSet: '$visitorId' },
        },
      },
      {
        $project: {
          domain: '$_id.domain',
          type: '$_id.type',
          visitors: { $size: '$visitors' },
        },
      },
      { $sort: { visitors: -1 } },
      { $limit: limit },
    ]);

    return result.map((r) => ({
      domain: r.domain,
      type: r.type,
      visitors: r.visitors,
    }));
  },

  async getCountryStats(from: Date, to: Date, limit: number = 10): Promise<CountryStats[]> {
    const result = await TrafficLogModel.aggregate([
      {
        $match: {
          timestamp: { $gte: from, $lte: to },
          'geo.country': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$geo.country',
          countryName: { $first: '$geo.countryName' },
          visitors: { $addToSet: '$visitorId' },
        },
      },
      {
        $project: {
          country: '$_id',
          countryName: 1,
          visitors: { $size: '$visitors' },
        },
      },
      { $sort: { visitors: -1 } },
      { $limit: limit },
    ]);

    const total = result.reduce((sum, r) => sum + r.visitors, 0);

    return result.map((r) => ({
      country: r.country,
      countryName: r.countryName || getCountryName(r.country),
      visitors: r.visitors,
      percentage: total > 0 ? Math.round((r.visitors / total) * 100) : 0,
    }));
  },

  async getDeviceStats(from: Date, to: Date): Promise<DeviceStats[]> {
    const result = await TrafficLogModel.aggregate([
      {
        $match: {
          timestamp: { $gte: from, $lte: to },
          'device.type': { $exists: true },
        },
      },
      {
        $group: {
          _id: '$device.type',
          visitors: { $addToSet: '$visitorId' },
        },
      },
      {
        $project: {
          type: '$_id',
          count: { $size: '$visitors' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const total = result.reduce((sum, r) => sum + r.count, 0);

    return result.map((r) => ({
      type: r.type,
      count: r.count,
      percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
    }));
  },

  async getBrowserStats(from: Date, to: Date, limit: number = 10): Promise<BrowserStats[]> {
    const result = await TrafficLogModel.aggregate([
      {
        $match: {
          timestamp: { $gte: from, $lte: to },
          'device.browser': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$device.browser',
          visitors: { $addToSet: '$visitorId' },
        },
      },
      {
        $project: {
          browser: '$_id',
          count: { $size: '$visitors' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    const total = result.reduce((sum, r) => sum + r.count, 0);

    return result.map((r) => ({
      browser: r.browser,
      count: r.count,
      percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
    }));
  },

  async getOSStats(from: Date, to: Date, limit: number = 10): Promise<OSStats[]> {
    const result = await TrafficLogModel.aggregate([
      {
        $match: {
          timestamp: { $gte: from, $lte: to },
          'device.os': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$device.os',
          visitors: { $addToSet: '$visitorId' },
        },
      },
      {
        $project: {
          os: '$_id',
          count: { $size: '$visitors' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    const total = result.reduce((sum, r) => sum + r.count, 0);

    return result.map((r) => ({
      os: r.os,
      count: r.count,
      percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
    }));
  },

  async getRealTimeData(): Promise<RealTimeData> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const [activeVisitors, recentEvents] = await Promise.all([
      TrafficLogModel.aggregate([
        { $match: { timestamp: { $gte: thirtyMinutesAgo } } },
        {
          $group: {
            _id: '$visitorId',
            lastPage: { $last: '$page.path' },
          },
        },
        {
          $group: {
            _id: '$lastPage',
            visitors: { $sum: 1 },
          },
        },
        { $sort: { visitors: -1 } },
        { $limit: 5 },
      ]),
      TrafficLogModel.find({ timestamp: { $gte: thirtyMinutesAgo } })
        .sort({ timestamp: -1 })
        .limit(10)
        .lean(),
    ]);

    const totalActive = activeVisitors.reduce((sum, p) => sum + p.visitors, 0);

    return {
      activeVisitors: totalActive,
      activePages: activeVisitors.map((p) => ({ path: p._id, visitors: p.visitors })),
      recentEvents: recentEvents.map((e) => ({
        type: e.type,
        timestamp: e.timestamp.toISOString(),
        page: e.page?.path,
        data: e.event?.properties,
      })),
    };
  },

  /* -------------------------- Speed Insights Methods ---------------------- */

  async getSpeedInsightsOverview(from: Date, to: Date): Promise<SpeedInsightsOverview> {
    const result = await PerformanceLogModel.aggregate([
      { $match: { timestamp: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: null,
          lcpValues: { $push: '$metrics.lcp' },
          fidValues: { $push: '$metrics.fid' },
          clsValues: { $push: '$metrics.cls' },
          inpValues: { $push: '$metrics.inp' },
          ttfbValues: { $push: '$metrics.ttfb' },
          samples: { $sum: 1 },
        },
      },
    ]);

    if (!result.length) {
      return {
        lcp: { value: 0, rating: 'good', p75: 0 },
        fid: { value: 0, rating: 'good', p75: 0 },
        cls: { value: 0, rating: 'good', p75: 0 },
        ttfb: { value: 0, p75: 0 },
        samples: 0,
      };
    }

    const data = result[0];
    const getPercentile = (arr: number[], p: number) => {
      const filtered = arr.filter((v) => v != null);
      if (!filtered.length) return 0;
      filtered.sort((a, b) => a - b);
      const idx = Math.ceil((p / 100) * filtered.length) - 1;
      return filtered[idx] || 0;
    };

    const getAvg = (arr: number[]) => {
      const filtered = arr.filter((v) => v != null);
      return filtered.length ? filtered.reduce((a, b) => a + b, 0) / filtered.length : 0;
    };

    const getLcpRating = (v: number): 'good' | 'needs-improvement' | 'poor' =>
      v <= 2500 ? 'good' : v <= 4000 ? 'needs-improvement' : 'poor';
    const getFidRating = (v: number): 'good' | 'needs-improvement' | 'poor' =>
      v <= 100 ? 'good' : v <= 300 ? 'needs-improvement' : 'poor';
    const getClsRating = (v: number): 'good' | 'needs-improvement' | 'poor' =>
      v <= 0.1 ? 'good' : v <= 0.25 ? 'needs-improvement' : 'poor';

    const lcpAvg = getAvg(data.lcpValues);
    const fidAvg = getAvg(data.fidValues);
    const clsAvg = getAvg(data.clsValues);
    const inpAvg = getAvg(data.inpValues);
    const ttfbAvg = getAvg(data.ttfbValues);

    return {
      lcp: {
        value: Math.round(lcpAvg),
        rating: getLcpRating(lcpAvg),
        p75: Math.round(getPercentile(data.lcpValues, 75)),
      },
      fid: {
        value: Math.round(fidAvg),
        rating: getFidRating(fidAvg),
        p75: Math.round(getPercentile(data.fidValues, 75)),
      },
      cls: {
        value: Math.round(clsAvg * 1000) / 1000,
        rating: getClsRating(clsAvg),
        p75: Math.round(getPercentile(data.clsValues, 75) * 1000) / 1000,
      },
      inp: inpAvg ? {
        value: Math.round(inpAvg),
        rating: inpAvg <= 200 ? 'good' : inpAvg <= 500 ? 'needs-improvement' : 'poor',
        p75: Math.round(getPercentile(data.inpValues, 75)),
      } : undefined,
      ttfb: {
        value: Math.round(ttfbAvg),
        p75: Math.round(getPercentile(data.ttfbValues, 75)),
      },
      samples: data.samples,
    };
  },

  async getPagePerformance(from: Date, to: Date, limit: number = 10): Promise<PagePerformance[]> {
    const result = await PerformanceLogModel.aggregate([
      { $match: { timestamp: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: '$page.path',
          lcp: { $avg: '$metrics.lcp' },
          fid: { $avg: '$metrics.fid' },
          cls: { $avg: '$metrics.cls' },
          ttfb: { $avg: '$metrics.ttfb' },
          samples: { $sum: 1 },
        },
      },
      { $sort: { samples: -1 } },
      { $limit: limit },
    ]);

    return result.map((r) => ({
      path: r._id,
      lcp: Math.round(r.lcp || 0),
      fid: Math.round(r.fid || 0),
      cls: Math.round((r.cls || 0) * 1000) / 1000,
      ttfb: Math.round(r.ttfb || 0),
      samples: r.samples,
    }));
  },

  /* -------------------------- Traffic Logs Methods ------------------------- */

  async getTrafficLogs(
    query: {
      from?: Date;
      to?: Date;
      type?: string;
      path?: string;
      country?: string;
      device?: string;
      browser?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const filter: Record<string, unknown> = {};
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);

    if (query.from || query.to) {
      filter.timestamp = {};
      if (query.from) (filter.timestamp as Record<string, Date>).$gte = query.from;
      if (query.to) (filter.timestamp as Record<string, Date>).$lte = query.to;
    }
    if (query.type) filter.type = query.type;
    if (query.path) filter['page.path'] = { $regex: query.path, $options: 'i' };
    if (query.country) filter['geo.country'] = query.country;
    if (query.device) filter['device.type'] = query.device;
    if (query.browser) filter['device.browser'] = query.browser;
    if (query.search) {
      filter.$or = [
        { 'page.path': { $regex: query.search, $options: 'i' } },
        { 'page.title': { $regex: query.search, $options: 'i' } },
        { visitorId: { $regex: query.search, $options: 'i' } },
        { 'event.name': { $regex: query.search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      TrafficLogModel.find(filter)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      TrafficLogModel.countDocuments(filter),
    ]);

    return {
      data: data.map((d: any) => ({
        id: d._id.toString(),
        timestamp: d.timestamp.toISOString(),
        visitorId: d.visitorId,
        sessionId: d.sessionId,
        userId: d.userId?.toString(),
        type: d.type,
        page: d.page,
        referrer: d.referrer,
        utm: d.utm,
        geo: d.geo,
        device: d.device,
        event: d.event,
        ip: d.ip,
        createdAt: d.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /* -------------------------- Server Logs Methods ------------------------- */

  async getServerLogs(
    query: {
      from?: Date;
      to?: Date;
      level?: LogLevel;
      status?: string;
      method?: string;
      path?: string;
      country?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const filter: Record<string, unknown> = {};
    const page = query.page || 1;
    const limit = Math.min(query.limit || 50, 100);

    if (query.from || query.to) {
      filter.timestamp = {};
      if (query.from) (filter.timestamp as Record<string, Date>).$gte = query.from;
      if (query.to) (filter.timestamp as Record<string, Date>).$lte = query.to;
    }
    if (query.level) filter.level = query.level;
    if (query.method) filter.method = query.method;
    if (query.path) filter.path = { $regex: query.path, $options: 'i' };
    if (query.country) filter['client.country'] = query.country;
    if (query.status) {
      if (query.status.endsWith('xx')) {
        const prefix = parseInt(query.status[0]);
        filter.statusCode = { $gte: prefix * 100, $lt: (prefix + 1) * 100 };
      } else {
        filter.statusCode = parseInt(query.status);
      }
    }
    if (query.search) {
      filter.$or = [
        { message: { $regex: query.search, $options: 'i' } },
        { path: { $regex: query.search, $options: 'i' } },
        { 'error.message': { $regex: query.search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      ServerLogModel.find(filter)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ServerLogModel.countDocuments(filter),
    ]);

    return {
      data: data.map((d) => ({
        id: d._id.toString(),
        timestamp: d.timestamp.toISOString(),
        requestId: d.requestId,
        method: d.method,
        path: d.path,
        route: d.route,
        statusCode: d.statusCode,
        statusText: d.statusText,
        duration: d.duration,
        request: d.request,
        response: d.response,
        client: d.client,
        server: d.server,
        error: d.error,
        level: d.level,
        message: d.message,
        tags: d.tags,
        metadata: d.metadata,
        createdAt: d.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getServerLogStats(from: Date, to: Date): Promise<ServerLogStats> {
    const [stats, statusCodes, topPaths, topErrors] = await Promise.all([
      ServerLogModel.aggregate([
        { $match: { timestamp: { $gte: from, $lte: to } } },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            errorCount: { $sum: { $cond: [{ $eq: ['$level', 'error'] }, 1, 0] } },
            warnCount: { $sum: { $cond: [{ $eq: ['$level', 'warn'] }, 1, 0] } },
            avgResponseTime: { $avg: '$duration' },
          },
        },
      ]),
      ServerLogModel.aggregate([
        { $match: { timestamp: { $gte: from, $lte: to } } },
        { $group: { _id: '$statusCode', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ServerLogModel.aggregate([
        { $match: { timestamp: { $gte: from, $lte: to } } },
        { $group: { _id: '$path', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      ServerLogModel.aggregate([
        { $match: { timestamp: { $gte: from, $lte: to }, 'error.message': { $exists: true } } },
        { $group: { _id: '$error.message', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const s = stats[0] || { totalRequests: 0, errorCount: 0, warnCount: 0, avgResponseTime: 0 };

    return {
      totalRequests: s.totalRequests,
      errorCount: s.errorCount,
      warnCount: s.warnCount,
      avgResponseTime: Math.round(s.avgResponseTime || 0),
      statusCodes: statusCodes.reduce((acc, r) => {
        acc[r._id] = r.count;
        return acc;
      }, {} as Record<string, number>),
      topPaths: topPaths.map((r) => ({ path: r._id, count: r.count })),
      topErrors: topErrors.map((r) => ({ message: r._id, count: r.count })),
    };
  },

  /* -------------------------- Product Analytics Methods ------------------- */

  async getProductAnalytics(productId: string, from: Date, to: Date) {
    const result = await ProductAnalyticsModel.aggregate([
      {
        $match: {
          productId: new (await import('mongoose')).default.Types.ObjectId(productId),
          date: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalUniqueViewers: { $sum: '$uniqueViewers' },
          totalAddToCart: { $sum: '$addToCart' },
          totalPurchases: { $sum: '$purchases' },
          totalRevenue: { $sum: '$revenue' },
        },
      },
    ]);

    return result[0] || {
      totalViews: 0,
      totalUniqueViewers: 0,
      totalAddToCart: 0,
      totalPurchases: 0,
      totalRevenue: 0,
    };
  },

  async getTopProducts(from: Date, to: Date, limit: number = 10, sortBy: 'views' | 'purchases' | 'revenue' = 'views') {
    return ProductAnalyticsModel.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: '$productId',
          views: { $sum: '$views' },
          uniqueViewers: { $sum: '$uniqueViewers' },
          addToCart: { $sum: '$addToCart' },
          purchases: { $sum: '$purchases' },
          revenue: { $sum: '$revenue' },
        },
      },
      { $sort: { [sortBy]: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productId: '$_id',
          name: '$product.name',
          slug: '$product.slug',
          views: 1,
          uniqueViewers: 1,
          addToCart: 1,
          purchases: 1,
          revenue: 1,
          conversionRate: {
            $cond: [
              { $gt: ['$views', 0] },
              { $multiply: [{ $divide: ['$purchases', '$views'] }, 100] },
              0,
            ],
          },
        },
      },
    ]);
  },
};
