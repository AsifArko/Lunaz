import type { UserSummary } from 'interfaces/user';

/** OAuth: when phone is required for new user */
export interface OAuthRequiresPhoneResponse {
  requiresPhone: true;
  user: Partial<UserSummary> & { id: string; email: string; name: string };
  token: string;
  refreshToken: string;
  expiresIn?: string;
}
