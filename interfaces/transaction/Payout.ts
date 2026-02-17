import type { Id } from '../../types/id';
import type { TransactionStatus } from '../../constants/enums';

/** Payout / cash out. */
export interface Payout {
  id: Id;
  amount: number;
  currency: string;
  status: TransactionStatus;
  reference?: string;
  createdAt: string;
  completedAt?: string;
}
