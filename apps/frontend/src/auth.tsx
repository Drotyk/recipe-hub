import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from './api';

type AuthContextType = {
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));

  useEffect(() => {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    else localStorage.removeItem('accessToken');
  }, [accessToken]);

  const login = async (email: string, password: string) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setAccessToken((data as any).accessToken ?? null);
  };

  const register = async (email: string, password: string) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setAccessToken((data as any).accessToken ?? null);
  };

  const logout = () => setAccessToken(null);

  return (
    <AuthContext.Provider value={{ accessToken, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
