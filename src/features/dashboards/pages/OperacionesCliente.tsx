import { useState } from 'react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { Tabs } from '../../../core/ui/Tabs';
import FacturasCliente from '../../facturacion/pages/FacturasCliente';
import PedidosCliente from '../../pedidos/pages/PedidosCliente';
import HistorialPagosPage from '../../cobros/pages/HistorialPagosPage';

export default function OperacionesCliente() {
  const [activeTab, setActiveTab] = useState('facturas');

  const tabs = [
    { id: 'facturas', label: 'Facturas' },
    { id: 'pedidos', label: 'Pedidos' },
    { id: 'pagos', label: 'Pagos' },
  ];

  return (
    <MobilePage>
      <div className="bg-white pt-12 md:pt-6 sticky top-0 z-40 shadow-sm relative">
        <h1 className="text-2xl font-black text-slate-800 px-6 pb-4">Operaciones</h1>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>
      
      {/* Contenedor de las vistas con clases para evitar doble scroll en lo posible */}
      <div className="flex-1 overflow-hidden relative bg-surface-soft">
        <div className="absolute inset-0 overflow-y-auto">
           {activeTab === 'facturas' && <FacturasCliente />}
           {activeTab === 'pedidos' && <PedidosCliente />}
           {activeTab === 'pagos' && <HistorialPagosPage readOnly />}
        </div>
      </div>
    </MobilePage>
  );
}
