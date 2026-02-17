import type { UserSummary } from '../../user';

/** POST /auth/login, /auth/register, /auth/refresh, /auth/oauth/* response */
export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: UserSummary;
  expiresIn?: string;
}
