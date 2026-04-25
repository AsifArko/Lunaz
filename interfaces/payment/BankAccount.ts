/** Bank account configuration for bank transfers. */
export interface BankAccount {
  id?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchName?: string;
  routingNumber?: string;
  isActive: boolean;
}
