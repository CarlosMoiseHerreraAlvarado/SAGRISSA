import { OfflineBanner } from './core/ui/OfflineBanner';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import OnboardingPage from './features/auth/pages/OnboardingPage';
import LoginPage from './features/auth/pages/LoginPage';
import AppLayout from './core/layout/AppLayout';

// Páginas del Cliente
import HomeCliente from './features/dashboards/pages/HomeCliente';
import OperacionesCliente from './features/dashboards/pages/OperacionesCliente';
import AccountCliente from './features/facturacion/pages/AccountCliente';
import FacturasCliente from './features/facturacion/pages/FacturasCliente';
import FacturaDetailCliente from './features/facturacion/pages/FacturaDetailCliente';
import PedidosCliente from './features/pedidos/pages/PedidosCliente';
import PedidoDetailPage from './features/pedidos/pages/PedidoDetailPage';

import DashboardVendedor from './features/dashboards/pages/DashboardVendedor';
import DashboardSupervisor from './features/dashboards/pages/DashboardSupervisor';
import DashboardGerente from './features/dashboards/pages/DashboardGerente';
import DashboardDirector from './features/dashboards/pages/DashboardDirector';
import PedidosVendedorPage from './features/dashboards/pages/PedidosVendedorPage';
import CatalogoPage from './features/catalogo/pages/CatalogoPage';
import NuevoPedidoPage from './features/pedidos/pages/NuevoPedidoPage';

import SupervisorApprovalsPage from './features/dashboards/pages/SupervisorApprovalsPage';
import GerenteApprovalsPage from './features/dashboards/pages/GerenteApprovalsPage';
import SupervisorEquipoPage from './features/dashboards/pages/SupervisorEquipoPage';
import SupervisorMetasPage from './features/dashboards/pages/SupervisorMetasPage';
import DirectorAnalyticsPage from './features/dashboards/pages/DirectorAnalyticsPage';
import DirectorReportesPage from './features/dashboards/pages/DirectorReportesPage';
import ProfilePage from './features/auth/pages/ProfilePage';
import HistorialPagosPage from './features/cobros/pages/HistorialPagosPage';
import RegistroCobrosPage from './features/cobros/pages/RegistroCobrosPage';
import CarteraPage from './features/cartera/pages/CarteraPage';
import VendedorReportesPage from './features/dashboards/pages/VendedorReportesPage';

import ClientesAsignadosPage from './features/dashboards/pages/ClientesAsignadosPage';
import PedidoDetailVendedorPage from './features/dashboards/pages/PedidoDetailVendedorPage';
import FacturasPage from './features/facturacion/pages/FacturasPage';
import GerenteMetasPage from './features/dashboards/pages/GerenteMetasPage';




function App() {
  return (
    <Router>
      <OfflineBanner />
      <Routes>
        {/* ─── Rutas Públicas ─── */}
        <Route path="/" element={<Navigate to="/onboarding" replace />} />
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
              <Route element={<ProtectedRoute requiredPermissions={['orders.read', 'orders.update']} />}>
                <Route path="pedidos/:id/editar" element={<NuevoPedidoPage />} />
              </Route>
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
              <Route element={<ProtectedRoute requiredPermissions={['approvals.read', 'approvals.decide']} />}>
                <Route path="supervisor/aprobaciones" element={<SupervisorApprovalsPage />} />
              </Route>
              <Route path="supervisor/facturas" element={<FacturasPage />} />
            </Route>


            {/* ─── Gerente ─── */}
            <Route element={<ProtectedRoute allowedRoles={['gerente']} requiredPermissions="approvals.read" />}>
              <Route path="gerente/home" element={<DashboardGerente />} />
              <Route element={<ProtectedRoute requiredPermissions={['approvals.read', 'approvals.decide']} />}>
                <Route path="gerente/aprobaciones" element={<GerenteApprovalsPage />} />
              </Route>
              <Route path="gerente/metas" element={<GerenteMetasPage />} />
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
    </Router>
  );
}

export default App;
