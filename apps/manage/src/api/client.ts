/**
 * API client — base URL from env; typed with @lunaz/types.
 */

const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

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
