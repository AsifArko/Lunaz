/**
 * API client — base URL from runtime config (config.js) or build-time env.
 */

declare global {
  interface Window {
    __VITE_API_URL__?: string;
  }
}

export const API_URL =
  (typeof window !== 'undefined' && window.__VITE_API_URL__) ||
  import.meta.env.VITE_API_URL ||
  '/api/v1';

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...init } = options;
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = (data?.error?.message as string) ?? res.statusText;
    throw new Error(msg);
  }
  return data as T;
}
