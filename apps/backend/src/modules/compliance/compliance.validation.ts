import { z } from 'zod';

// Tax Record Schemas
export const createTaxRecordSchema = z.object({
  fiscalYear: z.string().regex(/^\d{4}-\d{4}$/, 'Invalid fiscal year format (e.g., 2024-2025)'),
  taxType: z.enum(['income_tax', 'corporate_tax', 'vat', 'sales_tax', 'withholding_tax', 'other']),
  period: z.enum(['monthly', 'quarterly', 'half_yearly', 'annual']),
  periodMonth: z.number().int().min(1).max(12).optional(),
  periodQuarter: z.number().int().min(1).max(4).optional(),
  grossIncome: z.number().min(0),
  deductions: z
    .array(
      z.object({
        category: z.enum([
          'operating_expenses',
          'depreciation',
          'business_development',
          'professional_services',
          'insurance',
          'interest',
          'donations',
          'other',
        ]),
        description: z.string().min(1),
        amount: z.number().min(0),
        supportingDocument: z.string().url().optional(),
      })
    )
    .optional()
    .default([]),
  taxableIncome: z.number().min(0),
  taxRate: z.number().min(0).max(100),
  taxAmount: z.number().min(0),
  dueDate: z.string().datetime(),
  notes: z.string().max(2000).optional(),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url(),
      })
    )
    .optional(),
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

export const fileTaxSchema = z.object({
  acknowledgmentNumber: z.string().min(1),
  filingDate: z.string().datetime().optional(),
});

// Business Authenticity Schemas
export const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('Bangladesh'),
});

export const createAuthenticitySchema = z.object({
  registrationType: z.enum([
    'sole_proprietorship',
    'partnership',
    'llc',
    'corporation',
    'cooperative',
    'ngo',
  ]),
  legalName: z.string().min(1).max(200),
  tradingName: z.string().max(200).optional(),
  registrationNumber: z.string().min(1),
  registrationDate: z.string().datetime(),
  registrationAuthority: z.string().min(1),
  registeredAddress: addressSchema,
  expiryDate: z.string().datetime().optional(),
  authorizedCapital: z.number().min(0).optional(),
  paidUpCapital: z.number().min(0).optional(),
  capitalCurrency: z.string().default('BDT'),
  registrationCertificate: z.string().url().optional(),
  memorandumOfAssociation: z.string().url().optional(),
  articlesOfAssociation: z.string().url().optional(),
  notes: z.string().max(2000).optional(),
});

export const updateAuthenticitySchema = createAuthenticitySchema.partial();

export const directorSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.enum(['owner', 'director', 'partner', 'shareholder', 'authorized_signatory']),
  ownershipPercentage: z.number().min(0).max(100).optional(),
  identityType: z.enum(['nid', 'passport', 'driving_license']),
  identityNumber: z.string().min(1),
  address: addressSchema.optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  appointmentDate: z.string().datetime().optional(),
  documents: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url(),
      })
    )
    .optional(),
});

export const updateDirectorSchema = directorSchema.partial();

export const taxIdentifierSchema = z.object({
  type: z.enum(['tin', 'bin', 'vat', 'iec', 'gst', 'other']),
  number: z.string().min(1),
  issueDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  issuingAuthority: z.string().optional(),
  certificate: z.string().url().optional(),
});

// Certificate Schemas
export const createCertificateSchema = z.object({
  certificateType: z.enum([
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
  renewalCurrency: z.string().default('BDT'),
  renewalProcess: z.string().max(1000).optional(),
  certificateFile: z.string().url(),
  supportingDocuments: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        url: z.string().url(),
      })
    )
    .optional(),
  tags: z.array(z.string()).optional(),
  reminder: z
    .object({
      enabled: z.boolean().default(true),
      daysBefore: z.array(z.number().int().positive()).default([30, 14, 7, 1]),
      notifyEmail: z.array(z.string().email()).optional(),
    })
    .optional(),
  notes: z.string().max(2000).optional(),
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
  ]),
  subCategory: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  parties: z
    .array(
      z.object({
        name: z.string().min(1),
        role: z.string().optional(),
        contact: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .optional(),
  effectiveDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  executionDate: z.string().datetime().optional(),
  status: z
    .enum(['draft', 'active', 'expired', 'terminated', 'superseded', 'archived'])
    .default('draft'),
  currentFile: z.string().url(),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        url: z.string().url(),
      })
    )
    .optional(),
  accessLevel: z.enum(['public', 'internal', 'restricted', 'confidential']).default('internal'),
  allowedUsers: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  relatedDocuments: z.array(z.string()).optional(),
  reminderEnabled: z.boolean().default(false),
  reminderDate: z.string().datetime().optional(),
  reminderRecipients: z.array(z.string().email()).optional(),
  notes: z.string().max(2000).optional(),
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
  filingStatus: z.string().optional(),
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
  sort: z.string().default('-createdAt'),
});

export const listDocumentsQuery = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  accessLevel: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().default('-createdAt'),
});

export const activityQuery = z.object({
  entityType: z.string().optional(),
  activityType: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

// Param Schemas
export const idParam = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID'),
});

export const directorIdParam = z.object({
  directorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid director ID'),
});

export const paymentIdParam = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID'),
  paymentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid payment ID'),
});

export const taxIdentifierIdParam = z.object({
  identifierId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid identifier ID'),
});
