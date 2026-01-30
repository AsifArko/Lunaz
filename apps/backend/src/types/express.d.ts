import type { UserSummary } from '@lunaz/types';

declare global {
  namespace Express {
    interface Request {
      user?: UserSummary;
    }
  }
}

export {};
