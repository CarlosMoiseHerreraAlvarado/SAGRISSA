import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../core/hooks/useAuth';
import type { Role } from '../../../types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // Redirige a login si no hay sesión, guardando a dónde quería ir
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Si tiene sesión pero no el rol necesario, expulsar a su home.
    return <Navigate to="/app/home" replace />;
  }

  // Autorizado: Retorna los hijos (Outlet)
  return <Outlet />;
};
