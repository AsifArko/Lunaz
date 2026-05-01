import mongoose from 'mongoose';

const taxDeductionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        'operating_expenses',
        'depreciation',
        'business_development',
        'professional_services',
        'insurance',
        'interest',
        'donations',
        'other',
      ],
      required: true,
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    supportingDocument: { type: String }, // S3 URL
  },
  { _id: true }
);

const taxPaymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'online', 'cheque', 'cash'],
      required: true,
    },
    referenceNumber: { type: String, required: true },
    receipt: { type: String }, // S3 URL
    notes: String,
  },
  { _id: true, timestamps: true }
);

const taxRecordSchema = new mongoose.Schema(
  {
    fiscalYear: {
      type: String,
      required: true,
      match: /^\d{4}-\d{4}$/, // Format: 2024-2025
    },
    taxType: {
      type: String,
      enum: ['income_tax', 'corporate_tax', 'vat', 'sales_tax', 'withholding_tax', 'other'],
      required: true,
    },
    period: {
      type: String,
      enum: ['monthly', 'quarterly', 'half_yearly', 'annual'],
      required: true,
    },
    periodMonth: Number, // 1-12 for monthly
    periodQuarter: Number, // 1-4 for quarterly

    // Income details
    grossIncome: { type: Number, required: true, min: 0 },
    deductions: [taxDeductionSchema],
    totalDeductions: { type: Number, default: 0 },
    taxableIncome: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, required: true, min: 0, max: 100 },
    taxAmount: { type: Number, required: true, min: 0 },

    // Payment tracking
    dueDate: { type: Date, required: true },
    payments: [taxPaymentSchema],
    totalPaid: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue'],
      default: 'pending',
    },

    // Filing details
    filingStatus: {
      type: String,
      enum: ['not_filed', 'draft', 'submitted', 'accepted', 'rejected'],
      default: 'not_filed',
    },
    filingDate: Date,
    acknowledgmentNumber: String,
    filedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Documents
    attachments: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Audit
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for balance due
taxRecordSchema.virtual('balanceDue').get(function () {
  return this.taxAmount - this.totalPaid;
});

// Pre-save middleware to calculate totals
taxRecordSchema.pre('save', function (next) {
  this.totalDeductions = this.deductions.reduce((sum, d) => sum + d.amount, 0);
  this.totalPaid = this.payments.reduce((sum, p) => sum + p.amount, 0);

  // Update payment status
  if (this.totalPaid >= this.taxAmount) {
    this.paymentStatus = 'paid';
  } else if (this.totalPaid > 0) {
    this.paymentStatus = 'partial';
  } else if (new Date() > this.dueDate) {
    this.paymentStatus = 'overdue';
  } else {
    this.paymentStatus = 'pending';
  }

  next();
});

// Indexes
taxRecordSchema.index({ fiscalYear: 1, taxType: 1, period: 1 });
taxRecordSchema.index({ paymentStatus: 1 });
taxRecordSchema.index({ dueDate: 1 });

export const TaxRecordModel = mongoose.model('TaxRecord', taxRecordSchema);
