import { z } from 'zod';

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
  S3_ENDPOINT: z
    .string()
    .optional()
    .transform((v) => (v === '' || !v ? undefined : v))
    .pipe(z.string().url().optional()),
  S3_PUBLIC_URL: z
    .string()
    .optional()
    .transform((v) => (v === '' || !v ? undefined : v))
    .pipe(z.string().url().optional()),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  FRONTEND_WEB_URL: z.string().url().default('http://localhost:3000'),
  FRONTEND_MANAGE_URL: z.string().url().optional(),
  API_URL: z.string().optional(),
  SSLCOMMERZ_STORE_ID: z.string().optional(),
  SSLCOMMERZ_STORE_PASSWORD: z.string().optional(),
  SSLCOMMERZ_SANDBOX: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
  STATIC_DIR: z.string().optional(),
});

export type BackendEnv = z.infer<typeof backendEnvSchema>;
