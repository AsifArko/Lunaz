import { z, ZodError } from 'zod';

/** Backend environment schema. */
export const backendEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  FRONTEND_WEB_URL: z.string().url().default('http://localhost:3000'),
  FRONTEND_MANAGE_URL: z.string().url().default('http://localhost:3001'),
  // Payment gateways – backend base URL for SSLCommerz callbacks
  API_URL: z.string().optional(),
  // SSLCommerz (required for "Card / bKash / Nagad / Bank" at checkout)
  SSLCOMMERZ_STORE_ID: z.string().optional(),
  SSLCOMMERZ_STORE_PASSWORD: z.string().optional(),
  SSLCOMMERZ_SANDBOX: z.string().optional(),
  // Stripe (optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  // OAuth (optional – required only when using social login)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
});

export type BackendEnv = z.infer<typeof backendEnvSchema>;

/** Web frontend env (build-time). */
export const webEnvSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:4000/api/v1'),
  VITE_STRIPE_PUBLIC_KEY: z.string().optional(),
});

export type WebEnv = z.infer<typeof webEnvSchema>;

/** Manage (admin) frontend env (build-time). */
export const manageEnvSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:4000/api/v1'),
});

export type ManageEnv = z.infer<typeof manageEnvSchema>;

/** Legacy alias for backwards compatibility. */
export const frontendEnvSchema = webEnvSchema;
export type FrontendEnv = WebEnv;

/* -------------------------------------------------------------------------- */
/*                              Validation Helpers                            */
/* -------------------------------------------------------------------------- */

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Format Zod errors into human-readable messages.
 */
function formatZodErrors(error: ZodError): string[] {
  return error.errors.map((err) => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  });
}

/**
 * Validate environment variables against a schema.
 * Returns parsed config or throws with detailed error messages.
 *
 * @example
 * const env = validateEnv(backendEnvSchema, process.env);
 */
export function validateEnv<T extends z.ZodTypeAny>(
  schema: T,
  env: Record<string, string | undefined>
): z.infer<T> {
  const result = schema.safeParse(env);

  if (!result.success) {
    const errors = formatZodErrors(result.error);
    const message = [
      '❌ Environment validation failed:',
      ...errors.map((e) => `   • ${e}`),
      '',
      'Please check your .env file or environment variables.',
    ].join('\n');

    console.error(message);
    throw new Error(`Environment validation failed: ${errors.join(', ')}`);
  }

  return result.data;
}

/**
 * Safely validate environment variables (no throw).
 * Returns a result object with success status and data or errors.
 *
 * @example
 * const result = safeValidateEnv(backendEnvSchema, process.env);
 * if (!result.success) console.error(result.errors);
 */
export function safeValidateEnv<T extends z.ZodTypeAny>(
  schema: T,
  env: Record<string, string | undefined>
): ValidationResult<z.infer<T>> {
  const result = schema.safeParse(env);

  if (!result.success) {
    return {
      success: false,
      errors: formatZodErrors(result.error),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Create a typed config loader for a specific schema.
 * Useful for creating app-specific config modules.
 *
 * @example
 * // In backend/src/config.ts
 * export const loadConfig = createConfigLoader(backendEnvSchema);
 * export const config = loadConfig(process.env);
 */
export function createConfigLoader<T extends z.ZodTypeAny>(schema: T) {
  return (env: Record<string, string | undefined>): z.infer<T> => {
    return validateEnv(schema, env);
  };
}

/**
 * Check if all required env vars are present (for quick startup checks).
 */
export function checkRequiredEnv(
  required: string[],
  env: Record<string, string | undefined>
): void {
  const missing = required.filter((key) => !env[key]);

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    console.error(`❌ ${message}`);
    throw new Error(message);
  }
}
