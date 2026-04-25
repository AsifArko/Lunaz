/** Request to submit bank transfer proof. */
export interface SubmitBankTransferProofRequest {
  transactionReference: string;
  bankName?: string;
}
