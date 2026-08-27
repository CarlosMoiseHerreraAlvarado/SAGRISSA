import { useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../../types';
import { AuthContext } from './AuthContextDef';

const AUTH_USER_KEY = 'sagrissa_user';
const AUTH_TOKEN_KEY = 'sagrissa_auth_token';
const AUTH_EXPIRY_KEY = 'sagrissa_auth_expires_at';

function getStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStorageItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Fallback if localStorage is restricted
  }
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function removeStorageItem(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function readStoredUser(): User | null {
  const storedUser = getStorageItem(AUTH_USER_KEY);
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    removeStorageItem(AUTH_USER_KEY);
    removeStorageItem(AUTH_TOKEN_KEY);
    removeStorageItem(AUTH_EXPIRY_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);

  const login = (userData: User, token: string, expiresAt?: string) => {
    setUser(userData);
    setStorageItem(AUTH_USER_KEY, JSON.stringify(userData));
    setStorageItem(AUTH_TOKEN_KEY, token);
    if (expiresAt) setStorageItem(AUTH_EXPIRY_KEY, expiresAt);
  };

  const logout = () => {
    setUser(null);
    removeStorageItem(AUTH_USER_KEY);
    removeStorageItem(AUTH_TOKEN_KEY);
    removeStorageItem(AUTH_EXPIRY_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
