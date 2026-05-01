/** Request to process refund (admin). */
export interface RefundPaymentRequest {
  amount: number;
  reason: string;
}
