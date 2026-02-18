import mongoose from 'mongoose';
import { PaymentMethod, PaymentStatus } from '../../constants/enums';

const bkashDataSchema = new mongoose.Schema(
  {
    paymentID: String,
    trxID: String,
    agreementID: String,
    payerReference: String,
    customerMsisdn: String,
  },
  { _id: false }
);

const nagadDataSchema = new mongoose.Schema(
  {
    paymentRefId: String,
    orderId: String,
    issuerPaymentRefNo: String,
    clientMobileNo: String,
  },
  { _id: false }
);

const bankTransferDataSchema = new mongoose.Schema(
  {
    bankName: String,
    accountNumber: String,
    transactionReference: String,
    transferDate: Date,
    proofUrl: String,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    notes: String,
  },
  { _id: false }
);

const cardDataSchema = new mongoose.Schema(
  {
    sessionKey: String,
    transactionId: String,
    validationId: String,
    cardType: String,
    cardNo: String, // Masked: ****1234
    cardIssuer: String,
    cardBrand: String,
    cardIssuerCountry: String,
  },
  { _id: false }
);

const refundDataSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    refundedAt: { type: Date, required: true },
    refundTransactionId: String,
    refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    // References
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Payment Details
    method: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'BDT',
    },

    // Gateway Response
    gatewayTransactionId: String,
    gatewayPaymentId: String,
    gatewayResponse: mongoose.Schema.Types.Mixed,

    // Provider-specific data
    bkash: bkashDataSchema,
    nagad: nagadDataSchema,
    bankTransfer: bankTransferDataSchema,
    card: cardDataSchema,

    // Refund Details
    refund: refundDataSchema,

    // Metadata
    ipAddress: String,
    userAgent: String,
    failureReason: String,
    expiresAt: Date,
  },
  { timestamps: true }
);

// Indexes
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ method: 1 });
paymentSchema.index({ gatewayTransactionId: 1 });
paymentSchema.index({ 'bkash.paymentID': 1 });
paymentSchema.index({ 'nagad.paymentRefId': 1 });
paymentSchema.index({ createdAt: -1 });

export const PaymentModel = mongoose.model('Payment', paymentSchema);

// Type for Payment document
export type PaymentDocument = mongoose.Document & mongoose.InferSchemaType<typeof paymentSchema>;
