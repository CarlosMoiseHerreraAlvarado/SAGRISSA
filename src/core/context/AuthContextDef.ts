import { createContext } from 'react';
import type { User } from '../../types';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string, expiresAt?: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
