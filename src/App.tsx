import { OfflineBanner } from './core/ui/OfflineBanner';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import OnboardingPage from './features/auth/pages/OnboardingPage';
import LoginPage from './features/auth/pages/LoginPage';
import AppLayout from './core/layout/AppLayout';

// Páginas del Cliente
import HomeCliente from './features/dashboards/pages/HomeCliente';
import AccountCliente from './features/facturacion/pages/AccountCliente';
import FacturasCliente from './features/facturacion/pages/FacturasCliente';
import FacturaDetailCliente from './features/facturacion/pages/FacturaDetailCliente';
import PedidosCliente from './features/pedidos/pages/PedidosCliente';
import SettingsCliente from './features/config/pages/SettingsCliente';
import DashboardVendedor from './features/dashboards/pages/DashboardVendedor';
import DashboardSupervisor from './features/dashboards/pages/DashboardSupervisor';
import DashboardGerente from './features/dashboards/pages/DashboardGerente';
import DashboardDirector from './features/dashboards/pages/DashboardDirector';
import PedidosVendedorPage from './features/dashboards/pages/PedidosVendedorPage';
import CatalogoPage from './features/catalogo/pages/CatalogoPage';
import NuevoPedidoPage from './features/pedidos/pages/NuevoPedidoPage';

import ApprovalsPage from './features/dashboards/pages/ApprovalsPage';
import SupervisorEquipoPage from './features/dashboards/pages/SupervisorEquipoPage';
import SupervisorMetasPage from './features/dashboards/pages/SupervisorMetasPage';
import DirectorAnalyticsPage from './features/dashboards/pages/DirectorAnalyticsPage';
import DirectorReportesPage from './features/dashboards/pages/DirectorReportesPage';
import ProfilePage from './features/auth/pages/ProfilePage';

import ClientesAsignadosPage from './features/dashboards/pages/ClientesAsignadosPage';
import EstadoCarteraPage from './features/dashboards/pages/EstadoCarteraPage';
import PedidoDetailVendedorPage from './features/dashboards/pages/PedidoDetailVendedorPage';





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
            <Route element={<ProtectedRoute allowedRoles={['cliente']} />}>
              <Route path="cliente/home" element={<HomeCliente />} />
              <Route path="cliente/cuenta" element={<AccountCliente />} />
              <Route path="cliente/facturas" element={<FacturasCliente />} />
              <Route path="cliente/facturas/:id" element={<FacturaDetailCliente />} />
              <Route path="cliente/pedidos" element={<PedidosCliente />} />
              <Route path="cliente/config" element={<SettingsCliente />} />
            </Route>

            {/* ─── Vendedor ─── */}
            <Route element={<ProtectedRoute allowedRoles={['vendedor']} />}>
              <Route path="vendedor/home" element={<DashboardVendedor />} />
              <Route path="clientes" element={<ClientesAsignadosPage />} />
              <Route path="cobros" element={<EstadoCarteraPage />} />
              <Route path="catalogo" element={<CatalogoPage />} />

              <Route path="pedidos" element={<PedidosVendedorPage />} />
              <Route path="pedidos/:id" element={<PedidoDetailVendedorPage />} />
              <Route path="pedidos/nuevo" element={<NuevoPedidoPage />} />

            </Route>

            {/* ─── Supervisor ─── */}
            <Route element={<ProtectedRoute allowedRoles={['supervisor']} />}>
              <Route path="supervisor/home" element={<DashboardSupervisor />} />
              <Route path="supervisor/equipo" element={<SupervisorEquipoPage />} />
              <Route path="supervisor/metas" element={<SupervisorMetasPage />} />
            </Route>


            {/* ─── Gerente ─── */}
            <Route element={<ProtectedRoute allowedRoles={['gerente']} />}>
              <Route path="gerente/home" element={<DashboardGerente />} />
              <Route path="gerente/aprobaciones" element={<ApprovalsPage />} />
            </Route>


            {/* ─── Director ─── */}
            <Route element={<ProtectedRoute allowedRoles={['director']} />}>
              <Route path="director/home" element={<DashboardDirector />} />
              <Route path="director/analytics" element={<DirectorAnalyticsPage />} />
              <Route path="director/reportes" element={<DirectorReportesPage />} />
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
