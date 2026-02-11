import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const code = (err as { statusCode?: number }).statusCode ?? 500;
  // Expose real message for 4xx (user-actionable); hide for 5xx
  const message =
    code >= 400 && code < 500
      ? err.message
      : process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;
  res.status(code).json({
    error: {
      code: code >= 500 ? 'INTERNAL_ERROR' : 'ERROR',
      message,
    },
  });
}
