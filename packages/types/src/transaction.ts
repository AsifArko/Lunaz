import type { Id } from './user.js';
import type { TransactionType, TransactionStatus } from './enums.js';

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
