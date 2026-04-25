/** Request to verify bank transfer (admin). */
export interface VerifyBankTransferRequest {
  verified: boolean;
  notes?: string;
}
