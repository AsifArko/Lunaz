import { config as loadEnv } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { backendEnvSchema, type BackendEnv } from '@lunaz/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env so SSLCOMMERZ_* and other vars are available.
// Prefer monorepo root .env (backend often runs with cwd = apps/backend).
const repoRootEnv = path.resolve(__dirname, '../../../../.env');
if (fs.existsSync(repoRootEnv)) {
  loadEnv({ path: repoRootEnv });
}
loadEnv(); // then cwd so local overrides work
for (const envPath of [
  path.resolve(process.cwd(), '../.env'),
  path.resolve(process.cwd(), '../../.env'),
]) {
  if (fs.existsSync(envPath)) {
    loadEnv({ path: envPath, override: false });
    break;
  }
}

export function getConfig(): BackendEnv {
  const parsed = backendEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new Error(`Invalid config: ${msg}`);
  }
  return parsed.data;
}
