/**
 * Admin API client — uses admin tokens (lunaz_admin_*) for manage section.
 * Separate from customer api client which uses lunaz_token.
 * On 401 (expired/invalid token), calls the registered handler to log out the user.
 */

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
}
