import type { Id } from '../../types/id';

/** Bank transfer-specific payment data. */
export interface BankTransferPaymentData {
  bankName?: string;
  accountNumber?: string;
  transactionReference?: string;
  transferDate?: string;
  proofUrl?: string;
  verifiedBy?: Id;
  verifiedAt?: string;
  notes?: string;
}
