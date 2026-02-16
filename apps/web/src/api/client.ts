/**
 * API client — base URL from runtime config (config.js) or build-time env.
 * Automatically attaches access token and retries on 401 using refresh token.
 * Fallback: if baked-in URL points to private IP (172.x, 10.x) but user visits via public IP, use current host.
 */

function getApiUrl(): string {
  const fromConfig = typeof window !== 'undefined' && window.__VITE_API_URL__;
  const fromEnv = import.meta.env.VITE_API_URL;
  const url = fromConfig || fromEnv || '/api/v1';

  if (typeof window === 'undefined') return url;

  const isPrivateOrLocal = (u: string) => {
    try {
      const h = new URL(u, 'http://localhost').hostname;
      return (
        h === 'localhost' ||
        h === '127.0.0.1' ||
        h.startsWith('172.') ||
        h.startsWith('10.') ||
        h.startsWith('192.168.')
      );
    } catch {
      return false;
    }
  };

  const pageHost = window.location.hostname;
  const pageIsPublic =
    pageHost !== 'localhost' &&
    pageHost !== '127.0.0.1' &&
    !pageHost.startsWith('172.') &&
    !pageHost.startsWith('10.') &&
    !pageHost.startsWith('192.168.');

  if (pageIsPublic && isPrivateOrLocal(url)) {
    return `${window.location.protocol}//${window.location.hostname}:4000/api/v1`;
  }
  return url;
}

const API_URL = getApiUrl();

export interface AuthTokens {
  token: string | null;
  refreshToken: string | null;
}

let getAuth: () => AuthTokens = () => ({ token: null, refreshToken: null });
let onTokensRefreshed: ((tokens: { token: string; refreshToken: string }) => void) | null = null;
let onRefreshFailed: (() => void) | null = null;

/**
 * Register auth token getter and refresh callbacks (called by AuthProvider).
 */
export function setAuthProvider(
  getter: () => AuthTokens,
  callbacks: {
    onTokensRefreshed: (tokens: { token: string; refreshToken: string }) => void;
    onRefreshFailed: () => void;
  }
): void {
  getAuth = getter;
  onTokensRefreshed = callbacks.onTokensRefreshed;
  onRefreshFailed = callbacks.onRefreshFailed;
}

export interface ApiOptions extends Omit<RequestInit, 'headers'> {
  token?: string | null;
  headers?: HeadersInit;
}

/**
 * Fetch API with optional explicit token. If not passed, uses token from auth provider.
 * On 401, attempts refresh and retries once; on refresh failure clears auth and throws.
 */
export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token: explicitToken, headers: initHeaders, ...init } = options;
  const auth = getAuth();
  const token = explicitToken ?? auth.token;
  const headers = new Headers(initHeaders);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let res = await fetch(`${API_URL}${path}`, { ...init, headers });
  let data = await res.json().catch(() => ({}));

  const isRefreshEndpoint = path === '/auth/refresh';
  const refreshToken = auth.refreshToken;
  if (res.status === 401 && refreshToken && !isRefreshEndpoint) {
    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const refreshData = (await refreshRes.json().catch(() => ({}))) as {
        token?: string;
        refreshToken?: string;
        error?: { message?: string };
      };
      if (refreshRes.ok && refreshData.token) {
        const newRefresh = refreshData.refreshToken ?? refreshToken;
        onTokensRefreshed?.({ token: refreshData.token, refreshToken: newRefresh });
        headers.set('Authorization', `Bearer ${refreshData.token}`);
        res = await fetch(`${API_URL}${path}`, { ...init, headers });
        data = await res.json().catch(() => ({}));
      } else {
        onRefreshFailed?.();
        const msg = (data?.error?.message as string) ?? refreshRes.statusText ?? 'Session expired';
        throw new Error(msg);
      }
    } catch (err) {
      onRefreshFailed?.();
      throw err;
    }
  }

  if (!res.ok) {
    const msg =
      data &&
      typeof data === 'object' &&
      typeof (data as { error?: { message?: string } }).error?.message === 'string'
        ? (data as { error: { message: string } }).error.message
        : res.statusText;
    const err = new Error(msg) as Error & { responseBody?: unknown };
    err.responseBody = data;
    throw err;
  }
  return data as T;
}
