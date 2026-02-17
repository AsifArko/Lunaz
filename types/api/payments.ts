import type { Payment } from '../../interfaces/payment';
import type { PaginatedResponse } from '../../interfaces/common';

/** Response for listing payments. */
export type ListPaymentsResponse = PaginatedResponse<Payment>;

/** Response for single payment. */
export type PaymentResponse = Payment;
