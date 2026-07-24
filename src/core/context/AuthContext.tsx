import { useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../../types';
import { AuthContext } from './AuthContextDef';

const SESSION_USER_KEY = 'sagrissa_user';
const SESSION_TOKEN_KEY = 'sagrissa_auth_token';
const SESSION_EXPIRY_KEY = 'sagrissa_auth_expires_at';

function readStoredUser(): User | null {
  const storedUser = sessionStorage.getItem(SESSION_USER_KEY);
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    sessionStorage.removeItem(SESSION_USER_KEY);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_EXPIRY_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);

  const login = (userData: User, token: string, expiresAt?: string) => {
    setUser(userData);
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(userData));
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    if (expiresAt) sessionStorage.setItem(SESSION_EXPIRY_KEY, expiresAt);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_USER_KEY);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_EXPIRY_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
