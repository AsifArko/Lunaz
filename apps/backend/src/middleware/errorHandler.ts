import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const code = (err as { statusCode?: number }).statusCode ?? 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(code).json({
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
  });
}
