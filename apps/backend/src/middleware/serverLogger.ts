import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { LogLevel } from '../constants/analytics';
import { ServerLogModel } from '../modules/analytics/analytics.model.js';
import { parseUserAgent } from '../modules/analytics/analytics.service.js';

// Sensitive headers that should not be logged
const SENSITIVE_HEADERS = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];

// Paths to exclude from logging (health checks, static files, etc.)
const EXCLUDED_PATHS = ['/health', '/favicon.ico'];

// Sanitize headers - remove sensitive values
function sanitizeHeaders(headers: Record<string, unknown>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.join(', ');
    }
  }
  return sanitized;
}

// Sanitize request body - remove passwords and tokens
function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body;

  const sanitized = { ...body } as Record<string, unknown>;
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'cvv'];

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  // Truncate large bodies
  const bodyStr = JSON.stringify(sanitized);
  if (bodyStr.length > 10000) {
    return { _truncated: true, _size: bodyStr.length };
  }

  return sanitized;
}

// Determine log level based on status code
function getLogLevel(statusCode: number, error?: Error): LogLevel {
  if (error) {
    return statusCode >= 500 ? LogLevel.ERROR : LogLevel.WARN;
  }
  if (statusCode >= 500) return LogLevel.ERROR;
  if (statusCode >= 400) return LogLevel.WARN;
  return LogLevel.INFO;
}

// Get status text from code
function getStatusText(statusCode: number): string {
  const texts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    301: 'Moved Permanently',
    302: 'Found',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };
  return texts[statusCode] || 'Unknown';
}

export function serverLoggerMiddleware() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip excluded paths
    if (EXCLUDED_PATHS.some((p) => req.path.startsWith(p))) {
      next();
      return;
    }

    // Generate unique request ID
    const requestId = randomUUID();
    const startTime = Date.now();

    // Attach request ID to response headers for debugging
    res.setHeader('X-Request-ID', requestId);

    // Parse client info
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '0.0.0.0';
    const userAgent = req.headers['user-agent'] || '';
    const parsedDevice = parseUserAgent(userAgent);

    // Capture response
    const originalSend = res.send;
    let responseBody: unknown;
    let responseSize = 0;

    res.send = function (body: unknown): Response {
      responseBody = body;
      if (typeof body === 'string') {
        responseSize = Buffer.byteLength(body);
      } else if (Buffer.isBuffer(body)) {
        responseSize = body.length;
      }
      return originalSend.call(this, body);
    };

    // Handle response finish
    res.on('finish', async () => {
      try {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;

        // Extract error from response body if it exists
        let errorDetails:
          | { name?: string; message?: string; stack?: string; code?: string }
          | undefined;
        if (statusCode >= 400 && responseBody) {
          try {
            const parsed =
              typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
            if (parsed?.error) {
              errorDetails = {
                name: parsed.error.code || 'Error',
                message: parsed.error.message,
                code: parsed.error.code,
              };
            }
          } catch {
            // Not JSON, ignore
          }
        }

        const logLevel = getLogLevel(statusCode);

        const logEntry = {
          timestamp: new Date(),
          requestId,
          method: req.method,
          path: req.path,
          route: req.route?.path || req.path,
          statusCode,
          statusText: getStatusText(statusCode),
          duration,
          request: {
            headers: sanitizeHeaders(req.headers as Record<string, unknown>),
            query: req.query as Record<string, string>,
            body: sanitizeBody(req.body),
            contentType: req.headers['content-type'],
            contentLength: req.headers['content-length']
              ? parseInt(req.headers['content-length'] as string)
              : undefined,
            cookies: req.cookies ? Object.keys(req.cookies) : [],
            authorization: req.headers.authorization
              ? req.headers.authorization.split(' ')[0]
              : undefined,
          },
          response: {
            contentType: res.getHeader('content-type') as string,
            contentLength: responseSize,
            cached: res.getHeader('x-cache') === 'HIT',
            compressed: !!res.getHeader('content-encoding'),
          },
          client: {
            ip: clientIp,
            userAgent,
            device: parsedDevice.type,
            os: parsedDevice.os,
            browser: parsedDevice.browser,
          },
          server: {
            host: req.hostname,
            environment: process.env.NODE_ENV || 'development',
            nodeVersion: process.version,
            pid: process.pid,
            memory: process.memoryUsage(),
          },
          error: errorDetails,
          level: logLevel,
          message: `${req.method} ${req.path} ${statusCode} ${duration}ms`,
        };

        // Save to database asynchronously (don't block response)
        ServerLogModel.create(logEntry).catch((err) => {
          // eslint-disable-next-line no-console
          console.error('Failed to save server log:', err.message);
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Server logger error:', err);
      }
    });

    next();
  };
}
