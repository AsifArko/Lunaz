/**
 * Admin API client — uses admin tokens (lunaz_admin_*) for manage section.
 * Separate from customer api client which uses lunaz_token.
 * On 401 (expired/invalid token), calls the registered handler to log out the user.
 * Retries on network errors (e.g. proxy/backend unavailable).
 */

import { logger } from '@/lib/logger';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

function isRetryableNetworkError(err: unknown): boolean {
  if (err instanceof TypeError && err.message?.toLowerCase().includes('fetch')) return true;
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes('network') ||
      msg.includes('failed to fetch') ||
      msg.includes('connection refused') ||
      msg.includes('econnrefused') ||
      msg.includes('timeout') ||
      msg.includes('etimedout') ||
      msg.includes('service unavailable')
    );
  }
  return false;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let onUnauthorized: (() => void) | null = null;

/** Register a callback to run when the API returns 401 (e.g. session expired). Used to log out the user. */
export function setAdminUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export const API_URL = (() => {
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_API_URL || '/api/v1';
  }
  const pageHost = window.location.hostname;
  const isLocalOrPrivate =
    pageHost === 'localhost' ||
    pageHost === '127.0.0.1' ||
    pageHost.startsWith('172.') ||
    pageHost.startsWith('10.') ||
    pageHost.startsWith('192.168.');
  if (!isLocalOrPrivate) {
    return `${window.location.origin}/api/v1`;
  }
  return (
    (typeof window !== 'undefined' && (window as { __VITE_API_URL__?: string }).__VITE_API_URL__) ||
    import.meta.env.VITE_API_URL ||
    '/api/v1'
  );
})();

export function getAdminApiUrl(): string {
  return API_URL;
}

export async function adminApi<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...init } = options;
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${getAdminApiUrl()}${path}`, { ...init, headers });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401 && token) {
          onUnauthorized?.();
        }
        const msg =
          data &&
          typeof data === 'object' &&
          typeof (data as { error?: { message?: string } }).error?.message === 'string'
            ? (data as { error: { message: string } }).error.message
            : res.statusText;
        throw new Error(msg);
      }
      return data as T;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES - 1 && isRetryableNetworkError(err)) {
        logger.warn(
          `Admin API network error for ${path}, retrying (${attempt + 1}/${MAX_RETRIES})`,
          { path },
          err
        );
        await sleep(RETRY_DELAY_MS * Math.pow(2, attempt));
      } else {
        if (isRetryableNetworkError(err)) {
          logger.errorException(err, `Admin API request failed after ${MAX_RETRIES} attempts`, {
            path,
          });
        }
        throw err;
      }
    }
  }
  throw lastError;
}
