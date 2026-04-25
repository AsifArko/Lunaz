import mongoose from 'mongoose';

const complianceActivitySchema = new mongoose.Schema(
  {
    activityType: {
      type: String,
      enum: [
        'tax_record_created',
        'tax_record_updated',
        'tax_payment_made',
        'tax_filed',
        'certificate_added',
        'certificate_renewed',
        'certificate_expired',
        'document_uploaded',
        'document_updated',
        'director_added',
        'director_removed',
        'reminder_sent',
        'compliance_verified',
        'authenticity_updated',
        'other',
      ],
      required: true,
    },
    description: { type: String, required: true },
    entityType: {
      type: String,
      enum: ['tax_record', 'certificate', 'document', 'authenticity', 'other'],
      required: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    entityName: String, // For quick reference without lookup

    // Change details
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,

    // Metadata
    ipAddress: String,
    userAgent: String,

    // Actor
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes
complianceActivitySchema.index({ entityType: 1, entityId: 1 });
complianceActivitySchema.index({ activityType: 1 });
complianceActivitySchema.index({ performedBy: 1 });
complianceActivitySchema.index({ createdAt: -1 });

export const ComplianceActivityModel = mongoose.model(
  'ComplianceActivity',
  complianceActivitySchema
);

// Helper function to log activity
export async function logComplianceActivity(data: {
  activityType: string;
  description: string;
  entityType: string;
  entityId: mongoose.Types.ObjectId;
  entityName?: string;
  previousValue?: unknown;
  newValue?: unknown;
  performedBy: mongoose.Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
}) {
  return ComplianceActivityModel.create(data);
}
