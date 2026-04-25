import type { BankAccount } from './BankAccount';

/** Bank transfer payment settings. */
export interface BankTransferSettings {
  enabled: boolean;
  accounts: BankAccount[];
  instructions?: string;
  expiryHours: number;
}
