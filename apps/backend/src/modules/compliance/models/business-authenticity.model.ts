import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    street: String,
    city: { type: String, required: true },
    state: String,
    postalCode: String,
    country: { type: String, required: true, default: 'Bangladesh' },
  },
  { _id: false }
);

const directorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ['owner', 'director', 'partner', 'shareholder', 'authorized_signatory'],
      required: true,
    },
    ownershipPercentage: { type: Number, min: 0, max: 100 },
    identityType: {
      type: String,
      enum: ['nid', 'passport', 'driving_license'],
      required: true,
    },
    identityNumber: { type: String, required: true },
    address: addressSchema,
    phone: String,
    email: String,
    appointmentDate: Date,
    resignationDate: Date,
    isActive: { type: Boolean, default: true },
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { _id: true, timestamps: true }
);

const taxIdentifierSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['tin', 'bin', 'vat', 'iec', 'gst', 'other'],
      required: true,
    },
    number: { type: String, required: true },
    issueDate: Date,
    expiryDate: Date,
    issuingAuthority: String,
    certificate: String, // S3 URL
    status: {
      type: String,
      enum: ['active', 'expired', 'suspended', 'cancelled'],
      default: 'active',
    },
  },
  { _id: true }
);

const businessAuthenticitySchema = new mongoose.Schema(
  {
    // Business Registration
    registrationType: {
      type: String,
      enum: ['sole_proprietorship', 'partnership', 'llc', 'corporation', 'cooperative', 'ngo'],
      required: true,
    },
    legalName: { type: String, required: true },
    tradingName: String,
    registrationNumber: { type: String, required: true, unique: true },
    registrationDate: { type: Date, required: true },
    registrationAuthority: { type: String, required: true },
    registeredAddress: { type: addressSchema, required: true },

    // Registration Status
    status: {
      type: String,
      enum: ['active', 'suspended', 'cancelled', 'dissolved'],
      default: 'active',
    },
    expiryDate: Date,
    lastRenewalDate: Date,
    nextRenewalDate: Date,

    // Tax Identifiers
    taxIdentifiers: [taxIdentifierSchema],

    // Ownership & Directors
    directors: [directorSchema],

    // Capital Information
    authorizedCapital: Number,
    paidUpCapital: Number,
    capitalCurrency: { type: String, default: 'BDT' },

    // Documents
    registrationCertificate: String, // S3 URL
    memorandumOfAssociation: String,
    articlesOfAssociation: String,
    additionalDocuments: [
      {
        name: String,
        description: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Audit Trail
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Indexes (registrationNumber unique index is already defined in schema)
businessAuthenticitySchema.index({ status: 1 });
businessAuthenticitySchema.index({ 'taxIdentifiers.type': 1, 'taxIdentifiers.number': 1 });

export const BusinessAuthenticityModel = mongoose.model(
  'BusinessAuthenticity',
  businessAuthenticitySchema
);

// Singleton pattern - get the single business record
export async function getBusinessAuthenticity() {
  const record = await BusinessAuthenticityModel.findOne();
  return record;
}
