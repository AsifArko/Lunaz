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

/** POST /auth/login response */
export interface LoginResponse {
  token: string;
  user: UserSummary;
}

/** GET /auth/me response */
export interface MeResponse extends UserSummary {
  role: UserRole;
}
