import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { UserSummary, LoginRequest, LoginResponse } from '@lunaz/types';
import { api } from '../api/client';

interface AuthState {
  user: UserSummary | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'lunaz_admin_token';
const REFRESH_TOKEN_KEY = 'lunaz_admin_refresh_token';
const USER_KEY = 'lunaz_admin_user';

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
        // Verify user is admin
        if (user.role === 'admin') {
          setState({ user, token, isLoading: false });
        } else {
          // Not admin, clear storage
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setState({ user: null, token: null, isLoading: false });
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setState({ user: null, token: null, isLoading: false });
      }
    } else {
      setState({ user: null, token: null, isLoading: false });
    }
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Verify user is admin
    if (res.user.role !== 'admin') {
      throw new Error('Access denied. Admin privileges required.');
    }

    localStorage.setItem(TOKEN_KEY, res.token);
    if (res.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    setState({ user: res.user, token: res.token, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ user: null, token: null, isLoading: false });
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    isAuthenticated: !!state.user,
    isAdmin: state.user?.role === 'admin',
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
