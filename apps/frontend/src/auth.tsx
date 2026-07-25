import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { apiFetch, exchangeOAuthCode, SessionTokens, setApiAccessToken } from './api';

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
  // Access token живе лише в пам'яті — localStorage/sessionStorage не використовується,
  // тому XSS-атака не може вкрасти токен.
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Синхронізуємо in-memory токен з API-модулем при кожній зміні.
  useEffect(() => {
    setApiAccessToken(accessToken);
  }, [accessToken]);

  // При першому рендері перевіряємо query-параметри: чи є oauthCode після Google OAuth.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthCode = params.get('oauthCode');

    if (!oauthCode) {
      return;
    }

    // Одразу видаляємо код з URL, щоб він не залишався в історії браузера.
    params.delete('oauthCode');
    const cleanUrl = [window.location.pathname, params.toString() ? `?${params.toString()}` : ''].join('');
    window.history.replaceState({}, '', cleanUrl);

    exchangeOAuthCode(oauthCode)
      .then((tokens) => setAccessToken(tokens.accessToken ?? null))
      .catch(() => {
        // Код протермінований або недійсний — користувач побачить форму входу.
      });
  }, []);

  const sessionUser = useMemo(() => decodeToken(accessToken), [accessToken]);

  function storeTokens(tokens: SessionTokens) {
    // Зберігаємо лише access token у пам'яті.
    // Refresh token зберігається сервером у HttpOnly cookie — JS його не бачить.
    setAccessToken(tokens.accessToken ?? null);
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
