import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt.js';
import type { BackendEnv } from '../config/env.js';

export function authMiddleware(getConfig: () => BackendEnv) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
      res
        .status(401)
        .json({ error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' } });
      return;
    }

    try {
      const { JWT_SECRET } = getConfig();
      req.user = verifyToken(token, JWT_SECRET);
      next();
    } catch {
      res
        .status(401)
        .json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
    }
  };
}
