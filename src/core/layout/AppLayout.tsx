import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ClipboardList,
  CloudSync,
  DollarSign,
  FileText,
  Home,
  LogOut,
  MoreHorizontal,
  Package,
  RefreshCcw,
  RotateCcw,
  Trash2,
  Settings,
  Users,
  WifiOff,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { syncService } from '../api/sync.service';
import { fetchApi } from '../api/api.config';
import type { Permission, Role } from '../../types';
import { hasPermission } from '../auth/permissions';
import { BottomSheet } from '../ui/BottomSheet';
import { APP_ROUTES } from '../routing/routes';

interface NavItem {
  label: string;
  path: string;
  Icon: typeof Home;
  permission?: Permission;
}

const NAV_CONFIG: Record<Role, NavItem[]> = {
  cliente: [
    { label: 'Inicio', path: APP_ROUTES.cliente.home, Icon: Home },
    { label: 'Cartera', path: APP_ROUTES.cliente.cartera, Icon: DollarSign },
    { label: 'Operaciones', path: APP_ROUTES.cliente.operaciones, Icon: ClipboardList, permission: 'orders.read' },
    { label: 'Catálogo', path: APP_ROUTES.cliente.catalogo, Icon: Package, permission: 'catalog.read' },
    { label: 'Facturas', path: APP_ROUTES.cliente.facturas, Icon: FileText },
    { label: 'Ajustes', path: APP_ROUTES.config, Icon: Settings },
  ],
  vendedor: [
    { label: 'Inicio', path: APP_ROUTES.vendedor.home, Icon: Home },
    { label: 'Catálogo', path: APP_ROUTES.vendedor.catalogo, Icon: Package, permission: 'catalog.read' },
    { label: 'Pedidos', path: APP_ROUTES.vendedor.pedidos, Icon: ClipboardList },
    { label: 'Clientes', path: APP_ROUTES.vendedor.clientes, Icon: Users, permission: 'customers.read' },
    { label: 'Cobros', path: APP_ROUTES.vendedor.cobros, Icon: DollarSign, permission: 'collections.read' },
    { label: 'Ajustes', path: APP_ROUTES.config, Icon: Settings },
  ],
  supervisor: [
    { label: 'Inicio', path: '/app/supervisor/home', Icon: Home },
    { label: 'Equipo', path: '/app/supervisor/equipo', Icon: Users },
    { label: 'Metas', path: '/app/supervisor/metas', Icon: BarChart3 },
    { label: 'Analytics', path: '/app/supervisor/analytics', Icon: BarChart3, permission: 'analytics.read' },
    { label: 'Aprobaciones', path: '/app/supervisor/aprobaciones', Icon: DollarSign },
    { label: 'Ajustes', path: APP_ROUTES.config, Icon: Settings },
  ],
  gerente: [
    { label: 'Inicio', path: '/app/gerente/home', Icon: Home },
    { label: 'Analytics', path: '/app/gerente/analytics', Icon: BarChart3, permission: 'analytics.read' },
    { label: 'Aprobaciones', path: '/app/gerente/aprobaciones', Icon: DollarSign },
    { label: 'Reportes', path: '/app/gerente/reportes', Icon: BarChart3 },
    { label: 'Ajustes', path: APP_ROUTES.config, Icon: Settings },
  ],
  director: [
    { label: 'Inicio', path: '/app/director/home', Icon: Home },
    { label: 'Analytics', path: '/app/director/analytics', Icon: BarChart3 },
    { label: 'Reportes', path: '/app/director/reportes', Icon: FileText },
    { label: 'Ajustes', path: APP_ROUTES.config, Icon: Settings },
  ],
};

const MOBILE_PRIMARY_PATHS: Record<Role, string[]> = {
  cliente: [APP_ROUTES.cliente.home, APP_ROUTES.cliente.cartera, APP_ROUTES.cliente.operaciones, APP_ROUTES.cliente.facturas],
  vendedor: [APP_ROUTES.vendedor.home, APP_ROUTES.vendedor.catalogo, APP_ROUTES.vendedor.pedidos, APP_ROUTES.vendedor.cobros],
  supervisor: ['/app/supervisor/home', '/app/supervisor/analytics', '/app/supervisor/equipo', '/app/supervisor/metas'],
  gerente: ['/app/gerente/home', '/app/gerente/analytics', '/app/gerente/aprobaciones', '/app/gerente/reportes'],
  director: ['/app/director/home', '/app/director/analytics', '/app/director/reportes'],
};

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [syncMessage, setSyncMessage] = useState('');

  useOfflineSync();

  useEffect(() => {
    const refreshQueue = () => {
      void Promise.all([syncService.getQueue(), syncService.getFailedQueue()]).then(([queue, failed]) => {
        setPendingCount(queue.length);
        setFailedCount(failed.length);
      });
    };

    refreshQueue();
    const interval = window.setInterval(refreshQueue, 5000);
    return () => window.clearInterval(interval);
  }, [isOnline]);

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname]);

  const handleManualSync = async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    setSyncMessage('Sincronizando operaciones pendientes...');
    try {
      const result = await syncService.processQueue(fetchApi);
      setPendingCount(result.pending);
      setFailedCount(result.failed);
      setSyncMessage(result.authExpired
        ? 'La sesión expiró. Inicie sesión para continuar la sincronización.'
        : result.pending > 0
        ? `${result.pending} operación(es) requieren atención.`
        : result.failed > 0
          ? `${result.failed} operación(es) fallaron y requieren revisión.`
          : 'Sincronización completada.');
    } catch (caught) {
      setSyncMessage(caught instanceof Error ? caught.message : 'No fue posible sincronizar.');
    } finally {
      setIsSyncing(false);
      window.setTimeout(() => setSyncMessage(''), 4000);
    }
  };

  const handleRetryFailed = async () => {
    await syncService.retryFailed();
    const queue = await syncService.getQueue();
    const failed = await syncService.getFailedQueue();
    setPendingCount(queue.length);
    setFailedCount(failed.length);
    setSyncMessage('Operaciones fallidas devueltas a la cola.');
  };

  const handleDiscardFailed = async () => {
    if (!window.confirm('¿Descartar las operaciones fallidas de esta sesión?')) return;
    await syncService.discardFailed();
    setFailedCount(0);
    setSyncMessage('Operaciones fallidas descartadas.');
  };

  const handleLogout = async () => {
    const hasOperations = pendingCount > 0 || failedCount > 0;
    if (hasOperations && isOnline) await handleManualSync();
    const [queue, failed] = await Promise.all([syncService.getQueue(), syncService.getFailedQueue()]);
    if ((queue.length > 0 || failed.length > 0) && !window.confirm('Hay operaciones pendientes. Aceptar descarta esta cola y cierra sesión; Cancelar conserva la sesión.')) return;
    if (queue.length > 0 || failed.length > 0) {
      await syncService.clearQueue();
      await syncService.discardFailed();
    }
    logout();
  };

  const navItems = user
    ? NAV_CONFIG[user.role].filter(item => !item.permission || hasPermission(user.permissions, item.permission))
    : [];
  const primaryPaths = user ? MOBILE_PRIMARY_PATHS[user.role] : [];
  const mobilePrimaryItems = primaryPaths
    .map(path => navItems.find(item => item.path === path))
    .filter((item): item is NavItem => Boolean(item))
    .slice(0, 4);
  const mobileMoreItems = navItems.filter(item => !mobilePrimaryItems.some(primary => primary.path === item.path));
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path || currentPath.startsWith(`${path}/`);
  const goTo = (path: string) => {
    setIsMoreOpen(false);
    navigate(path);
  };

  return (
    <div className="flex h-full min-h-screen w-full max-w-[100vw] overflow-hidden bg-surface-soft lg:h-screen">
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-surface-border bg-white lg:flex lg:z-10">
        <div className="flex h-20 items-center gap-3 border-b border-surface-border px-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue shadow-sm">
            <span className="font-logo text-sm font-black text-white">S</span>
          </div>
          <span className="font-logo text-xl font-black tracking-tight text-ink">SAGRISA</span>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-8" aria-label="Navegación principal">
          <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted">Navegación</p>
          {navItems.map(({ label, path: itemPath, Icon }) => {
            const active = isActive(itemPath);
            return (
              <button
                key={itemPath}
                type="button"
                onClick={() => goTo(itemPath)}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-12 w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 ${active ? 'bg-brand-blue text-white shadow-card' : 'text-ink-muted hover:bg-surface-soft hover:text-ink'}`}
              >
                <Icon aria-hidden="true" size={18} strokeWidth={active ? 2.5 : 2} />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mx-4 mb-4 rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isOnline ? 'animate-pulse bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{isOnline ? 'En línea' : 'Modo local'}</span>
            </div>
            <CloudSync aria-hidden="true" size={14} className={isSyncing ? 'animate-spin text-brand-blue' : 'text-slate-300'} />
          </div>
          {pendingCount > 0 && <p className="mb-3 text-[10px] font-bold text-amber-700">{pendingCount} operación{pendingCount === 1 ? '' : 'es'} pendiente{pendingCount === 1 ? '' : 's'}</p>}
          {failedCount > 0 && <div className="mb-3 space-y-2"><p className="text-[10px] font-bold text-red-700">{failedCount} operación{failedCount === 1 ? '' : 'es'} fallida{failedCount === 1 ? '' : 's'}</p><div className="flex gap-2"><button type="button" onClick={() => void handleRetryFailed()} className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-xl border border-red-100 bg-white px-2 text-[9px] font-black uppercase tracking-wide text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"><RotateCcw size={12} aria-hidden="true" /> Reintentar</button><button type="button" onClick={() => void handleDiscardFailed()} className="flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-red-100 bg-white text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" aria-label="Descartar operaciones fallidas"><Trash2 size={14} aria-hidden="true" /></button></div></div>}
          {syncMessage && <p role="status" className="mb-3 text-[10px] font-bold text-brand-blue">{syncMessage}</p>}
          <button
            type="button"
            onClick={() => void handleManualSync()}
            disabled={!isOnline || isSyncing}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 transition-all hover:border-brand-blue/30 hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          >
            <RefreshCcw aria-hidden="true" size={12} className={isSyncing ? 'animate-spin' : undefined} />
            Sincronizar ahora
          </button>
        </div>

        <div className="border-t border-surface-border bg-surface-soft/50 px-6 py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[13px] font-bold text-ink">{user?.name}</span>
              <span className="truncate text-[11px] font-semibold uppercase text-ink-muted">{user?.role}</span>
            </div>
            <button type="button" className="min-h-11 min-w-11 rounded-xl p-2 text-ink-light transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" onClick={() => void handleLogout()} title="Cerrar sesión" aria-label="Cerrar sesión">
              <LogOut aria-hidden="true" size={16} className="mx-auto" />
            </button>
          </div>
        </div>
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        {!isOnline && (
          <div role="status" className="z-50 flex min-h-10 items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-white">
            <WifiOff aria-hidden="true" size={16} />
            <span className="text-center text-[11px] font-black uppercase tracking-widest">Modo offline activo · Trabajando con datos locales</span>
          </div>
        )}

        <main className="relative z-0 min-w-0 flex-1 overflow-y-auto pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-0">
          <Outlet />
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-50 flex h-[72px] border-t border-surface-border bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.02)] safe-bottom lg:hidden" aria-label="Navegación móvil">
          {mobilePrimaryItems.map(({ label, path: itemPath, Icon }) => {
            const active = isActive(itemPath);
            return (
              <button
                key={itemPath}
                type="button"
                onClick={() => goTo(itemPath)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex min-w-0 min-h-12 flex-1 flex-col items-center justify-center gap-1 px-1 transition-all focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-blue ${active ? 'text-brand-blue' : 'text-ink-muted hover:text-ink'}`}
              >
                {active && <div aria-hidden="true" className="absolute left-1/2 top-0 h-1 w-8 -translate-x-1/2 rounded-b-full bg-brand-blue" />}
                <Icon aria-hidden="true" size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span className={`mobile-nav-label max-w-full truncate text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
              </button>
            );
          })}
          {mobileMoreItems.length > 0 && (
            <button
              type="button"
              onClick={() => setIsMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isMoreOpen}
              className={`relative flex min-w-0 min-h-12 flex-1 flex-col items-center justify-center gap-1 px-1 text-ink-muted transition-all hover:text-ink focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-blue ${mobileMoreItems.some(item => isActive(item.path)) ? 'text-brand-blue' : ''}`}
            >
              {mobileMoreItems.some(item => isActive(item.path)) && <div aria-hidden="true" className="absolute left-1/2 top-0 h-1 w-8 -translate-x-1/2 rounded-b-full bg-brand-blue" />}
              <MoreHorizontal aria-hidden="true" size={22} />
              <span className="mobile-nav-label max-w-full truncate text-[10px] font-medium">Más</span>
            </button>
          )}
        </nav>

        <BottomSheet open={isMoreOpen} title="Más opciones" onClose={() => setIsMoreOpen(false)}>
          <nav className="grid gap-2" aria-label="Más opciones de navegación">
            {mobileMoreItems.map(({ label, path: itemPath, Icon }) => {
              const active = isActive(itemPath);
              return (
                <button
                  key={itemPath}
                  type="button"
                  onClick={() => goTo(itemPath)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${active ? 'bg-brand-blue text-white' : 'bg-surface-soft text-ink hover:bg-slate-100'}`}
                >
                  <Icon aria-hidden="true" size={19} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>
        </BottomSheet>
      </div>
    </div>
  );
}
