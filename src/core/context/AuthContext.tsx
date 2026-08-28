import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../../types';
import { AuthContext } from './AuthContextDef';

const AUTH_USER_KEY = 'sagrissa_user';
const AUTH_TOKEN_KEY = 'sagrissa_auth_token';
const AUTH_EXPIRY_KEY = 'sagrissa_auth_expires_at';
const AUTH_STORAGE_KEYS = new Set([AUTH_USER_KEY, AUTH_TOKEN_KEY, AUTH_EXPIRY_KEY]);

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
    sessionStorage.removeItem(key);
    return;
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

function clearStoredSession() {
  removeStorageItem(AUTH_USER_KEY);
  removeStorageItem(AUTH_TOKEN_KEY);
  removeStorageItem(AUTH_EXPIRY_KEY);
}

function readStoredUser(): User | null {
  const storedUser = getStorageItem(AUTH_USER_KEY);
  const storedToken = getStorageItem(AUTH_TOKEN_KEY);
  const storedExpiry = getStorageItem(AUTH_EXPIRY_KEY);
  if (!storedUser || !storedToken) {
    if (storedUser || storedToken || storedExpiry) clearStoredSession();
    return null;
  }

  if (storedExpiry) {
    const expiresAt = Date.parse(storedExpiry);
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      clearStoredSession();
      return null;
    }
  }

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (!AUTH_STORAGE_KEYS.has(event.key ?? '')) return;
      window.setTimeout(() => setUser(readStoredUser()), 0);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (userData: User, token: string, expiresAt?: string) => {
    clearStoredSession();
    setUser(userData);
    setStorageItem(AUTH_USER_KEY, JSON.stringify(userData));
    setStorageItem(AUTH_TOKEN_KEY, token);
    if (expiresAt) setStorageItem(AUTH_EXPIRY_KEY, expiresAt);
    else removeStorageItem(AUTH_EXPIRY_KEY);
  };

  const logout = () => {
    setUser(null);
    clearStoredSession();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
