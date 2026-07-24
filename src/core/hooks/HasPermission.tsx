import type { ReactNode } from 'react';
import { useAuth } from './useAuth';

interface HasPermissionProps {
  claim: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const HasPermission = ({ claim, children, fallback = null }: HasPermissionProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  const claimsToCheck = Array.isArray(claim) ? claim : [claim];
  
  // Require at least one of the claims
  const hasAccess = claimsToCheck.some(c => user.claims?.includes(c));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
