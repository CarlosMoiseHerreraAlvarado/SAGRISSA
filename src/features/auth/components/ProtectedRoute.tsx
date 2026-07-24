import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../core/hooks/useAuth';
import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import type { Permission } from '../../../types';
import { hasPermission } from '../../../core/auth/permissions';
import { AUTH_EXPIRED_EVENT } from '../../../core/api/api.config';

interface ProtectedRouteProps {
  requiredClaims?: string[];
  requiredPermissions?: Permission | Permission[];
  allowedRoles?: string[]; // Kept for legacy/fallback if needed in App.tsx briefly, though we will migrate to claims
}

export const ProtectedRoute = ({ requiredClaims, requiredPermissions, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleExpired = () => logout();
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, [logout]);

  if (!isAuthenticated || !user) {
    // Redirige a login si no hay sesión
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // REGLA OFFLINE
  if (!isOnline && !user.isOfflineCapable) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center animate-in fade-in z-[9999] relative">
        <div className="bg-slate-800 p-8 rounded-3xl max-w-md w-full border border-slate-700 shadow-2xl">
           <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <WifiOff size={32} />
           </div>
           <h2 className="text-xl font-black text-white mb-2">Sin Conexión</h2>
           <p className="text-slate-400 text-sm mb-6 leading-relaxed">
             Tu perfil de <strong className="uppercase text-white">{user.role}</strong> requiere conexión activa al servidor para operar. Por favor, conéctate a internet para continuar.
           </p>
        </div>
      </div>
    );
  }

  // VALIDACIÓN POR CLAIMS
  if (requiredPermissions && !hasPermission(user.permissions, requiredPermissions, 'every')) {
    return <Navigate to={`/app/${user.role}/home`} state={{ reason: 'forbidden' }} replace />;
  }

  if (requiredClaims && requiredClaims.length > 0) {
    const hasRequiredClaims = requiredClaims.some(claim => user.claims?.includes(claim));
    if (!hasRequiredClaims) {
       return <Navigate to={`/app/${user.role}/home`} replace />;
    }
  } else if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Fallback legacy (por rol)
    return <Navigate to={`/app/${user.role}/home`} replace />;
  }

  return <Outlet />;
};
