export { complianceRoutes } from './compliance.routes.js';

// Models
export { TaxRecordModel } from './models/tax-record.model.js';
export {
  BusinessAuthenticityModel,
  getBusinessAuthenticity,
} from './models/business-authenticity.model.js';
export { CertificateModel } from './models/certificate.model.js';
export { LegalDocumentModel } from './models/legal-document.model.js';
export {
  ComplianceActivityModel,
  logComplianceActivity,
} from './models/compliance-activity.model.js';

// Validation schemas
export * as complianceValidation from './compliance.validation.js';
