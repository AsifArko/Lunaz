/** bKash-specific payment data. */
export interface BkashPaymentData {
  paymentID?: string;
  trxID?: string;
  agreementID?: string;
  payerReference?: string;
  customerMsisdn?: string;
}
