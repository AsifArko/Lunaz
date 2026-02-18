import { z } from 'zod';
import { PaymentMethod, PaymentStatus } from 'constants/enums';

export const initiatePaymentSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    method: z.enum(
      [
        PaymentMethod.BKASH,
        PaymentMethod.NAGAD,
        PaymentMethod.BANK_TRANSFER,
        PaymentMethod.CARD,
        PaymentMethod.CASH_ON_DELIVERY,
      ],
      { errorMap: () => ({ message: 'Invalid payment method' }) }
    ),
  }),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>['body'];

export const submitBankTransferProofSchema = z.object({
  body: z.object({
    transactionReference: z.string().min(1, 'Transaction reference is required'),
    bankName: z.string().optional(),
  }),
});

export type SubmitBankTransferProofInput = z.infer<typeof submitBankTransferProofSchema>['body'];

export const verifyBankTransferSchema = z.object({
  body: z.object({
    verified: z.boolean(),
    notes: z.string().max(500).optional(),
  }),
});

export type VerifyBankTransferInput = z.infer<typeof verifyBankTransferSchema>['body'];

export const refundPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    reason: z.string().min(1).max(500, 'Reason must be 500 characters or less'),
  }),
});

export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>['body'];

export const listPaymentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z
    .enum([
      PaymentStatus.PENDING,
      PaymentStatus.INITIATED,
      PaymentStatus.PROCESSING,
      PaymentStatus.COMPLETED,
      PaymentStatus.PAID,
      PaymentStatus.FAILED,
      PaymentStatus.CANCELLED,
      PaymentStatus.REFUNDED,
      PaymentStatus.PARTIALLY_REFUNDED,
      PaymentStatus.EXPIRED,
    ])
    .optional(),
  method: z
    .enum([
      PaymentMethod.BKASH,
      PaymentMethod.NAGAD,
      PaymentMethod.BANK_TRANSFER,
      PaymentMethod.CARD,
      PaymentMethod.CASH_ON_DELIVERY,
    ])
    .optional(),
  orderId: z.string().optional(),
  userId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>;

// bKash callback validation
export const bkashCallbackSchema = z.object({
  query: z.object({
    paymentID: z.string(),
    status: z.enum(['success', 'failure', 'cancel']),
  }),
});

export type BkashCallbackInput = z.infer<typeof bkashCallbackSchema>['query'];

// Nagad callback validation
export const nagadCallbackSchema = z.object({
  query: z.object({
    payment_ref_id: z.string().optional(),
    paymentRefId: z.string().optional(),
    status: z.string().optional(),
  }),
});

export type NagadCallbackInput = z.infer<typeof nagadCallbackSchema>['query'];
