import type { UserSummary } from '../../user';

/** POST /auth/refresh response (same shape; may omit user if not re-fetched) */
export interface RefreshResponse {
  token: string;
  refreshToken: string;
  user: UserSummary;
  expiresIn?: string;
}
