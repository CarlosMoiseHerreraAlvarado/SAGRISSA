import type { ReactNode } from 'react';
import { useAuth } from './useAuth';
import type { Permission } from '../../types';
import { hasPermission } from '../auth/permissions';

interface HasPermissionProps {
  claim: Permission | Permission[];
  mode?: 'some' | 'every';
  children: ReactNode;
  fallback?: ReactNode;
}

export const HasPermission = ({ claim, mode = 'some', children, fallback = null }: HasPermissionProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  const hasAccess = hasPermission(user.permissions, claim, mode);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
