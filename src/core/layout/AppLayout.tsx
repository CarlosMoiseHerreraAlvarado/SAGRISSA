import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, DollarSign, FileText, Package, ClipboardList, Settings, LogOut, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '../../types';

interface NavItem {
  label: string;
  path: string;
  Icon: typeof Home;
}

const NAV_CONFIG: Record<Role, NavItem[]> = {
  cliente: [
    { label: 'Inicio', path: '/app/cliente/home', Icon: Home },
    { label: 'Cuenta', path: '/app/cliente/cuenta', Icon: DollarSign },
    { label: 'Facturas', path: '/app/cliente/facturas', Icon: FileText },
    { label: 'Ajustes', path: '/app/cliente/config', Icon: Settings },
  ],
  vendedor: [
    { label: 'Inicio', path: '/app/vendedor/home', Icon: Home },
    { label: 'Catálogo', path: '/app/catalogo', Icon: Package },
    { label: 'Pedidos', path: '/app/pedidos', Icon: ClipboardList },
    { label: 'Ajustes', path: '/app/config', Icon: Settings },
  ],
  supervisor: [
    { label: 'Inicio', path: '/app/supervisor/home', Icon: Home },
    { label: 'Equipo', path: '/app/supervisor/equipo', Icon: Users },
    { label: 'Metas', path: '/app/supervisor/metas', Icon: BarChart3 },
    { label: 'Ajustes', path: '/app/config', Icon: Settings },
  ],
  gerente: [
    { label: 'Inicio', path: '/app/gerente/home', Icon: Home },
    { label: 'Aprobaciones', path: '/app/gerente/aprobaciones', Icon: DollarSign },
    { label: 'Reportes', path: '/app/gerente/reportes', Icon: BarChart3 },
    { label: 'Ajustes', path: '/app/config', Icon: Settings },
  ],
  director: [
    { label: 'Inicio', path: '/app/director/home', Icon: Home },
    { label: 'Analytics', path: '/app/director/analytics', Icon: BarChart3 },
    { label: 'Reportes', path: '/app/director/reportes', Icon: FileText },
    { label: 'Ajustes', path: '/app/config', Icon: Settings },
  ],
};

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = user ? NAV_CONFIG[user.role] : [];
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath.includes(path);

  return (
    <div className="h-screen flex bg-surface-soft overflow-hidden w-full">

      {/* ─── Sidebar (Desktop) ─── */}
      <aside className="hidden md:flex flex-col w-[260px] bg-white border-r border-surface-border shrink-0 z-10">
        
        {/* Brand */}
        <div className="h-20 px-8 flex items-center gap-3 border-b border-surface-border">
          <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center shadow-sm">
            <span className="text-white font-logo font-black text-sm">S</span>
          </div>
          <span className="font-logo font-black text-ink text-xl tracking-tight">SAGRISA</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-8 flex flex-col gap-2">
          <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest px-4 mb-2">
            Navegación
          </p>
          {navItems.map(({ label, path: itemPath, Icon }) => (
            <button
              key={itemPath}
              onClick={() => navigate(itemPath)}
              className={`
                w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left text-[14px] font-bold transition-all
                ${isActive(itemPath) 
                  ? 'bg-brand-blue text-white shadow-card' 
                  : 'text-ink-muted hover:bg-surface-soft hover:text-ink'
                }
              `}
            >
              <Icon size={18} strokeWidth={isActive(itemPath) ? 2.5 : 2} />
              {label}
            </button>
          ))}
        </nav>

        {/* Profile Footer */}
        <div className="px-6 py-6 border-t border-surface-border bg-surface-soft/50">
          <div className="flex items-center justify-between">
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-ink truncate">{user?.name}</span>
              <span className="text-[11px] font-semibold uppercase text-ink-muted truncate capitalize">
                {user?.role}
              </span>
            </div>
            <button 
              className="text-ink-light hover:text-red-500 transition-colors p-2" 
              onClick={logout}
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

      </aside>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <main className="flex-1 overflow-y-auto pb-[90px] md:pb-0 w-full relative z-0">
          <Outlet />
        </main>

        {/* ─── Bottom Nav (Mobile Only) ─── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-surface-border shadow-[0_-2px_10px_rgba(0,0,0,0.02)] z-50 flex h-[70px] safe-bottom">
          {navItems.map(({ label, path: itemPath, Icon }) => (
            <button
              key={itemPath}
              onClick={() => navigate(itemPath)}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1 transition-all relative
                ${isActive(itemPath) ? 'text-brand-blue' : 'text-ink-muted hover:text-ink'}
              `}
            >
              {isActive(itemPath) && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-blue rounded-b-full" />
              )}
              <Icon size={22} strokeWidth={isActive(itemPath) ? 2.5 : 1.8} />
              <span className={`text-[10px] ${isActive(itemPath) ? 'font-bold' : 'font-medium'}`}>
                {label}
              </span>
            </button>
          ))}
        </nav>
      </div>

    </div>
  );
}
