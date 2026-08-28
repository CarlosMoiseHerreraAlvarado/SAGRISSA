import { OfflineBanner } from './core/ui/OfflineBanner';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuth } from './core/hooks/useAuth';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import OnboardingPage from './features/auth/pages/OnboardingPage';
import LoginPage from './features/auth/pages/LoginPage';
import AppLayout from './core/layout/AppLayout';

// Páginas del Cliente
const HomeCliente = lazy(() => import('./features/dashboards/pages/HomeCliente'));
const OperacionesCliente = lazy(() => import('./features/dashboards/pages/OperacionesCliente'));
const AccountCliente = lazy(() => import('./features/facturacion/pages/AccountCliente'));
const FacturasCliente = lazy(() => import('./features/facturacion/pages/FacturasCliente'));
const FacturaDetailCliente = lazy(() => import('./features/facturacion/pages/FacturaDetailCliente'));
const PedidosCliente = lazy(() => import('./features/pedidos/pages/PedidosCliente'));
const PedidoDetailPage = lazy(() => import('./features/pedidos/pages/PedidoDetailPage'));
const DashboardVendedor = lazy(() => import('./features/dashboards/pages/DashboardVendedor'));
const DashboardSupervisor = lazy(() => import('./features/dashboards/pages/DashboardSupervisor'));
const DashboardGerente = lazy(() => import('./features/dashboards/pages/DashboardGerente'));
const DashboardDirector = lazy(() => import('./features/dashboards/pages/DashboardDirector'));
const PedidosVendedorPage = lazy(() => import('./features/dashboards/pages/PedidosVendedorPage'));
const CatalogoPage = lazy(() => import('./features/catalogo/pages/CatalogoPage'));
const NuevoPedidoPage = lazy(() => import('./features/pedidos/pages/NuevoPedidoPage'));
const SupervisorApprovalsPage = lazy(() => import('./features/dashboards/pages/SupervisorApprovalsPage'));
const GerenteApprovalsPage = lazy(() => import('./features/dashboards/pages/GerenteApprovalsPage'));
const SupervisorEquipoPage = lazy(() => import('./features/dashboards/pages/SupervisorEquipoPage'));
const SupervisorMetasPage = lazy(() => import('./features/dashboards/pages/SupervisorMetasPage'));
const DirectorAnalyticsPage = lazy(() => import('./features/dashboards/pages/DirectorAnalyticsPage'));
const RoleAnalyticsPage = lazy(() => import('./features/dashboards/pages/RoleAnalyticsPage'));
const DirectorReportesPage = lazy(() => import('./features/dashboards/pages/DirectorReportesPage'));
const ProfilePage = lazy(() => import('./features/auth/pages/ProfilePage'));
const HistorialPagosPage = lazy(() => import('./features/cobros/pages/HistorialPagosPage'));
const RegistroCobrosPage = lazy(() => import('./features/cobros/pages/RegistroCobrosPage'));
const CarteraPage = lazy(() => import('./features/cartera/pages/CarteraPage'));
const VendedorReportesPage = lazy(() => import('./features/dashboards/pages/VendedorReportesPage'));
const ClientesAsignadosPage = lazy(() => import('./features/dashboards/pages/ClientesAsignadosPage'));
const PedidoDetailVendedorPage = lazy(() => import('./features/dashboards/pages/PedidoDetailVendedorPage'));
const FacturasPage = lazy(() => import('./features/facturacion/pages/FacturasPage'));
const GerenteMetasPage = lazy(() => import('./features/dashboards/pages/GerenteMetasPage'));

const DEFAULT_ROUTES = {
  cliente: '/app/cliente/home', vendedor: '/app/vendedor/home', supervisor: '/app/supervisor/home',
  gerente: '/app/gerente/home', director: '/app/director/home',
} as const;

function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? DEFAULT_ROUTES[user.role] : '/onboarding'} replace />;
}

function RouteLoader() {
  return <div className="flex min-h-full items-center justify-center p-8 text-sm font-bold text-ink-muted" role="status">Cargando módulo…</div>;
}




function App() {
  return (
    <Router>
      <OfflineBanner />
      <Suspense fallback={<RouteLoader />}>
        <Routes>
        {/* ─── Rutas Públicas ─── */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* ─── Rutas Protegidas ─── */}
        <Route path="/app" element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>

            {/* ─── Cliente ─── */}
            <Route element={<ProtectedRoute allowedRoles={['cliente']} requiredPermissions="account.read" />}>
              <Route path="cliente/home" element={<HomeCliente />} />
              <Route element={<ProtectedRoute requiredPermissions="orders.read" />}>
                <Route path="cliente/operaciones" element={<OperacionesCliente />} />
                <Route path="cliente/pedidos" element={<PedidosCliente />} />
                <Route path="cliente/pedidos/:id" element={<PedidoDetailPage />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermissions="catalog.read" />}>
                <Route path="cliente/catalogo" element={<CatalogoPage readOnly />} />
              </Route>
              <Route path="cliente/cartera" element={<AccountCliente />} />
              <Route element={<ProtectedRoute requiredPermissions="invoices.read" />}>
                <Route path="cliente/facturas" element={<FacturasCliente />} />
                <Route path="cliente/facturas/:id" element={<FacturaDetailCliente />} />
              </Route>

            </Route>

            {/* ─── Vendedor ─── */}
            <Route element={<ProtectedRoute allowedRoles={['vendedor']} requiredPermissions="orders.read" />}>
              <Route path="vendedor/home" element={<DashboardVendedor />} />
              <Route path="clientes" element={<ClientesAsignadosPage />} />
              <Route path="cartera" element={<CarteraPage />} />
              <Route path="cobros" element={<HistorialPagosPage />} />
              <Route element={<ProtectedRoute requiredPermissions={['collections.read', 'collections.create']} />}>
                <Route path="cobros/nuevo" element={<RegistroCobrosPage />} />
              </Route>
              <Route path="reportes" element={<VendedorReportesPage />} />
              <Route element={<ProtectedRoute requiredPermissions="catalog.read" />}>
                <Route path="catalogo" element={<CatalogoPage />} />
              </Route>

              <Route path="pedidos" element={<PedidosVendedorPage />} />
              <Route path="pedidos/:id" element={<PedidoDetailVendedorPage />} />
              <Route element={<ProtectedRoute requiredPermissions="orders.create" />}>
                <Route path="pedidos/nuevo" element={<NuevoPedidoPage />} />
              </Route>
              <Route path="facturas" element={<FacturasPage />} />


            </Route>

            {/* ─── Supervisor ─── */}
            <Route element={<ProtectedRoute allowedRoles={['supervisor']} requiredPermissions="goals.read" />}>
              <Route path="supervisor/home" element={<DashboardSupervisor />} />
              <Route path="supervisor/equipo" element={<SupervisorEquipoPage />} />
              <Route path="supervisor/metas" element={<SupervisorMetasPage />} />
              <Route element={<ProtectedRoute requiredPermissions="analytics.read" />}>
                <Route path="supervisor/analytics" element={<RoleAnalyticsPage title="Analytics de supervisión" subtitle="Seguimiento del equipo y cartera" />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermissions="approvals.read" />}>
                <Route path="supervisor/aprobaciones" element={<SupervisorApprovalsPage />} />
              </Route>
              <Route path="supervisor/facturas" element={<FacturasPage />} />
            </Route>


            {/* ─── Gerente ─── */}
            <Route element={<ProtectedRoute allowedRoles={['gerente']} requiredPermissions="approvals.read" />}>
              <Route path="gerente/home" element={<DashboardGerente />} />
              <Route element={<ProtectedRoute requiredPermissions="approvals.read" />}>
                <Route path="gerente/aprobaciones" element={<GerenteApprovalsPage />} />
              </Route>
              <Route path="gerente/metas" element={<GerenteMetasPage />} />
              <Route element={<ProtectedRoute requiredPermissions="analytics.read" />}>
                <Route path="gerente/analytics" element={<RoleAnalyticsPage title="Analytics gerencial" subtitle="Ventas, facturación y cobros consolidados" />} />
              </Route>
              <Route path="gerente/reportes" element={<DirectorReportesPage />} />
              <Route path="gerente/facturas" element={<FacturasPage />} />
            </Route>


            {/* ─── Director ─── */}
            <Route element={<ProtectedRoute allowedRoles={['director']} requiredPermissions="analytics.read" />}>
              <Route path="director/home" element={<DashboardDirector />} />
              <Route path="director/analytics" element={<DirectorAnalyticsPage />} />
              <Route path="director/reportes" element={<DirectorReportesPage />} />
              <Route path="director/facturas" element={<FacturasPage />} />
            </Route>


            {/* ─── Configuración global ─── */}
            <Route path="config" element={<ProfilePage />} />


            {/* ─── Redirects legacy ─── */}
            <Route path="home" element={<Navigate to="/app/cliente/home" replace />} />

          </Route>
        </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
