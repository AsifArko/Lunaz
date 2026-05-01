import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const code = (err as { statusCode?: number }).statusCode ?? 500;
  // Expose real message for 4xx (user-actionable); hide for 5xx
  const message =
    code >= 400 && code < 500
      ? err.message
      : process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

  const context = {
    requestId: res.getHeader('X-Request-ID') as string | undefined,
    path: req.path,
    method: req.method,
  };

  if (code >= 500) {
    logger.errorException(err, `Unhandled error: ${err.message}`, context);
  } else {
    logger.warn(`Client error ${code}: ${err.message}`, context);
  }

  res.status(code).json({
    error: {
      code: code >= 500 ? 'INTERNAL_ERROR' : 'ERROR',
      message,
    },
  });
}
