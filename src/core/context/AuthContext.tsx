import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  // Basic initialization to check localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('sagrissa_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('sagrissa_user', JSON.stringify(userData));
    localStorage.setItem('sagrissa_auth_token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sagrissa_user');
    localStorage.removeItem('sagrissa_auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
