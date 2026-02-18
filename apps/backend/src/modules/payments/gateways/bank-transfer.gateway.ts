import { PaymentStatus } from 'constants/enums';
import { PaymentModel, type PaymentDocument } from '../payments.model.js';
import { getSettings } from '../../settings/settings.model.js';
import type {
  PaymentGateway,
  CreatePaymentResult,
  RefundResult,
  OrderInfo,
  BankAccountInfo,
} from './index.js';

/**
 * Bank Transfer Gateway - handles manual bank transfer payments.
 */
export class BankTransferGateway implements PaymentGateway {
  /**
   * Get bank account details and instructions for the customer.
   */
  async createPayment(payment: PaymentDocument, order: OrderInfo): Promise<CreatePaymentResult> {
    const settings = await getSettings();
    const bankTransferSettings = settings.payments?.bankTransfer;

    const accounts: BankAccountInfo[] =
      bankTransferSettings?.accounts
        ?.filter((a: { isActive?: boolean }) => a.isActive !== false)
        .map(
          (a: {
            _id?: { toString(): string };
            bankName: string;
            accountName: string;
            accountNumber: string;
            branchName?: string | null;
            routingNumber?: string | null;
          }) => ({
            id: a._id?.toString(),
            bankName: a.bankName,
            accountName: a.accountName,
            accountNumber: a.accountNumber,
            branchName: a.branchName ?? undefined,
            routingNumber: a.routingNumber ?? undefined,
          })
        ) || [];

    const expiryHours = bankTransferSettings?.expiryHours || 48;
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    const orderReference = `LN-${order._id.toString().slice(-8).toUpperCase()}`;

    // Update payment status and expiry
    await PaymentModel.findByIdAndUpdate(payment._id, {
      status: PaymentStatus.PENDING,
      expiresAt,
    });

    return {
      bankDetails: accounts,
      instructions:
        bankTransferSettings?.instructions ||
        'Please transfer the exact amount to one of the bank accounts below and submit your transfer receipt.',
      orderReference,
      amount: payment.amount,
      currency: payment.currency,
      expiresAt,
      message: `Please complete the transfer within ${expiryHours} hours.`,
    };
  }

  /**
   * Submit bank transfer proof (customer action).
   */
  async submitProof(
    paymentId: string,
    userId: string,
    proofUrl: string,
    transactionReference: string,
    bankName?: string
  ): Promise<PaymentDocument> {
    const payment = await PaymentModel.findById(paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.userId.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    if (payment.method !== 'bank_transfer') {
      throw new Error('Invalid payment method');
    }

    // Check if expired
    if (payment.expiresAt && payment.expiresAt < new Date()) {
      throw new Error('Payment has expired');
    }

    payment.bankTransfer = {
      ...payment.bankTransfer,
      bankName,
      transactionReference,
      transferDate: new Date(),
      proofUrl,
    };
    payment.status = PaymentStatus.PROCESSING;

    await payment.save();

    return payment;
  }

  /**
   * Bank transfer doesn't have callbacks - verification is manual.
   */
  async handleCallback(_data: unknown): Promise<PaymentDocument> {
    throw new Error('Bank transfer does not support callbacks');
  }

  /**
   * Bank transfer refunds are handled manually.
   */
  async refund(payment: PaymentDocument, amount: number): Promise<RefundResult> {
    // Bank transfer refunds are manual - just return a reference
    return {
      transactionId: `MANUAL_REFUND_${Date.now()}`,
      originalTransactionId: payment.bankTransfer?.transactionReference ?? undefined,
      data: {
        note: 'Bank transfer refund must be processed manually',
        amount,
        bankName: payment.bankTransfer?.bankName,
      },
    };
  }
}
