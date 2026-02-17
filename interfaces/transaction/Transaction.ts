import type { Id } from '../../types/id';
import type { TransactionType, TransactionStatus } from '../../constants/enums';

/** Transaction (payment record). */
export interface Transaction {
  id: Id;
  orderId: Id;
  type: TransactionType;
  amount: number;
  currency: string;
  paymentMethod: string;
  externalId?: string;
  status: TransactionStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
