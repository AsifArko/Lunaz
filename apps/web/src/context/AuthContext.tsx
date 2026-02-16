import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { UserSummary, LoginRequest, RegisterRequest, LoginResponse } from '@lunaz/types';
import { api, setAuthProvider } from '../api/client';

interface AuthState {
  user: UserSummary | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}

/** Response from POST /auth/oauth/google (and similar) */
type OAuthLoginResponse = LoginResponse & { requiresPhone?: boolean };

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loginWithGoogle: (phone?: string) => Promise<void>;
  loginWithFacebook: (phone?: string) => Promise<void>;
  /** Call after OAuth callback (e.g. code exchange) to persist tokens and update state */
  completeOAuthLogin: (response: OAuthLoginResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  /** True when OAuth returned requiresPhone; frontend should collect phone and PATCH /users/me */
  requiresPhone: boolean;
  clearRequiresPhone: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'lunaz_token';
const REFRESH_TOKEN_KEY = 'lunaz_refresh_token';
const USER_KEY = 'lunaz_user';

// OAuth configuration (runtime config.js or build-time env)
const GOOGLE_CLIENT_ID =
  (typeof window !== 'undefined' && window.__VITE_GOOGLE_CLIENT_ID__) ||
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '';
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isLoading: true,
  });
  const [requiresPhone, setRequiresPhone] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const persistAuth = useCallback((user: UserSummary, token: string, refreshToken: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setState((s) => ({ ...s, user, token, refreshToken, isLoading: false }));
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ user: null, token: null, refreshToken: null, isLoading: false });
  }, []);

  // Register auth provider for API client (refresh on 401)
  useEffect(() => {
    setAuthProvider(
      () => ({
        token: stateRef.current.token,
        refreshToken: stateRef.current.refreshToken,
      }),
      {
        onTokensRefreshed: (tokens) => {
          localStorage.setItem(TOKEN_KEY, tokens.token);
          localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
          setState((s) =>
            s.user ? { ...s, token: tokens.token, refreshToken: tokens.refreshToken } : s
          );
        },
        onRefreshFailed: () => {
          clearAuth();
        },
      }
    );
  }, [clearAuth]);

  // Load persisted auth state on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    if (token && refreshToken && userJson) {
      try {
        const user = JSON.parse(userJson) as UserSummary;
        setState({ user, token, refreshToken, isLoading: false });
      } catch {
        clearAuth();
      }
    } else {
      setState((s) => ({ ...s, user: null, token: null, refreshToken: null, isLoading: false }));
    }
  }, [clearAuth]);

  // Handle OAuth callback response (backend may return requiresPhone for new users)
  const handleOAuthResponse = useCallback(
    async (provider: 'google' | 'facebook', credential: string, phone?: string) => {
      const res = await api<LoginResponse & { requiresPhone?: boolean }>(
        `/auth/oauth/${provider}`,
        {
          method: 'POST',
          body: JSON.stringify({ credential, phone: phone || undefined }),
        }
      );
      persistAuth(res.user, res.token, res.refreshToken);
      setRequiresPhone(Boolean(res.requiresPhone));
    },
    [persistAuth]
  );

  const login = useCallback(
    async (data: LoginRequest) => {
      const res = await api<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      persistAuth(res.user, res.token, res.refreshToken);
    },
    [persistAuth]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      const res = await api<LoginResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      persistAuth(res.user, res.token, res.refreshToken);
    },
    [persistAuth]
  );

  // Google OAuth login — redirect flow only (avoids FedCM/One Tap CORS errors on localhost)
  const loginWithGoogle = useCallback(async (_phone?: string) => {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google OAuth is not configured');
    }
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', `${window.location.origin}/auth/google/callback`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    window.location.href = authUrl.toString();
  }, []);

  const loginWithFacebook = useCallback(
    async (phone?: string) => {
      return new Promise<void>((resolve, reject) => {
        if (!FACEBOOK_APP_ID) {
          reject(new Error('Facebook OAuth is not configured'));
          return;
        }

        if (!window.FB) {
          window.fbAsyncInit = function () {
            window.FB.init({
              appId: FACEBOOK_APP_ID,
              cookie: true,
              xfbml: true,
              version: 'v18.0',
            });
            initiateFacebookLogin(resolve, reject);
          };

          const script = document.createElement('script');
          script.src = 'https://connect.facebook.net/en_US/sdk.js';
          script.async = true;
          script.defer = true;
          script.onerror = () => reject(new Error('Failed to load Facebook SDK'));
          document.head.appendChild(script);
        } else {
          initiateFacebookLogin(resolve, reject);
        }

        function initiateFacebookLogin(res: () => void, rej: (error: Error) => void) {
          window.FB.login(
            async (response: { authResponse?: { accessToken: string } }) => {
              if (response.authResponse) {
                try {
                  await handleOAuthResponse('facebook', response.authResponse.accessToken, phone);
                  res();
                } catch (err) {
                  rej(err instanceof Error ? err : new Error('Facebook login failed'));
                }
              } else {
                rej(new Error('Facebook login was cancelled'));
              }
            },
            { scope: 'email,public_profile' }
          );
        }
      });
    },
    [handleOAuthResponse]
  );

  const logout = useCallback(async () => {
    const refreshToken = stateRef.current.refreshToken;
    if (refreshToken) {
      try {
        await api('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // ignore
      }
    }
    clearAuth();
  }, [clearAuth]);

  const completeOAuthLogin = useCallback(
    (response: OAuthLoginResponse) => {
      persistAuth(response.user, response.token, response.refreshToken);
      setRequiresPhone(Boolean(response.requiresPhone));
    },
    [persistAuth]
  );

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    loginWithGoogle,
    loginWithFacebook,
    completeOAuthLogin,
    logout,
    isAuthenticated: !!state.user,
    requiresPhone,
    clearRequiresPhone: () => setRequiresPhone(false),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Type declarations for OAuth SDKs
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (
            callback?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
            }) => void
          ) => void;
          renderButton: (element: HTMLElement, options: { type: string }) => void;
        };
      };
    };
    FB: {
      init: (config: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
      login: (
        callback: (response: { authResponse?: { accessToken: string } }) => void,
        options: { scope: string }
      ) => void;
    };
    fbAsyncInit: () => void;
  }
}
