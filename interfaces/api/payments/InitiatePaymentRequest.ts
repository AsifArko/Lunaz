import type { PaymentMethod } from 'constants/enums';

/** Request to initiate a payment. */
export interface InitiatePaymentRequest {
  orderId: string;
  method: PaymentMethod;
}
