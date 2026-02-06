import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import { getConfig } from '../../config/index.js';
import { UserRole, LogLevel } from '@lunaz/types';
import { analyticsService } from './analytics.service.js';
import {
  collectEventsSchema,
  collectPerformanceSchema,
  analyticsQuerySchema,
  serverLogsQuerySchema,
} from './analytics.validation.js';

const router = Router();
const getConfigFn = getConfig;

/* -------------------------------------------------------------------------- */
/*                              Collection Endpoints (Public)                 */
/* -------------------------------------------------------------------------- */

// POST /analytics/collect - Collect analytics events from client
router.post('/collect', validateBody(collectEventsSchema), async (req, res, next) => {
  try {
    const { visitorId, sessionId, events } = req.body;
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '0.0.0.0';
    const userAgent = req.headers['user-agent'] || '';

    // Get userId if authenticated
    let userId: string | undefined;
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
    if (token) {
      try {
        const { verifyToken } = await import('../../lib/jwt.js');
        const user = verifyToken(token, getConfigFn().JWT_SECRET);
        userId = user.id;
      } catch {
        // Invalid token, continue without userId
      }
    }

    await analyticsService.collectEvents(events, visitorId, sessionId, clientIp, userAgent, userId);
    res.status(202).json({ success: true });
  } catch (e) {
    next(e);
  }
});

// POST /analytics/performance - Collect performance metrics
router.post('/performance', validateBody(collectPerformanceSchema), async (req, res, next) => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    await analyticsService.collectPerformance(req.body, userAgent);
    res.status(202).json({ success: true });
  } catch (e) {
    next(e);
  }
});

// POST /analytics/error - Report client-side errors
router.post('/error', async (req, res, next) => {
  try {
    const { visitorId, sessionId, error, page } = req.body;
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '0.0.0.0';
    const userAgent = req.headers['user-agent'] || '';

    await analyticsService.collectEvents(
      [
        {
          type: 'error' as const,
          timestamp: new Date().toISOString(),
          page: page || { url: '', path: '/', hostname: '' },
          event: { name: 'error', properties: error },
        },
      ],
      visitorId || 'unknown',
      sessionId || 'unknown',
      clientIp,
      userAgent
    );
    res.status(202).json({ success: true });
  } catch (e) {
    next(e);
  }
});

/* -------------------------------------------------------------------------- */
/*                              Dashboard Endpoints (Admin Only)              */
/* -------------------------------------------------------------------------- */

// GET /analytics/overview - Dashboard overview metrics
router.get(
  '/overview',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  validateQuery(analyticsQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as { from?: string; to?: string };
      const to = query.to ? new Date(query.to) : new Date();
      const from = query.from
        ? new Date(query.from)
        : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);

      const overview = await analyticsService.getOverview(from, to);
      res.json(overview);
    } catch (e) {
      next(e);
    }
  }
);

// GET /analytics/timeseries - Visitor/pageview time series
router.get(
  '/timeseries',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  validateQuery(analyticsQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as {
        from?: string;
        to?: string;
        period?: 'hour' | 'day' | 'week' | 'month';
      };
      const to = query.to ? new Date(query.to) : new Date();
      const from = query.from
        ? new Date(query.from)
        : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
      const period = query.period || 'day';

      const timeseries = await analyticsService.getTimeSeries(from, to, period);
      res.json(timeseries);
    } catch (e) {
      next(e);
    }
  }
);

// GET /analytics/pages - Top pages report
router.get(
  '/pages',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  validateQuery(analyticsQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as { from?: string; to?: string; limit?: number };
      const to = query.to ? new Date(query.to) : new Date();
      const from = query.from
        ? new Date(query.from)
        : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
      const limit = query.limit || 10;

      const pages = await analyticsService.getTopPages(from, to, limit);
      res.json(pages);
    } catch (e) {
      next(e);
    }
  }
);

// GET /analytics/referrers - Traffic sources
router.get(
  '/referrers',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  validateQuery(analyticsQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as { from?: string; to?: string; limit?: number };
      const to = query.to ? new Date(query.to) : new Date();
      const from = query.from
        ? new Date(query.from)
        : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
      const limit = query.limit || 10;

      const referrers = await analyticsService.getTopReferrers(from, to, limit);
      res.json(referrers);
    } catch (e) {
      next(e);
    }
  }
);

// GET /analytics/countries - Geographic breakdown
router.get(
  '/countries',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  validateQuery(analyticsQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as { from?: string; to?: string; limit?: number };
      const to = query.to ? new Date(query.to) : new Date();
      const from = query.from
        ? new Date(query.from)
        : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
      const limit = query.limit || 10;

      const countries = await analyticsService.getCountryStats(from, to, limit);
      res.json(countries);
    } catch (e) {
      next(e);
    }
  }
);

// GET /analytics/devices - Device breakdown
router.get(
  '/devices',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  validateQuery(analyticsQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as { from?: string; to?: string };
      const to = query.to ? new Date(query.to) : new Date();
      const from = query.from
        ? new Date(query.from)
        : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);

      const devices = await analyticsService.getDeviceStats(from, to);
      res.json(devices);
    } catch (e) {
      next(e);
    }
  }
);

// GET /analytics/browsers - Browser breakdown
router.get(
  '/browsers',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  validateQuery(analyticsQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as { from?: string; to?: string; limit?: number };
      const to = query.to ? new Date(query.to) : new Date();
      const from = query.from
        ? new Date(query.from)
        : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
      const limit = query.limit || 10;

      const browsers = await analyticsService.getBrowserStats(from, to, limit);
      res.json(browsers);
    } catch (e) {
      next(e);
    }
  }
);

// GET /analytics/os - Operating system breakdown
router.get(
  '/os',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  validateQuery(analyticsQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as { from?: string; to?: string; limit?: number };
      const to = query.to ? new Date(query.to) : new Date();
      const from = query.from
        ? new Date(query.from)
        : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
      const limit = query.limit || 10;

      const os = await analyticsService.getOSStats(from, to, limit);
      res.json(os);
    } catch (e) {
      next(e);
    }
  }
);

// GET /analytics/realtime - Real-time visitor data
router.get(
  '/realtime',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  async (_req, res, next) => {
    try {
      const realtime = await analyticsService.getRealTimeData();
      res.json(realtime);
    } catch (e) {
      next(e);
    }
  }
);

/* -------------------------------------------------------------------------- */
/*                              Speed Insights (Admin Only)                   */
/* -------------------------------------------------------------------------- */

// GET /analytics/speed/overview - Performance metrics overview
router.get(
  '/speed/overview',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  validateQuery(analyticsQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as { from?: string; to?: string };
      const to = query.to ? new Date(query.to) : new Date();
      const from = query.from
        ? new Date(query.from)
        : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);

      const overview = await analyticsService.getSpeedInsightsOverview(from, to);
      res.json(overview);
    } catch (e) {
      next(e);
    }
  }
);

// GET /analytics/speed/pages - Per-page performance
router.get(
  '/speed/pages',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  validateQuery(analyticsQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as { from?: string; to?: string; limit?: number };
      const to = query.to ? new Date(query.to) : new Date();
      const from = query.from
        ? new Date(query.from)
        : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
      const limit = query.limit || 10;

      const pages = await analyticsService.getPagePerformance(from, to, limit);
      res.json(pages);
    } catch (e) {
      next(e);
    }
  }
);

/* -------------------------------------------------------------------------- */
/*                              Product Analytics (Admin Only)                */
/* -------------------------------------------------------------------------- */

// GET /analytics/products - Top products by engagement
router.get(
  '/products',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  validateQuery(analyticsQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as {
        from?: string;
        to?: string;
        limit?: number;
        sort?: 'views' | 'purchases' | 'revenue';
      };
      const to = query.to ? new Date(query.to) : new Date();
      const from = query.from
        ? new Date(query.from)
        : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
      const limit = query.limit || 10;
      const sortBy = query.sort || 'views';

      const products = await analyticsService.getTopProducts(from, to, limit, sortBy);
      res.json(products);
    } catch (e) {
      next(e);
    }
  }
);

// GET /analytics/products/:id - Single product analytics
router.get(
  '/products/:id',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  validateQuery(analyticsQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as { from?: string; to?: string };
      const to = query.to ? new Date(query.to) : new Date();
      const from = query.from
        ? new Date(query.from)
        : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);

      const analytics = await analyticsService.getProductAnalytics(req.params.id, from, to);
      res.json(analytics);
    } catch (e) {
      next(e);
    }
  }
);

/* -------------------------------------------------------------------------- */
/*                              Traffic Logs (Admin Only)                     */
/* -------------------------------------------------------------------------- */

// GET /analytics/traffic - Traffic logs (paginated)
router.get(
  '/traffic',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  validateQuery(serverLogsQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as {
        from?: string;
        to?: string;
        type?: string;
        path?: string;
        country?: string;
        device?: string;
        browser?: string;
        search?: string;
        page?: number;
        limit?: number;
      };

      const result = await analyticsService.getTrafficLogs({
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined,
        type: query.type,
        path: query.path,
        country: query.country,
        device: query.device,
        browser: query.browser,
        search: query.search,
        page: query.page,
        limit: query.limit,
      });
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

/* -------------------------------------------------------------------------- */
/*                              Server Logs (Admin Only)                      */
/* -------------------------------------------------------------------------- */

// GET /analytics/logs - Server logs (paginated)
router.get(
  '/logs',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  validateQuery(serverLogsQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as {
        from?: string;
        to?: string;
        level?: string;
        status?: string;
        method?: string;
        path?: string;
        country?: string;
        search?: string;
        page?: number;
        limit?: number;
      };

      const result = await analyticsService.getServerLogs({
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined,
        level: query.level as LogLevel | undefined,
        status: query.status,
        method: query.method,
        path: query.path,
        country: query.country,
        search: query.search,
        page: query.page,
        limit: query.limit,
      });
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

// GET /analytics/logs/stats - Log statistics
router.get(
  '/logs/stats',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  validateQuery(analyticsQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as { from?: string; to?: string };
      const to = query.to ? new Date(query.to) : new Date();
      const from = query.from ? new Date(query.from) : new Date(to.getTime() - 24 * 60 * 60 * 1000);

      const stats = await analyticsService.getServerLogStats(from, to);
      res.json(stats);
    } catch (e) {
      next(e);
    }
  }
);

// GET /analytics/logs/:requestId - Single log entry
router.get(
  '/logs/:requestId',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  async (req, res, next) => {
    try {
      const { ServerLogModel } = await import('./analytics.model.js');
      const log = await ServerLogModel.findOne({ requestId: req.params.requestId }).lean();

      if (!log) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Log entry not found' } });
        return;
      }

      res.json({
        id: log._id.toString(),
        timestamp: log.timestamp.toISOString(),
        requestId: log.requestId,
        method: log.method,
        path: log.path,
        route: log.route,
        statusCode: log.statusCode,
        statusText: log.statusText,
        duration: log.duration,
        request: log.request,
        response: log.response,
        client: log.client,
        server: log.server,
        error: log.error,
        level: log.level,
        message: log.message,
        tags: log.tags,
        metadata: log.metadata,
        createdAt: log.createdAt.toISOString(),
      });
    } catch (e) {
      next(e);
    }
  }
);

export const analyticsRoutes = router;
