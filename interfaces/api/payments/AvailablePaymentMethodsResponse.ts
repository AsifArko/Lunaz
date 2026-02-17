import type { PaymentMethodInfo } from '../../payment';

/** Response for available payment methods. */
export interface AvailablePaymentMethodsResponse {
  methods: PaymentMethodInfo[];
}
