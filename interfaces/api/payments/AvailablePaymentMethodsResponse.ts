import type { PaymentMethodInfo } from 'interfaces/payment';

/** Response for available payment methods. */
export interface AvailablePaymentMethodsResponse {
  methods: PaymentMethodInfo[];
}
