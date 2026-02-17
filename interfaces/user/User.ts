import type { Id } from '../../types/id';
import type { UserRole } from '../../constants/enums';
import type { Address } from './Address';

/** User entity (DB shape; omit passwordHash in API responses). */
export interface User {
  id: Id;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  emailVerified?: boolean;
  addresses?: Address[];
  createdAt: string;
  updatedAt: string;
}
