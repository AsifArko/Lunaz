import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate.js';
import { getConfig } from '../../config/index.js';
import { UserRole } from '../../constants/enums';
import * as complianceService from './compliance.service.js';
import * as validators from './compliance.validation.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware(getConfig));
router.use(requireRole(UserRole.ADMIN));

// ============================================
// TAX RECORDS
// ============================================

// GET /compliance/tax-records - List all tax records
router.get(
  '/tax-records',
  validateQuery(validators.listTaxRecordsQuery),
  complianceService.listTaxRecords
);

// POST /compliance/tax-records - Create tax record
router.post(
  '/tax-records',
  validateBody(validators.createTaxRecordSchema),
  complianceService.createTaxRecord
);

// GET /compliance/tax-records/summary - Get tax summary
router.get('/tax-records/summary', complianceService.getTaxSummary);

// GET /compliance/tax-records/:id - Get single tax record
router.get('/tax-records/:id', validateParams(validators.idParam), complianceService.getTaxRecord);

// PATCH /compliance/tax-records/:id - Update tax record
router.patch(
  '/tax-records/:id',
  validateParams(validators.idParam),
  validateBody(validators.updateTaxRecordSchema),
  complianceService.updateTaxRecord
);

// DELETE /compliance/tax-records/:id - Delete tax record
router.delete(
  '/tax-records/:id',
  validateParams(validators.idParam),
  complianceService.deleteTaxRecord
);

// POST /compliance/tax-records/:id/payments - Add payment
router.post(
  '/tax-records/:id/payments',
  validateParams(validators.idParam),
  validateBody(validators.addPaymentSchema),
  complianceService.addTaxPayment
);

// DELETE /compliance/tax-records/:id/payments/:paymentId - Remove payment
router.delete(
  '/tax-records/:id/payments/:paymentId',
  validateParams(validators.paymentIdParam),
  complianceService.removeTaxPayment
);

// POST /compliance/tax-records/:id/file - Mark as filed
router.post(
  '/tax-records/:id/file',
  validateParams(validators.idParam),
  validateBody(validators.fileTaxSchema),
  complianceService.fileTaxRecord
);

// ============================================
// BUSINESS AUTHENTICITY
// ============================================

// GET /compliance/authenticity - Get business authenticity
router.get('/authenticity', complianceService.getAuthenticity);

// POST /compliance/authenticity - Create business authenticity
router.post(
  '/authenticity',
  validateBody(validators.createAuthenticitySchema),
  complianceService.createAuthenticity
);

// PATCH /compliance/authenticity - Update business authenticity
router.patch(
  '/authenticity',
  validateBody(validators.updateAuthenticitySchema),
  complianceService.updateAuthenticity
);

// POST /compliance/authenticity/directors - Add director
router.post(
  '/authenticity/directors',
  validateBody(validators.directorSchema),
  complianceService.addDirector
);

// PATCH /compliance/authenticity/directors/:directorId - Update director
router.patch(
  '/authenticity/directors/:directorId',
  validateParams(validators.directorIdParam),
  validateBody(validators.updateDirectorSchema),
  complianceService.updateDirector
);

// DELETE /compliance/authenticity/directors/:directorId - Remove director
router.delete(
  '/authenticity/directors/:directorId',
  validateParams(validators.directorIdParam),
  complianceService.removeDirector
);

// POST /compliance/authenticity/tax-identifiers - Add tax identifier
router.post(
  '/authenticity/tax-identifiers',
  validateBody(validators.taxIdentifierSchema),
  complianceService.addTaxIdentifier
);

// PATCH /compliance/authenticity/tax-identifiers/:identifierId - Update tax identifier
router.patch(
  '/authenticity/tax-identifiers/:identifierId',
  validateParams(validators.taxIdentifierIdParam),
  validateBody(validators.taxIdentifierSchema.partial()),
  complianceService.updateTaxIdentifier
);

// DELETE /compliance/authenticity/tax-identifiers/:identifierId - Remove tax identifier
router.delete(
  '/authenticity/tax-identifiers/:identifierId',
  validateParams(validators.taxIdentifierIdParam),
  complianceService.removeTaxIdentifier
);

// ============================================
// CERTIFICATES
// ============================================

// GET /compliance/certificates - List certificates
router.get(
  '/certificates',
  validateQuery(validators.listCertificatesQuery),
  complianceService.listCertificates
);

// POST /compliance/certificates - Create certificate
router.post(
  '/certificates',
  validateBody(validators.createCertificateSchema),
  complianceService.createCertificate
);

// GET /compliance/certificates/:id - Get certificate
router.get(
  '/certificates/:id',
  validateParams(validators.idParam),
  complianceService.getCertificate
);

// PATCH /compliance/certificates/:id - Update certificate
router.patch(
  '/certificates/:id',
  validateParams(validators.idParam),
  validateBody(validators.updateCertificateSchema),
  complianceService.updateCertificate
);

// DELETE /compliance/certificates/:id - Delete certificate
router.delete(
  '/certificates/:id',
  validateParams(validators.idParam),
  complianceService.deleteCertificate
);

// POST /compliance/certificates/:id/renew - Renew certificate
router.post(
  '/certificates/:id/renew',
  validateParams(validators.idParam),
  validateBody(validators.renewCertificateSchema),
  complianceService.renewCertificate
);

// ============================================
// LEGAL DOCUMENTS
// ============================================

// GET /compliance/documents - List documents
router.get(
  '/documents',
  validateQuery(validators.listDocumentsQuery),
  complianceService.listDocuments
);

// POST /compliance/documents - Create document
router.post(
  '/documents',
  validateBody(validators.createDocumentSchema),
  complianceService.createDocument
);

// GET /compliance/documents/:id - Get document
router.get('/documents/:id', validateParams(validators.idParam), complianceService.getDocument);

// PATCH /compliance/documents/:id - Update document
router.patch(
  '/documents/:id',
  validateParams(validators.idParam),
  validateBody(validators.updateDocumentSchema),
  complianceService.updateDocument
);

// DELETE /compliance/documents/:id - Delete document
router.delete(
  '/documents/:id',
  validateParams(validators.idParam),
  complianceService.deleteDocument
);

// POST /compliance/documents/:id/versions - Add new version
router.post(
  '/documents/:id/versions',
  validateParams(validators.idParam),
  validateBody(validators.newVersionSchema),
  complianceService.addDocumentVersion
);

// GET /compliance/documents/:id/versions - Get version history
router.get(
  '/documents/:id/versions',
  validateParams(validators.idParam),
  complianceService.getDocumentVersions
);

// ============================================
// DASHBOARD & REPORTS
// ============================================

// GET /compliance/dashboard - Get compliance dashboard data
router.get('/dashboard', complianceService.getDashboard);

// GET /compliance/expiring - Get expiring items
router.get('/expiring', complianceService.getExpiringItems);

// GET /compliance/activity - Get activity log
router.get('/activity', validateQuery(validators.activityQuery), complianceService.getActivityLog);

export const complianceRoutes = router;
