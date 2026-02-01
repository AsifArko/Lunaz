import type { Id } from '../user.js';
import type { PaymentMethod, PaymentStatus } from '../enums.js';
import type { Payment, BankAccount, PaymentMethodInfo } from '../payment.js';
import type { ListQueryParams, PaginatedResponse } from './common.js';

/** Request to initiate a payment. */
export interface InitiatePaymentRequest {
  orderId: string;
  method: PaymentMethod;
}

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

/** Request to submit bank transfer proof. */
export interface SubmitBankTransferProofRequest {
  transactionReference: string;
  bankName?: string;
}

/** Request to verify bank transfer (admin). */
export interface VerifyBankTransferRequest {
  verified: boolean;
  notes?: string;
}

/** Request to process refund (admin). */
export interface RefundPaymentRequest {
  amount: number;
  reason: string;
}

/** Query params for listing payments (admin). */
export interface ListPaymentsQuery extends ListQueryParams {
  status?: PaymentStatus;
  method?: PaymentMethod;
  orderId?: Id;
  userId?: Id;
  from?: string;
  to?: string;
}

/** Response for listing payments. */
export type ListPaymentsResponse = PaginatedResponse<Payment>;

/** Response for single payment. */
export type PaymentResponse = Payment;

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

/** Response for available payment methods. */
export interface AvailablePaymentMethodsResponse {
  methods: PaymentMethodInfo[];
}

/** bKash callback query parameters. */
export interface BkashCallbackParams {
  paymentID: string;
  status: 'success' | 'failure' | 'cancel';
}

/** Nagad callback parameters. */
export interface NagadCallbackParams {
  payment_ref_id?: string;
  paymentRefId?: string;
  status?: string;
}

/** SSLCommerz IPN data. */
export interface SSLCommerzIPNData {
  tran_id: string;
  val_id: string;
  amount: string;
  card_type?: string;
  card_no?: string;
  card_issuer?: string;
  card_brand?: string;
  card_issuer_country?: string;
  bank_tran_id?: string;
  status: string;
  value_a?: string;
  value_b?: string;
  [key: string]: unknown;
}
