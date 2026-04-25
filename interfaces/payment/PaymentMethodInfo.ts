import type { PaymentMethod } from 'constants/enums';

/** Payment method info for display. */
export interface PaymentMethodInfo {
  id: PaymentMethod;
  name: string;
  description: string;
  enabled: boolean;
  icon?: string;
}
