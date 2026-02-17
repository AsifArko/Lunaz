import type { Id } from '../../types/id';
import type { UserRole } from '../../constants/enums';

/** User summary (for JWT payload / list). */
export interface UserSummary {
  id: Id;
  email: string;
  name: string;
  role: UserRole;
}
