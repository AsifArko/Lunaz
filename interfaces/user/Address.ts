import type { Id } from 'types/id';

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
