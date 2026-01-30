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
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'lunaz_token';
const USER_KEY = 'lunaz_user';

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

  const login = useCallback(async (data: LoginRequest) => {
    const res = await api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    setState({ user: res.user, token: res.token, isLoading: false });
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    await api<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // After successful registration, log the user in
    await login({ email: data.email, password: data.password });
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ user: null, token: null, isLoading: false });
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
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
