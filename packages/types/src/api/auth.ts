import type { UserRole } from '../enums.js';
import type { UserSummary } from '../user.js';

/** POST /auth/register */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
}

/** POST /auth/login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /auth/login, /auth/register, /auth/refresh, /auth/oauth/* response */
export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: UserSummary;
  expiresIn?: string;
}

/** POST /auth/refresh response (same shape; may omit user if not re-fetched) */
export interface RefreshResponse {
  token: string;
  refreshToken: string;
  user: UserSummary;
  expiresIn?: string;
}

/** OAuth: when phone is required for new user */
export interface OAuthRequiresPhoneResponse {
  requiresPhone: true;
  user: Partial<UserSummary> & { id: string; email: string; name: string };
  token: string;
  refreshToken: string;
  expiresIn?: string;
}

/** GET /auth/me response */
export interface MeResponse extends UserSummary {
  role: UserRole;
}
