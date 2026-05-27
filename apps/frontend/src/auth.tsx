import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { apiFetch, SessionTokens } from './api';

export type SessionUser = {
  id: number;
  email: string;
  isAdmin?: boolean;
};

export type RegisterPayload = {
  email: string;
  name: string;
  password: string;
  repeatedPassword: string;
};

type AuthContextType = {
  accessToken: string | null;
  sessionUser: SessionUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeToken(accessToken: string | null) {
  if (!accessToken) {
    return null;
  }

  try {
    const [, payload] = accessToken.split('.');

    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const decoded = JSON.parse(atob(padded)) as SessionUser;

    return decoded;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      return;
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, [accessToken]);

  const sessionUser = useMemo(() => decodeToken(accessToken), [accessToken]);

  function storeTokens(tokens: SessionTokens) {
    setAccessToken(tokens.accessToken ?? null);
    localStorage.setItem('refreshToken', tokens.refreshToken ?? '');
  }

  const login = async (email: string, password: string) => {
    const data = await apiFetch<SessionTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    storeTokens(data);
  };

  const register = async (payload: RegisterPayload) => {
    const data = await apiFetch<SessionTokens>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    storeTokens(data);
  };

  const logout = () => setAccessToken(null);

  return (
    <AuthContext.Provider value={{ accessToken, sessionUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}
