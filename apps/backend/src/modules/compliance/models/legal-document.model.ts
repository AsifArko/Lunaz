import mongoose from 'mongoose';

const partySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: String, // e.g., "Lessor", "Lessee", "Vendor"
    contact: String,
    address: String,
  },
  { _id: true }
);

const versionSchema = new mongoose.Schema(
  {
    versionNumber: { type: Number, required: true },
    file: { type: String, required: true }, // S3 URL
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changeDescription: String,
  },
  { _id: true }
);

const legalDocumentSchema = new mongoose.Schema(
  {
    // Basic Information
    title: { type: String, required: true },
    documentNumber: String,
    category: {
      type: String,
      enum: [
        'incorporation',
        'contracts',
        'employment',
        'intellectual_property',
        'real_estate',
        'financial',
        'legal_proceedings',
        'compliance',
        'insurance',
        'miscellaneous',
      ],
      required: true,
    },
    subCategory: String,
    description: String,

    // Parties
    parties: [partySchema],

    // Dates
    effectiveDate: Date,
    expiryDate: Date,
    executionDate: Date, // Date document was signed

    // Status
    status: {
      type: String,
      enum: ['draft', 'active', 'expired', 'terminated', 'superseded', 'archived'],
      default: 'draft',
    },

    // Document Files
    currentVersion: { type: Number, default: 1 },
    currentFile: { type: String, required: true }, // S3 URL
    versions: [versionSchema],

    // Supporting Documents
    attachments: [
      {
        name: String,
        description: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Access Control
    accessLevel: {
      type: String,
      enum: ['public', 'internal', 'restricted', 'confidential'],
      default: 'internal',
    },
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Searchability
    tags: [String],
    keywords: [String],

    // Related Documents
    relatedDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LegalDocument' }],

    // Reminders
    reminderEnabled: { type: Boolean, default: false },
    reminderDate: Date,
    reminderRecipients: [String],

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
legalDocumentSchema.virtual('daysUntilExpiry').get(function () {
  if (!this.expiryDate) return null;
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Text index for search
legalDocumentSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  keywords: 'text',
});

// Regular indexes
legalDocumentSchema.index({ category: 1 });
legalDocumentSchema.index({ status: 1 });
legalDocumentSchema.index({ expiryDate: 1 });
legalDocumentSchema.index({ accessLevel: 1 });
legalDocumentSchema.index({ createdAt: -1 });

export const LegalDocumentModel = mongoose.model('LegalDocument', legalDocumentSchema);
