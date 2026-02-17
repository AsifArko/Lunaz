import type { BankAccount } from '../../payment';

/** Response from initiating a payment. */
export interface InitiatePaymentResponse {
  paymentId: string;
  redirectUrl?: string;
  bankDetails?: BankAccount[];
  instructions?: string;
  orderReference?: string;
  amount?: number;
  currency?: string;
  expiresAt?: string;
}
