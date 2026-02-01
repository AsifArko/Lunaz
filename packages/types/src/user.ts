import type { UserRole } from './enums.js';

/** API id type (ObjectId as string). */
export type Id = string;

/** Address (embedded or standalone). */
export interface Address {
  id: Id;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

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

/** User summary (for JWT payload / list). */
export interface UserSummary {
  id: Id;
  email: string;
  name: string;
  role: UserRole;
}
