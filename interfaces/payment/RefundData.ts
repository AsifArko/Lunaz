import type { Id } from 'types/id';

/** Refund details. */
export interface RefundData {
  amount: number;
  reason: string;
  refundedAt: string;
  refundTransactionId?: string;
  refundedBy?: Id;
}
