import type { Id } from 'types/id';
import type { PaymentMethod, PaymentStatus } from 'constants/enums';
import type { BkashPaymentData } from './BkashPaymentData';
import type { NagadPaymentData } from './NagadPaymentData';
import type { BankTransferPaymentData } from './BankTransferPaymentData';
import type { CardPaymentData } from './CardPaymentData';
import type { RefundData } from './RefundData';

/** Payment entity. */
export interface Payment {
  id: Id;
  orderId: Id;
  /** Order number (when orderId is populated in list responses). */
  orderNumber?: string;
  userId: Id;
  /** Customer name (when userId is populated in list responses). */
  customerName?: string;
  /** Customer email (when userId is populated in list responses). */
  customerEmail?: string;
  /** Customer phone (when userId is populated in list responses). */
  customerPhone?: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  gatewayTransactionId?: string;
  gatewayPaymentId?: string;
  gatewayResponse?: Record<string, unknown>;
  bkash?: BkashPaymentData;
  nagad?: NagadPaymentData;
  bankTransfer?: BankTransferPaymentData;
  card?: CardPaymentData;
  refund?: RefundData;
  ipAddress?: string;
  userAgent?: string;
  failureReason?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
