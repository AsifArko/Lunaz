import type { PaymentDocument } from '../payments.model.js';

/**
 * Result of creating a payment with a gateway.
 */
export interface CreatePaymentResult {
  /** URL to redirect user to (for bKash, Nagad, SSLCommerz) */
  redirectUrl?: string;
  /** Bank account details (for bank transfer) */
  bankDetails?: BankAccountInfo[];
  /** Instructions for the user */
  instructions?: string;
  /** Order reference for bank transfer */
  orderReference?: string;
  /** Payment amount */
  amount?: number;
  /** Currency */
  currency?: string;
  /** Payment expiration time */
  expiresAt?: Date;
  /** Gateway-specific payment ID */
  paymentId?: string;
  /** Additional message */
  message?: string;
}

/**
 * Bank account information for display.
 */
export interface BankAccountInfo {
  id?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchName?: string;
  routingNumber?: string;
}

/**
 * Result of processing a refund.
 */
export interface RefundResult {
  /** Refund transaction ID */
  transactionId: string;
  /** Original transaction ID */
  originalTransactionId?: string;
  /** Additional data */
  data?: Record<string, unknown>;
}

/**
 * Order info needed for payment processing.
 */
export interface OrderInfo {
  _id: string;
  orderNumber: string;
  total: number;
  currency: string;
  userId: string;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
}

/**
 * Base interface for all payment gateways.
 */
export interface PaymentGateway {
  /**
   * Create/initiate a payment.
   */
  createPayment(payment: PaymentDocument, order: OrderInfo): Promise<CreatePaymentResult>;

  /**
   * Handle callback/webhook from the payment gateway.
   */
  handleCallback(data: unknown): Promise<PaymentDocument>;

  /**
   * Process a refund.
   */
  refund(payment: PaymentDocument, amount: number): Promise<RefundResult>;

  /**
   * Query payment status from gateway.
   */
  queryStatus?(paymentId: string): Promise<unknown>;
}

export { BankTransferGateway } from './bank-transfer.gateway.js';
export { BkashGateway } from './bkash.gateway.js';
export { NagadGateway } from './nagad.gateway.js';
export { SSLCommerzGateway } from './sslcommerz.gateway.js';
