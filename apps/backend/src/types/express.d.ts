import type { UserSummary } from 'types';

declare global {
  namespace Express {
    interface Request {
      user?: UserSummary;
    }
  }
}

export {};
