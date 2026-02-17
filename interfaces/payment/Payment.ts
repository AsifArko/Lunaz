import type { Id } from '../../types/id';
import type { PaymentMethod, PaymentStatus } from '../../constants/enums';
import type { BkashPaymentData } from './BkashPaymentData';
import type { NagadPaymentData } from './NagadPaymentData';
import type { BankTransferPaymentData } from './BankTransferPaymentData';
import type { CardPaymentData } from './CardPaymentData';
import type { RefundData } from './RefundData';

/** Payment entity. */
export interface Payment {
  id: Id;
  orderId: Id;
  userId: Id;
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
