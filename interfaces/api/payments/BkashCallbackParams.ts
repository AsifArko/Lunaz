/** bKash callback query parameters. */
export interface BkashCallbackParams {
  paymentID: string;
  status: 'success' | 'failure' | 'cancel';
}
