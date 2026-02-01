# Lunaz — Business Compliance Module Specification

## Table of Contents

1. [Overview](#1-overview)
2. [Navigation Structure](#2-navigation-structure)
3. [Module Features](#3-module-features)
4. [Database Schema Design](#4-database-schema-design)
5. [Backend API Design](#5-backend-api-design)
6. [Frontend Components](#6-frontend-components)
7. [User Interface Design](#7-user-interface-design)
8. [Validation & Business Rules](#8-validation--business-rules)
9. [Implementation Phases](#9-implementation-phases)
10. [File Structure](#10-file-structure)

---

## 1. Overview

### 1.1 Purpose

The Business Compliance module provides a centralized hub for managing all administrative and legal requirements for the e-commerce business. This includes tax management, business authenticity documents, certificates, licenses, and compliance tracking.

### 1.2 Goals

- **Centralized Compliance:** Single location for all business compliance documents and records
- **Tax Management:** Track and manage business income tax records, filings, and deadlines
- **Document Repository:** Secure storage for certificates, licenses, and authenticity documents
- **Audit Trail:** Complete history of all compliance-related activities
- **Reminder System:** Automated notifications for expiring documents and upcoming deadlines
- **Compliance Dashboard:** Overview of compliance status and pending actions

### 1.3 Target Users

- Business Owners
- Administrators
- Accountants/Financial Officers
- Compliance Officers

---

## 2. Navigation Structure

### 2.1 New Navigation Section

Add a new `Compliance` section to the sidebar navigation in `Layout.tsx`:

```typescript
{
  title: 'Compliance',
  items: [
    {
      to: '/compliance/dashboard',
      label: 'Compliance Dashboard',
      icon: <ShieldCheckIcon />
    },
    {
      to: '/compliance/income-tax',
      label: 'Income Tax',
      icon: <ReceiptTaxIcon />
    },
    {
      to: '/compliance/authenticity',
      label: 'Business Authenticity',
      icon: <BadgeCheckIcon />
    },
    {
      to: '/compliance/certificates',
      label: 'Certificates & Licenses',
      icon: <DocumentTextIcon />
    },
    {
      to: '/compliance/documents',
      label: 'Legal Documents',
      icon: <FolderIcon />
    },
  ],
}
```

### 2.2 Route Configuration

```typescript
// apps/manage/src/App.tsx routes
{
  path: 'compliance',
  children: [
    { path: 'dashboard', element: <ComplianceDashboard /> },
    { path: 'income-tax', element: <IncomeTaxPage /> },
    { path: 'income-tax/:id', element: <IncomeTaxDetailPage /> },
    { path: 'authenticity', element: <BusinessAuthenticityPage /> },
    { path: 'certificates', element: <CertificatesPage /> },
    { path: 'certificates/:id', element: <CertificateDetailPage /> },
    { path: 'documents', element: <LegalDocumentsPage /> },
    { path: 'documents/:id', element: <DocumentDetailPage /> },
  ]
}
```

---

## 3. Module Features

### 3.1 Compliance Dashboard

Central overview of all compliance-related information:

| Widget | Description |
|--------|-------------|
| Compliance Score | Visual indicator (0-100%) of overall compliance status |
| Expiring Soon | List of documents/certificates expiring within 30 days |
| Pending Actions | Tasks requiring immediate attention |
| Recent Activity | Timeline of recent compliance updates |
| Tax Summary | Current tax year overview |
| Quick Actions | Shortcuts to common tasks |

### 3.2 Income Tax Management

#### 3.2.1 Tax Records
| Field | Type | Description |
|-------|------|-------------|
| Fiscal Year | select | Tax year (e.g., 2024-2025) |
| Tax Type | enum | VAT, Income Tax, Corporate Tax, etc. |
| Gross Income | number | Total business income |
| Taxable Income | number | Income after deductions |
| Tax Amount | number | Calculated tax liability |
| Deductions | array | List of applicable deductions |
| Payment Status | enum | Pending, Partial, Paid, Overdue |
| Due Date | date | Tax payment deadline |
| Payment Date | date | Actual payment date |
| Payment Reference | string | Transaction/receipt number |
| Attachments | files | Supporting documents |
| Notes | text | Additional notes |

#### 3.2.2 Tax Filing Tracking
| Field | Type | Description |
|-------|------|-------------|
| Filing Type | enum | Monthly, Quarterly, Annual |
| Filing Period | string | Period covered |
| Filing Date | date | Submission date |
| Acknowledgment Number | string | Government receipt number |
| Status | enum | Draft, Submitted, Accepted, Rejected |
| Filed By | string | Person who filed |
| Attachments | files | Filing documents |

#### 3.2.3 Tax Deductions
| Category | Examples |
|----------|----------|
| Operating Expenses | Rent, utilities, salaries |
| Depreciation | Equipment, vehicles, furniture |
| Business Development | Marketing, advertising |
| Professional Services | Legal, accounting, consulting |
| Insurance | Business insurance premiums |
| Interest | Loan interest payments |
| Charitable Donations | Approved donations |

### 3.3 Business Authenticity

#### 3.3.1 Business Registration
| Field | Type | Description |
|-------|------|-------------|
| Registration Type | enum | Sole Proprietorship, Partnership, LLC, Corporation |
| Business Name | string | Registered legal name |
| Trading Name | string | DBA / Trade name |
| Registration Number | string | Government registration ID |
| Registration Date | date | Date of incorporation |
| Registration Authority | string | Issuing government body |
| Registered Address | object | Official business address |
| Status | enum | Active, Suspended, Cancelled |
| Expiry Date | date | Registration expiry (if applicable) |
| Certificate | file | Registration certificate |

#### 3.3.2 Tax Identifiers
| Identifier | Description |
|------------|-------------|
| TIN | Tax Identification Number |
| BIN | Business Identification Number |
| VAT Registration | VAT registration number |
| Import/Export Code | IEC for international trade |
| GST/HST Number | Goods & Services Tax number |

#### 3.3.3 Ownership & Directors
| Field | Type | Description |
|-------|------|-------------|
| Name | string | Full legal name |
| Role | enum | Owner, Director, Partner, Shareholder |
| Ownership Percentage | number | Stake percentage |
| NID/Passport | string | Identity document number |
| Address | object | Residential address |
| Contact | object | Phone, email |
| Appointment Date | date | Date appointed |
| Documents | files | Supporting documents |

### 3.4 Certificates & Licenses

#### 3.4.1 Certificate Types
| Type | Description | Typical Validity |
|------|-------------|------------------|
| Trade License | Permission to conduct business | Annual |
| Fire Safety | Fire department clearance | Annual |
| Health & Safety | Occupational safety compliance | Annual |
| Environmental | Environmental clearance | 1-5 years |
| Import License | Authorization for imports | Variable |
| Export License | Authorization for exports | Variable |
| Industry Specific | Sector-specific permits | Variable |
| Quality Certification | ISO, CE, etc. | 1-3 years |
| Insurance Certificate | Business insurance proof | Annual |
| Professional License | Trade/profession license | Variable |

#### 3.4.2 Certificate Record
| Field | Type | Description |
|-------|------|-------------|
| Certificate Type | enum | Type of certificate |
| Certificate Number | string | Unique identifier |
| Issuing Authority | string | Government/agency name |
| Issue Date | date | Date of issue |
| Expiry Date | date | Expiration date |
| Status | enum | Active, Expired, Suspended, Revoked |
| Renewal Date | date | Next renewal date |
| Renewal Fee | number | Renewal cost |
| Category | string | Classification category |
| Certificate File | file | Uploaded certificate |
| Supporting Docs | files | Additional documents |
| Notes | text | Additional information |
| Reminder | object | Notification settings |

### 3.5 Legal Documents

#### 3.5.1 Document Categories
| Category | Examples |
|----------|----------|
| Incorporation | MOA, AOA, Bylaws |
| Contracts | Vendor, supplier, customer agreements |
| Employment | Employment contracts, policies |
| Intellectual Property | Trademarks, patents, copyrights |
| Real Estate | Lease agreements, property documents |
| Financial | Bank documents, loan agreements |
| Legal Proceedings | Court documents, legal notices |
| Compliance | Policy documents, audit reports |
| Insurance | Insurance policies, claims |
| Miscellaneous | Other important documents |

#### 3.5.2 Document Record
| Field | Type | Description |
|-------|------|-------------|
| Title | string | Document name |
| Category | enum | Document category |
| Document Number | string | Reference number |
| Description | text | Document description |
| Parties Involved | array | Related parties |
| Effective Date | date | Start date |
| Expiry Date | date | End date (if applicable) |
| Status | enum | Active, Expired, Terminated |
| File | file | Uploaded document |
| Version | number | Document version |
| Previous Versions | files | Version history |
| Tags | array | Searchable tags |
| Access Level | enum | Public, Restricted, Confidential |
| Created By | user | Document creator |
| Last Modified | datetime | Last update time |

---

## 4. Database Schema Design

### 4.1 Tax Record Schema

```typescript
// apps/backend/src/modules/compliance/tax-record.model.ts

import mongoose from 'mongoose';

const taxDeductionSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['operating_expenses', 'depreciation', 'business_development', 
           'professional_services', 'insurance', 'interest', 'donations', 'other'],
    required: true
  },
  description: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  supportingDocument: { type: String }, // S3 URL
}, { _id: true });

const taxPaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  paymentDate: { type: Date, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['bank_transfer', 'online', 'cheque', 'cash'],
    required: true 
  },
  referenceNumber: { type: String, required: true },
  receipt: { type: String }, // S3 URL
  notes: String,
}, { _id: true, timestamps: true });

const taxRecordSchema = new mongoose.Schema({
  fiscalYear: { 
    type: String, 
    required: true,
    match: /^\d{4}-\d{4}$/ // Format: 2024-2025
  },
  taxType: {
    type: String,
    enum: ['income_tax', 'corporate_tax', 'vat', 'sales_tax', 'withholding_tax', 'other'],
    required: true
  },
  period: {
    type: String,
    enum: ['monthly', 'quarterly', 'half_yearly', 'annual'],
    required: true
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
    default: 'pending'
  },
  
  // Filing details
  filingStatus: {
    type: String,
    enum: ['not_filed', 'draft', 'submitted', 'accepted', 'rejected'],
    default: 'not_filed'
  },
  filingDate: Date,
  acknowledgmentNumber: String,
  filedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Documents
  attachments: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Audit
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for balance due
taxRecordSchema.virtual('balanceDue').get(function() {
  return this.taxAmount - this.totalPaid;
});

// Pre-save middleware to calculate totals
taxRecordSchema.pre('save', function(next) {
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
```

### 4.2 Business Authenticity Schema

```typescript
// apps/backend/src/modules/compliance/business-authenticity.model.ts

import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: String,
  city: { type: String, required: true },
  state: String,
  postalCode: String,
  country: { type: String, required: true, default: 'Bangladesh' },
}, { _id: false });

const directorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: {
    type: String,
    enum: ['owner', 'director', 'partner', 'shareholder', 'authorized_signatory'],
    required: true
  },
  ownershipPercentage: { type: Number, min: 0, max: 100 },
  identityType: {
    type: String,
    enum: ['nid', 'passport', 'driving_license'],
    required: true
  },
  identityNumber: { type: String, required: true },
  address: addressSchema,
  phone: String,
  email: String,
  appointmentDate: Date,
  resignationDate: Date,
  isActive: { type: Boolean, default: true },
  documents: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
}, { _id: true, timestamps: true });

const taxIdentifierSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['tin', 'bin', 'vat', 'iec', 'gst', 'other'],
    required: true
  },
  number: { type: String, required: true },
  issueDate: Date,
  expiryDate: Date,
  issuingAuthority: String,
  certificate: String, // S3 URL
  status: {
    type: String,
    enum: ['active', 'expired', 'suspended', 'cancelled'],
    default: 'active'
  },
}, { _id: true });

const businessAuthenticitySchema = new mongoose.Schema({
  // Business Registration
  registrationType: {
    type: String,
    enum: ['sole_proprietorship', 'partnership', 'llc', 'corporation', 'cooperative', 'ngo'],
    required: true
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
    default: 'active'
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
  additionalDocuments: [{
    name: String,
    description: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Audit Trail
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Indexes
businessAuthenticitySchema.index({ registrationNumber: 1 }, { unique: true });
businessAuthenticitySchema.index({ status: 1 });
businessAuthenticitySchema.index({ 'taxIdentifiers.type': 1, 'taxIdentifiers.number': 1 });

export const BusinessAuthenticityModel = mongoose.model('BusinessAuthenticity', businessAuthenticitySchema);

// Singleton pattern - only one business record
export async function getBusinessAuthenticity() {
  let record = await BusinessAuthenticityModel.findOne();
  return record;
}
```

### 4.3 Certificate Schema

```typescript
// apps/backend/src/modules/compliance/certificate.model.ts

import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  daysBefore: [{ type: Number }], // e.g., [30, 14, 7, 1]
  notifyEmail: [String],
  lastNotified: Date,
}, { _id: false });

const certificateSchema = new mongoose.Schema({
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
      'other'
    ],
    required: true
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
    default: 'active'
  },
  
  // Renewal Information
  renewalRequired: { type: Boolean, default: true },
  renewalDate: Date,
  renewalFee: Number,
  renewalCurrency: { type: String, default: 'BDT' },
  renewalProcess: String, // Description of renewal process
  
  // Documents
  certificateFile: { type: String, required: true }, // S3 URL
  supportingDocuments: [{
    name: String,
    description: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Renewal History
  renewalHistory: [{
    renewalDate: Date,
    previousExpiryDate: Date,
    newExpiryDate: Date,
    fee: Number,
    certificateFile: String,
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String,
  }],
  
  // Reminders
  reminder: { type: reminderSchema, default: () => ({
    enabled: true,
    daysBefore: [30, 14, 7, 1],
    notifyEmail: []
  })},
  
  // Tags for searchability
  tags: [String],
  
  // Audit
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for days until expiry
certificateSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiryDate) return null;
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for expiry status
certificateSchema.virtual('expiryStatus').get(function() {
  const days = this.daysUntilExpiry;
  if (days === null) return 'no_expiry';
  if (days < 0) return 'expired';
  if (days <= 7) return 'critical';
  if (days <= 30) return 'warning';
  return 'ok';
});

// Pre-save to update status based on expiry
certificateSchema.pre('save', function(next) {
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
```

### 4.4 Legal Document Schema

```typescript
// apps/backend/src/modules/compliance/legal-document.model.ts

import mongoose from 'mongoose';

const partySchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: String, // e.g., "Lessor", "Lessee", "Vendor"
  contact: String,
  address: String,
}, { _id: true });

const versionSchema = new mongoose.Schema({
  versionNumber: { type: Number, required: true },
  file: { type: String, required: true }, // S3 URL
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changeDescription: String,
}, { _id: true });

const legalDocumentSchema = new mongoose.Schema({
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
      'miscellaneous'
    ],
    required: true
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
    default: 'draft'
  },
  
  // Document Files
  currentVersion: { type: Number, default: 1 },
  currentFile: { type: String, required: true }, // S3 URL
  versions: [versionSchema],
  
  // Supporting Documents
  attachments: [{
    name: String,
    description: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Access Control
  accessLevel: {
    type: String,
    enum: ['public', 'internal', 'restricted', 'confidential'],
    default: 'internal'
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
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for days until expiry
legalDocumentSchema.virtual('daysUntilExpiry').get(function() {
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
  keywords: 'text'
});

// Regular indexes
legalDocumentSchema.index({ category: 1 });
legalDocumentSchema.index({ status: 1 });
legalDocumentSchema.index({ expiryDate: 1 });
legalDocumentSchema.index({ accessLevel: 1 });
legalDocumentSchema.index({ createdAt: -1 });

export const LegalDocumentModel = mongoose.model('LegalDocument', legalDocumentSchema);
```

### 4.5 Compliance Activity Log Schema

```typescript
// apps/backend/src/modules/compliance/compliance-activity.model.ts

import mongoose from 'mongoose';

const complianceActivitySchema = new mongoose.Schema({
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
      'other'
    ],
    required: true
  },
  description: { type: String, required: true },
  entityType: {
    type: String,
    enum: ['tax_record', 'certificate', 'document', 'authenticity', 'other'],
    required: true
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
}, { timestamps: true });

// Indexes
complianceActivitySchema.index({ entityType: 1, entityId: 1 });
complianceActivitySchema.index({ activityType: 1 });
complianceActivitySchema.index({ performedBy: 1 });
complianceActivitySchema.index({ createdAt: -1 });

export const ComplianceActivityModel = mongoose.model('ComplianceActivity', complianceActivitySchema);
```

---

## 5. Backend API Design

### 5.1 API Endpoints

```typescript
// Tax Records
GET    /api/compliance/tax-records                    // List all tax records
POST   /api/compliance/tax-records                    // Create tax record
GET    /api/compliance/tax-records/:id                // Get tax record details
PATCH  /api/compliance/tax-records/:id                // Update tax record
DELETE /api/compliance/tax-records/:id                // Delete tax record
POST   /api/compliance/tax-records/:id/payments       // Add payment to tax record
DELETE /api/compliance/tax-records/:id/payments/:pid  // Remove payment
POST   /api/compliance/tax-records/:id/file           // Mark as filed
GET    /api/compliance/tax-records/summary            // Get tax summary/dashboard

// Business Authenticity
GET    /api/compliance/authenticity                   // Get business authenticity
POST   /api/compliance/authenticity                   // Create/set authenticity (singleton)
PATCH  /api/compliance/authenticity                   // Update authenticity
POST   /api/compliance/authenticity/directors         // Add director
PATCH  /api/compliance/authenticity/directors/:id     // Update director
DELETE /api/compliance/authenticity/directors/:id     // Remove director
POST   /api/compliance/authenticity/tax-identifiers   // Add tax identifier
PATCH  /api/compliance/authenticity/tax-identifiers/:id
DELETE /api/compliance/authenticity/tax-identifiers/:id

// Certificates
GET    /api/compliance/certificates                   // List certificates
POST   /api/compliance/certificates                   // Create certificate
GET    /api/compliance/certificates/:id               // Get certificate
PATCH  /api/compliance/certificates/:id               // Update certificate
DELETE /api/compliance/certificates/:id               // Delete certificate
POST   /api/compliance/certificates/:id/renew         // Process renewal

// Legal Documents
GET    /api/compliance/documents                      // List documents
POST   /api/compliance/documents                      // Create document
GET    /api/compliance/documents/:id                  // Get document
PATCH  /api/compliance/documents/:id                  // Update document
DELETE /api/compliance/documents/:id                  // Delete document
POST   /api/compliance/documents/:id/versions         // Upload new version
GET    /api/compliance/documents/:id/versions         // Get version history

// Dashboard & Reports
GET    /api/compliance/dashboard                      // Compliance dashboard data
GET    /api/compliance/expiring                       // Get expiring items
GET    /api/compliance/activity                       // Activity log
GET    /api/compliance/reports/tax-summary            // Tax summary report
GET    /api/compliance/reports/compliance-score       // Compliance score calculation

// File Upload
POST   /api/compliance/upload                         // Upload compliance document
```

### 5.2 Route Implementation

```typescript
// apps/backend/src/modules/compliance/compliance.routes.ts

import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate.js';
import { UserRole } from '@lunaz/types';
import * as complianceService from './compliance.service.js';
import * as validators from './compliance.validation.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware(getConfig));
router.use(requireRole(UserRole.ADMIN));

// Tax Records
router.get('/tax-records', 
  validateQuery(validators.listTaxRecordsQuery),
  complianceService.listTaxRecords
);

router.post('/tax-records',
  validateBody(validators.createTaxRecordSchema),
  complianceService.createTaxRecord
);

router.get('/tax-records/summary', complianceService.getTaxSummary);

router.get('/tax-records/:id',
  validateParams(validators.idParam),
  complianceService.getTaxRecord
);

router.patch('/tax-records/:id',
  validateParams(validators.idParam),
  validateBody(validators.updateTaxRecordSchema),
  complianceService.updateTaxRecord
);

router.delete('/tax-records/:id',
  validateParams(validators.idParam),
  complianceService.deleteTaxRecord
);

router.post('/tax-records/:id/payments',
  validateParams(validators.idParam),
  validateBody(validators.addPaymentSchema),
  complianceService.addTaxPayment
);

// Business Authenticity
router.get('/authenticity', complianceService.getAuthenticity);

router.post('/authenticity',
  validateBody(validators.createAuthenticitySchema),
  complianceService.createAuthenticity
);

router.patch('/authenticity',
  validateBody(validators.updateAuthenticitySchema),
  complianceService.updateAuthenticity
);

router.post('/authenticity/directors',
  validateBody(validators.directorSchema),
  complianceService.addDirector
);

router.patch('/authenticity/directors/:directorId',
  validateParams(validators.directorIdParam),
  validateBody(validators.updateDirectorSchema),
  complianceService.updateDirector
);

router.delete('/authenticity/directors/:directorId',
  validateParams(validators.directorIdParam),
  complianceService.removeDirector
);

// Certificates
router.get('/certificates',
  validateQuery(validators.listCertificatesQuery),
  complianceService.listCertificates
);

router.post('/certificates',
  validateBody(validators.createCertificateSchema),
  complianceService.createCertificate
);

router.get('/certificates/:id',
  validateParams(validators.idParam),
  complianceService.getCertificate
);

router.patch('/certificates/:id',
  validateParams(validators.idParam),
  validateBody(validators.updateCertificateSchema),
  complianceService.updateCertificate
);

router.delete('/certificates/:id',
  validateParams(validators.idParam),
  complianceService.deleteCertificate
);

router.post('/certificates/:id/renew',
  validateParams(validators.idParam),
  validateBody(validators.renewCertificateSchema),
  complianceService.renewCertificate
);

// Legal Documents
router.get('/documents',
  validateQuery(validators.listDocumentsQuery),
  complianceService.listDocuments
);

router.post('/documents',
  validateBody(validators.createDocumentSchema),
  complianceService.createDocument
);

router.get('/documents/:id',
  validateParams(validators.idParam),
  complianceService.getDocument
);

router.patch('/documents/:id',
  validateParams(validators.idParam),
  validateBody(validators.updateDocumentSchema),
  complianceService.updateDocument
);

router.delete('/documents/:id',
  validateParams(validators.idParam),
  complianceService.deleteDocument
);

router.post('/documents/:id/versions',
  validateParams(validators.idParam),
  validateBody(validators.newVersionSchema),
  complianceService.addDocumentVersion
);

// Dashboard & Reports
router.get('/dashboard', complianceService.getDashboard);
router.get('/expiring', complianceService.getExpiringItems);
router.get('/activity', 
  validateQuery(validators.activityQuery),
  complianceService.getActivityLog
);

export const complianceRoutes = router;
```

### 5.3 Validation Schemas

```typescript
// apps/backend/src/modules/compliance/compliance.validation.ts

import { z } from 'zod';

// Tax Record Schemas
export const createTaxRecordSchema = z.object({
  fiscalYear: z.string().regex(/^\d{4}-\d{4}$/, 'Invalid fiscal year format'),
  taxType: z.enum(['income_tax', 'corporate_tax', 'vat', 'sales_tax', 'withholding_tax', 'other']),
  period: z.enum(['monthly', 'quarterly', 'half_yearly', 'annual']),
  periodMonth: z.number().int().min(1).max(12).optional(),
  periodQuarter: z.number().int().min(1).max(4).optional(),
  grossIncome: z.number().min(0),
  deductions: z.array(z.object({
    category: z.enum(['operating_expenses', 'depreciation', 'business_development', 
                      'professional_services', 'insurance', 'interest', 'donations', 'other']),
    description: z.string().min(1),
    amount: z.number().min(0),
    supportingDocument: z.string().url().optional(),
  })).optional().default([]),
  taxableIncome: z.number().min(0),
  taxRate: z.number().min(0).max(100),
  taxAmount: z.number().min(0),
  dueDate: z.string().datetime(),
  notes: z.string().max(2000).optional(),
});

export const updateTaxRecordSchema = createTaxRecordSchema.partial();

export const addPaymentSchema = z.object({
  amount: z.number().positive(),
  paymentDate: z.string().datetime(),
  paymentMethod: z.enum(['bank_transfer', 'online', 'cheque', 'cash']),
  referenceNumber: z.string().min(1),
  receipt: z.string().url().optional(),
  notes: z.string().max(500).optional(),
});

// Business Authenticity Schemas
export const createAuthenticitySchema = z.object({
  registrationType: z.enum(['sole_proprietorship', 'partnership', 'llc', 'corporation', 'cooperative', 'ngo']),
  legalName: z.string().min(1).max(200),
  tradingName: z.string().max(200).optional(),
  registrationNumber: z.string().min(1),
  registrationDate: z.string().datetime(),
  registrationAuthority: z.string().min(1),
  registeredAddress: z.object({
    street: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().default('Bangladesh'),
  }),
  expiryDate: z.string().datetime().optional(),
  authorizedCapital: z.number().min(0).optional(),
  paidUpCapital: z.number().min(0).optional(),
});

export const updateAuthenticitySchema = createAuthenticitySchema.partial();

export const directorSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.enum(['owner', 'director', 'partner', 'shareholder', 'authorized_signatory']),
  ownershipPercentage: z.number().min(0).max(100).optional(),
  identityType: z.enum(['nid', 'passport', 'driving_license']),
  identityNumber: z.string().min(1),
  address: z.object({
    street: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().default('Bangladesh'),
  }).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  appointmentDate: z.string().datetime().optional(),
});

// Certificate Schemas
export const createCertificateSchema = z.object({
  certificateType: z.enum([
    'trade_license', 'fire_safety', 'health_safety', 'environmental',
    'import_license', 'export_license', 'quality_certification',
    'insurance', 'professional_license', 'tax_clearance', 'other'
  ]),
  certificateNumber: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.string().max(100).optional(),
  issuingAuthority: z.string().min(1),
  issueDate: z.string().datetime(),
  expiryDate: z.string().datetime().optional(),
  renewalRequired: z.boolean().default(true),
  renewalFee: z.number().min(0).optional(),
  certificateFile: z.string().url(),
  tags: z.array(z.string()).optional(),
  reminder: z.object({
    enabled: z.boolean().default(true),
    daysBefore: z.array(z.number().int().positive()).default([30, 14, 7, 1]),
    notifyEmail: z.array(z.string().email()).optional(),
  }).optional(),
});

export const updateCertificateSchema = createCertificateSchema.partial();

export const renewCertificateSchema = z.object({
  newExpiryDate: z.string().datetime(),
  fee: z.number().min(0).optional(),
  certificateFile: z.string().url(),
  notes: z.string().max(500).optional(),
});

// Legal Document Schemas
export const createDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  documentNumber: z.string().optional(),
  category: z.enum([
    'incorporation', 'contracts', 'employment', 'intellectual_property',
    'real_estate', 'financial', 'legal_proceedings', 'compliance',
    'insurance', 'miscellaneous'
  ]),
  subCategory: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  parties: z.array(z.object({
    name: z.string().min(1),
    role: z.string().optional(),
    contact: z.string().optional(),
    address: z.string().optional(),
  })).optional(),
  effectiveDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  executionDate: z.string().datetime().optional(),
  status: z.enum(['draft', 'active', 'expired', 'terminated', 'superseded', 'archived']).default('draft'),
  currentFile: z.string().url(),
  accessLevel: z.enum(['public', 'internal', 'restricted', 'confidential']).default('internal'),
  tags: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
});

export const updateDocumentSchema = createDocumentSchema.partial();

export const newVersionSchema = z.object({
  file: z.string().url(),
  changeDescription: z.string().max(500).optional(),
});

// Query Schemas
export const listTaxRecordsQuery = z.object({
  fiscalYear: z.string().optional(),
  taxType: z.string().optional(),
  paymentStatus: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().default('-createdAt'),
});

export const listCertificatesQuery = z.object({
  type: z.string().optional(),
  status: z.string().optional(),
  expiringSoon: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const listDocumentsQuery = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const activityQuery = z.object({
  entityType: z.string().optional(),
  activityType: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export const idParam = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID'),
});

export const directorIdParam = z.object({
  directorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid director ID'),
});
```

---

## 6. Frontend Components

### 6.1 Directory Structure

```
apps/manage/src/features/compliance/
├── index.ts
├── ComplianceDashboard.tsx
├── components/
│   ├── shared/
│   │   ├── ComplianceCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ExpiryIndicator.tsx
│   │   ├── DocumentUpload.tsx
│   │   ├── ActivityTimeline.tsx
│   │   └── ComplianceScore.tsx
│   ├── tax/
│   │   ├── TaxRecordForm.tsx
│   │   ├── TaxRecordCard.tsx
│   │   ├── TaxPaymentModal.tsx
│   │   ├── TaxDeductionList.tsx
│   │   ├── TaxSummaryWidget.tsx
│   │   └── TaxFilingStatus.tsx
│   ├── authenticity/
│   │   ├── BusinessInfoSection.tsx
│   │   ├── TaxIdentifiersList.tsx
│   │   ├── DirectorsList.tsx
│   │   ├── DirectorForm.tsx
│   │   └── RegistrationDetails.tsx
│   ├── certificates/
│   │   ├── CertificateForm.tsx
│   │   ├── CertificateCard.tsx
│   │   ├── CertificateRenewalModal.tsx
│   │   ├── ExpiringCertificatesWidget.tsx
│   │   └── CertificateGrid.tsx
│   └── documents/
│       ├── DocumentForm.tsx
│       ├── DocumentCard.tsx
│       ├── DocumentVersionHistory.tsx
│       ├── DocumentSearch.tsx
│       └── DocumentCategoryNav.tsx
├── pages/
│   ├── IncomeTaxPage.tsx
│   ├── IncomeTaxDetailPage.tsx
│   ├── BusinessAuthenticityPage.tsx
│   ├── CertificatesPage.tsx
│   ├── CertificateDetailPage.tsx
│   ├── LegalDocumentsPage.tsx
│   └── DocumentDetailPage.tsx
├── hooks/
│   ├── useTaxRecords.ts
│   ├── useAuthenticity.ts
│   ├── useCertificates.ts
│   ├── useDocuments.ts
│   └── useComplianceDashboard.ts
├── api/
│   ├── compliance.api.ts
│   └── types.ts
├── types/
│   └── index.ts
└── utils/
    ├── formatters.ts
    └── validators.ts
```

### 6.2 Key Component Examples

#### ComplianceDashboard.tsx
```tsx
export function ComplianceDashboard() {
  const { data, isLoading } = useComplianceDashboard();
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Compliance Dashboard" 
        description="Overview of your business compliance status"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ComplianceScoreCard score={data?.complianceScore} />
        <ExpiringSoonCard items={data?.expiringSoon} />
        <PendingActionsCard actions={data?.pendingActions} />
        <TaxSummaryCard summary={data?.taxSummary} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivityTimeline activities={data?.recentActivity} />
        </div>
        <div>
          <QuickActionsCard />
          <UpcomingDeadlines deadlines={data?.deadlines} />
        </div>
      </div>
    </div>
  );
}
```

---

## 7. User Interface Design

### 7.1 Compliance Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Compliance Dashboard                                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │Compliance│ │Expiring  │ │ Pending  │ │   Tax    │               │
│  │  Score   │ │  Soon    │ │ Actions  │ │ Summary  │               │
│  │   85%    │ │    3     │ │    5     │ │  ৳50,000 │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
│                                                                     │
│  ┌─────────────────────────────────┐ ┌──────────────────────────┐  │
│  │     Recent Activity              │ │    Quick Actions         │  │
│  │  ─────────────────────────────  │ │  • Add Certificate       │  │
│  │  ○ Certificate renewed          │ │  • Record Tax Payment    │  │
│  │  ○ Tax payment recorded         │ │  • Upload Document       │  │
│  │  ○ Document uploaded            │ │  • Update Authenticity   │  │
│  │  ○ Director added               │ ├──────────────────────────┤  │
│  │                                 │ │  Upcoming Deadlines      │  │
│  │                                 │ │  • VAT Due: 15 days      │  │
│  │                                 │ │  • Trade License: 30 days│  │
│  └─────────────────────────────────┘ └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 Income Tax Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Income Tax Management                        [+ Add Tax Record]    │
├─────────────────────────────────────────────────────────────────────┤
│  Filters: [Fiscal Year ▼] [Tax Type ▼] [Status ▼]     [Search]     │
├─────────────────────────────────────────────────────────────────────┤
│  Summary Cards:                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │Total Tax │ │  Paid    │ │ Pending  │ │ Overdue  │               │
│  │ ৳250,000 │ │ ৳150,000 │ │ ৳75,000  │ │ ৳25,000  │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
├─────────────────────────────────────────────────────────────────────┤
│  Tax Records Table:                                                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Fiscal Year │ Type     │ Amount  │ Status  │ Due Date │ Act │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ 2024-2025   │ VAT      │ ৳50,000 │ Pending │ Feb 15   │ ⋮   │   │
│  │ 2024-2025   │ Income   │ ৳75,000 │ Partial │ Mar 31   │ ⋮   │   │
│  │ 2023-2024   │ VAT      │ ৳48,000 │ Paid    │ Feb 15   │ ⋮   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.3 Certificates Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Certificates & Licenses                      [+ Add Certificate]   │
├─────────────────────────────────────────────────────────────────────┤
│  [All] [Active] [Expiring Soon] [Expired]          [Grid ⊞] [List]  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐ │
│  │ Trade License     │ │ Fire Safety       │ │ Environmental     │ │
│  │ ───────────────── │ │ ───────────────── │ │ ───────────────── │ │
│  │ #TL-2024-001      │ │ #FS-2024-052      │ │ #ENV-2024-003     │ │
│  │ Expires: 30 days  │ │ Expires: 90 days  │ │ Expires: 15 days  │ │
│  │ Status: ● Active  │ │ Status: ● Active  │ │ Status: ⚠ Warning │ │
│  │ [View] [Renew]    │ │ [View] [Renew]    │ │ [View] [Renew]    │ │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘ │
│                                                                     │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐ │
│  │ ISO 9001:2015     │ │ Import License    │ │ Insurance         │ │
│  │ ───────────────── │ │ ───────────────── │ │ ───────────────── │ │
│  │ #ISO-2023-001     │ │ #IMP-2024-001     │ │ #INS-2024-001     │ │
│  │ Expires: 2 years  │ │ Expires: 180 days │ │ Expires: 60 days  │ │
│  │ Status: ● Active  │ │ Status: ● Active  │ │ Status: ● Active  │ │
│  │ [View] [Renew]    │ │ [View] [Renew]    │ │ [View] [Renew]    │ │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. Validation & Business Rules

### 8.1 Tax Record Rules

| Rule | Description |
|------|-------------|
| Fiscal Year Format | Must be YYYY-YYYY format (e.g., 2024-2025) |
| Tax Calculation | taxableIncome = grossIncome - totalDeductions |
| Payment Validation | Total payments cannot exceed tax amount |
| Due Date | Cannot be in the past for new records |
| Filing | Can only file if payments are complete |
| Deductions | Must have supporting document for amounts > ৳50,000 |

### 8.2 Certificate Rules

| Rule | Description |
|------|-------------|
| Unique Number | Certificate number must be unique |
| Expiry Date | Must be after issue date |
| Renewal | Can only renew within 60 days of expiry |
| Status Update | Auto-update to "expired" after expiry date |
| File Required | Certificate file is mandatory |

### 8.3 Document Rules

| Rule | Description |
|------|-------------|
| Version Control | New version must increment version number |
| Access Level | Confidential documents require explicit user access |
| Effective Date | Cannot be after expiry date |
| File Size | Maximum 10MB per document |

---

## 9. Implementation Phases

### Phase 1: Foundation
- Create database schemas
- Set up API routes structure
- Create basic CRUD operations
- Add navigation section to Layout.tsx

### Phase 2: Tax Management
- Tax record CRUD
- Payment tracking
- Filing status management
- Tax summary dashboard

### Phase 3: Business Authenticity
- Business registration management
- Director/owner management
- Tax identifier management
- Document uploads

### Phase 4: Certificates
- Certificate CRUD
- Renewal tracking
- Expiry notifications
- Reminder system

### Phase 5: Legal Documents
- Document CRUD
- Version control
- Search functionality
- Access control

### Phase 6: Dashboard & Reporting
- Compliance dashboard
- Activity logging
- Reporting features
- Export functionality

---

## 10. File Structure

### 10.1 Backend Files

```
apps/backend/src/modules/compliance/
├── index.ts                          # Module exports
├── compliance.routes.ts              # All compliance routes
├── compliance.service.ts             # Business logic
├── compliance.validation.ts          # Zod schemas
├── models/
│   ├── tax-record.model.ts
│   ├── business-authenticity.model.ts
│   ├── certificate.model.ts
│   ├── legal-document.model.ts
│   └── compliance-activity.model.ts
└── utils/
    ├── compliance-calculator.ts      # Score calculation
    └── reminder-service.ts           # Notification logic
```

### 10.2 Frontend Files

```
apps/manage/src/features/compliance/
├── index.ts
├── ComplianceDashboard.tsx
├── components/
│   ├── shared/
│   ├── tax/
│   ├── authenticity/
│   ├── certificates/
│   └── documents/
├── pages/
├── hooks/
├── api/
├── types/
└── utils/
```

### 10.3 Shared Types

```
packages/types/src/
├── compliance/
│   ├── tax-record.ts
│   ├── certificate.ts
│   ├── legal-document.ts
│   └── authenticity.ts
└── index.ts                          # Export all types
```

---

## Summary

The Business Compliance module provides comprehensive management of:

- **5 Main Sections**: Dashboard, Income Tax, Business Authenticity, Certificates, Legal Documents
- **5 New MongoDB Collections**: TaxRecord, BusinessAuthenticity, Certificate, LegalDocument, ComplianceActivity
- **30+ API Endpoints**: Full CRUD operations with specialized endpoints
- **Complete Frontend**: Dashboard, list views, detail views, forms
- **Business Rules**: Validation, auto-calculations, status management
- **Notification System**: Expiry reminders, deadline alerts

This module enables businesses to maintain complete compliance records, track tax obligations, manage certificates and licenses, and store important legal documents in a centralized, organized system.
