import { config as loadEnv } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { backendEnvSchema, type BackendEnv } from '@lunaz/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env from monorepo root (apps/backend/src/config → ../../../../.env)
loadEnv({ path: path.resolve(__dirname, '../../../../.env') });

export function getConfig(): BackendEnv {
  const parsed = backendEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new Error(`Invalid config: ${msg}`);
  }
  return parsed.data;
}
