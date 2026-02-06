/**
 * API client — base URL from env; typed with @lunaz/types.
 * Automatically attaches access token and retries on 401 using refresh token.
 */

const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

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
