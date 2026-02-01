import mongoose from 'mongoose';
import { TransactionType, TransactionStatus } from '@lunaz/types';

const transactionSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    type: { type: String, enum: Object.values(TransactionType), required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    paymentMethod: { type: String, required: true },
    externalId: String,
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

transactionSchema.index({ orderId: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ createdAt: -1 });

export const TransactionModel = mongoose.model('Transaction', transactionSchema);

// Payout model
const payoutSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
    reference: String,
    completedAt: Date,
  },
  { timestamps: true }
);

payoutSchema.index({ createdAt: -1 });
payoutSchema.index({ status: 1 });

export const PayoutModel = mongoose.model('Payout', payoutSchema);
