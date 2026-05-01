import type { PaymentStatus, PaymentMethod } from 'constants/enums';

/** Response for payment status check. */
export interface PaymentStatusResponse {
  paymentId: string;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: number;
  currency: string;
  paidAt?: string;
  failureReason?: string;
}
