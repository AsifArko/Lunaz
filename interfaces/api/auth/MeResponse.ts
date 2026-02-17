import type { UserRole } from '../../../constants/enums';
import type { UserSummary } from '../../user';

/** GET /auth/me response */
export interface MeResponse extends UserSummary {
  role: UserRole;
}
