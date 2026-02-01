import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    daysBefore: [{ type: Number }], // e.g., [30, 14, 7, 1]
    notifyEmail: [String],
    lastNotified: Date,
  },
  { _id: false }
);

const certificateSchema = new mongoose.Schema(
  {
    // Basic Information
    certificateType: {
      type: String,
      enum: [
        'trade_license',
        'fire_safety',
        'health_safety',
        'environmental',
        'import_license',
        'export_license',
        'quality_certification',
        'insurance',
        'professional_license',
        'tax_clearance',
        'other',
      ],
      required: true,
    },
    certificateNumber: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    category: String,

    // Issuing Details
    issuingAuthority: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: Date,

    // Status
    status: {
      type: String,
      enum: ['active', 'expired', 'suspended', 'revoked', 'pending_renewal'],
      default: 'active',
    },

    // Renewal Information
    renewalRequired: { type: Boolean, default: true },
    renewalDate: Date,
    renewalFee: Number,
    renewalCurrency: { type: String, default: 'BDT' },
    renewalProcess: String, // Description of renewal process

    // Documents
    certificateFile: { type: String, required: true }, // S3 URL
    supportingDocuments: [
      {
        name: String,
        description: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Renewal History
    renewalHistory: [
      {
        renewalDate: Date,
        previousExpiryDate: Date,
        newExpiryDate: Date,
        fee: Number,
        certificateFile: String,
        processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        notes: String,
      },
    ],

    // Reminders
    reminder: {
      type: reminderSchema,
      default: () => ({
        enabled: true,
        daysBefore: [30, 14, 7, 1],
        notifyEmail: [],
      }),
    },

    // Tags for searchability
    tags: [String],

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

// Virtual for days until expiry
certificateSchema.virtual('daysUntilExpiry').get(function () {
  if (!this.expiryDate) return null;
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for expiry status
certificateSchema.virtual('expiryStatus').get(function () {
  const days = this.daysUntilExpiry;
  if (days === null) return 'no_expiry';
  if (days < 0) return 'expired';
  if (days <= 7) return 'critical';
  if (days <= 30) return 'warning';
  return 'ok';
});

// Pre-save to update status based on expiry
certificateSchema.pre('save', function (next) {
  if (this.expiryDate && new Date() > this.expiryDate) {
    this.status = 'expired';
  }
  next();
});

// Indexes
certificateSchema.index({ certificateType: 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ expiryDate: 1 });
certificateSchema.index({ tags: 1 });
certificateSchema.index({ certificateNumber: 1 }, { unique: true });

export const CertificateModel = mongoose.model('Certificate', certificateSchema);
