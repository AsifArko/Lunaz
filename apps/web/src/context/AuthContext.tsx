import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { UserSummary, LoginRequest, RegisterRequest, LoginResponse } from '@lunaz/types';
import { api } from '../api/client';

interface AuthState {
  user: UserSummary | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'lunaz_token';
const USER_KEY = 'lunaz_user';

// OAuth configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  // Load persisted auth state on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as UserSummary;
        setState({ user, token, isLoading: false });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setState({ user: null, token: null, isLoading: false });
      }
    } else {
      setState({ user: null, token: null, isLoading: false });
    }
  }, []);

  // Handle OAuth callback response
  const handleOAuthResponse = useCallback(
    async (provider: 'google' | 'facebook', credential: string) => {
      const res = await api<LoginResponse>(`/auth/oauth/${provider}`, {
        method: 'POST',
        body: JSON.stringify({ credential }),
      });
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      setState({ user: res.user, token: res.token, isLoading: false });
    },
    []
  );

  const login = useCallback(async (data: LoginRequest) => {
    const res = await api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    setState({ user: res.user, token: res.token, isLoading: false });
  }, []);

  const register = useCallback(
    async (data: RegisterRequest) => {
      await api<{ message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      // After successful registration, log the user in
      await login({ email: data.email, password: data.password });
    },
    [login]
  );

  // Google OAuth login using Google Identity Services
  const loginWithGoogle = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      if (!GOOGLE_CLIENT_ID) {
        reject(new Error('Google OAuth is not configured'));
        return;
      }

      // Load Google Identity Services script if not loaded
      if (!window.google?.accounts?.id) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => initializeGoogleAuth(resolve, reject);
        script.onerror = () => reject(new Error('Failed to load Google OAuth'));
        document.head.appendChild(script);
      } else {
        initializeGoogleAuth(resolve, reject);
      }

      function initializeGoogleAuth(res: () => void, rej: (error: Error) => void) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response: { credential: string }) => {
              try {
                await handleOAuthResponse('google', response.credential);
                res();
              } catch (err) {
                rej(err instanceof Error ? err : new Error('Google login failed'));
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Prompt the Google One Tap UI
          window.google.accounts.id.prompt(
            (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => {
              if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // Fall back to popup if One Tap is not available
                window.google.accounts.id.renderButton(document.createElement('div'), {
                  type: 'standard',
                });
                // Use redirect flow as fallback
                const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
                authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
                authUrl.searchParams.set(
                  'redirect_uri',
                  `${window.location.origin}/auth/google/callback`
                );
                authUrl.searchParams.set('response_type', 'code');
                authUrl.searchParams.set('scope', 'openid email profile');
                authUrl.searchParams.set('access_type', 'offline');
                authUrl.searchParams.set('prompt', 'consent');
                window.location.href = authUrl.toString();
              }
            }
          );
        } catch (err) {
          rej(err instanceof Error ? err : new Error('Failed to initialize Google OAuth'));
        }
      }
    });
  }, [handleOAuthResponse]);

  // Facebook OAuth login
  const loginWithFacebook = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      if (!FACEBOOK_APP_ID) {
        reject(new Error('Facebook OAuth is not configured'));
        return;
      }

      // Load Facebook SDK if not loaded
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
                await handleOAuthResponse('facebook', response.authResponse.accessToken);
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
  }, [handleOAuthResponse]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ user: null, token: null, isLoading: false });
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    isAuthenticated: !!state.user,
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
