import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearToken, getToken, setToken } from './storage';
import { HttpError, http } from '../api/http';

export type Me = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  location?: string | null;
  bio?: string | null;
  createdAt?: string;
};

type AuthContextValue = {
  token: string | null;
  me: Me | null;
  isBootstrapping: boolean;
  login(email: string, password: string): Promise<void>;
  googleLogin(idToken: string): Promise<void>;
  register(name: string, email: string, password: string): Promise<void>;
  logout(): void;
  refreshMe(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const refreshMe = useCallback(async () => {
    const t = token ?? getToken();
    if (!t) {
      setMe(null);
      return;
    }
    try {
      const out = await http<Me>('/users/me', { token: t });
      setMe(out);
    } catch (err) {
      if (err instanceof HttpError && (err.status === 401 || err.status === 403)) {
        clearToken();
        setTokenState(null);
        setMe(null);
      }
      throw err;
    }
  }, [token]);

  useEffect(() => {
    const t = getToken();
    setTokenState(t);
    if (!t) {
      setIsBootstrapping(false);
      return;
    }
    refreshMe()
      .catch(() => {
        // Don’t auto-logout on transient network errors.
        // Only clear token when it is actually invalid/unauthorized.
        // If backend is temporarily down, keep token so reload doesn't force re-login.
        // eslint-disable-next-line no-console
        // console.warn('refreshMe failed', err);
      })
      .finally(() => setIsBootstrapping(false));
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    const out = await http<{ token: string; user: { id: string; email: string; name: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    );
    setToken(out.token);
    setTokenState(out.token);
    await refreshMe();
  }, [refreshMe]);

  const googleLogin = useCallback(async (accessToken: string) => {
    const out = await http<{ token: string; user: { id: string; email: string; name: string } }>(
      '/auth/google',
      { method: 'POST', body: JSON.stringify({ accessToken }) },
    );
    setToken(out.token);
    setTokenState(out.token);
    await refreshMe();
  }, [refreshMe]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const out = await http<{ token: string }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ name, email, password }) },
    );
    setToken(out.token);
    setTokenState(out.token);
    await refreshMe();
  }, [refreshMe]);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setMe(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ token, me, isBootstrapping, login, googleLogin, register, logout, refreshMe }),
    [token, me, isBootstrapping, login, googleLogin, register, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
