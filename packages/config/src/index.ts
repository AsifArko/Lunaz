/**
 * @lunaz/config — Shared env validation and typed config.
 */

export {
  // Schemas
  backendEnvSchema,
  webEnvSchema,
  manageEnvSchema,
  frontendEnvSchema, // Legacy alias
  // Types
  type BackendEnv,
  type WebEnv,
  type ManageEnv,
  type FrontendEnv, // Legacy alias
  type ValidationResult,
  // Validation helpers
  validateEnv,
  safeValidateEnv,
  createConfigLoader,
  checkRequiredEnv,
} from './env.js';
