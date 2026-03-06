import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, clearTokens } from '../utils/secureStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser({ id: payload.sub, email: payload.email, role: payload.role });
        } else {
          await refreshAuth();
        }
      }
    } catch {
      await clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    try {
      const refresh = await getRefreshToken();
      if (!refresh) return;
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      if (res.ok) {
        const data = await res.json();
        await setAccessToken(data.accessToken);
        await setRefreshToken(data.refreshToken);
        setUser(data.user);
      } else {
        await clearTokens();
      }
    } catch {
      await clearTokens();
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    const data = await res.json();
    await setAccessToken(data.accessToken);
    await setRefreshToken(data.refreshToken);
    setUser(data.user);
  };

  const register = async (email: string, password: string, fullName: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName, role: 'MEMBER' }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }
    await login(email, password);
  };

  const logout = async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } finally {
      await clearTokens();
      setUser(null);
    }
  };

  const getToken = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now() + 60000) {
      await refreshAuth();
      return getAccessToken();
    }
    return token;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
