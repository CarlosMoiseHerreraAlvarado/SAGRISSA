import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, ClipboardList } from 'lucide-react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { ListCard, ListCardHeader, ListCardFooter } from '../../../core/ui/ListCard';
import { StatusBadge } from '../../../core/ui/StatusBadge';
import { SkeletonListItem } from '../../../core/ui/Skeleton';
import { EmptyState } from '../../../core/ui/EmptyState';

const MOCK_PEDIDOS_VENDEDOR = [
  { id: '1', number: 'ORD-99020', client: 'Luis Armando S.', date: 'Hoy, 10:30 AM', total: 45800, status: 'draft' as const, items: 12 },
  { id: '2', number: 'ORD-99018', client: 'Andrea Montoya', date: 'Ayer, 4:15 PM', total: 32400, status: 'fulfilled' as const, items: 8 },
  { id: '3', number: 'ORD-99015', client: 'Ferretería Central', date: '12 May, 2022', total: 67200, status: 'fulfilled' as const, items: 15 },
  { id: '4', number: 'ORD-99010', client: 'Agropecuaria El Sol', date: '10 May, 2022', total: 21500, status: 'fulfilled' as const, items: 6 },
];

export default function PedidosVendedorPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredOrders = MOCK_PEDIDOS_VENDEDOR.filter(order =>
    order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MobilePage>
      {/* Pattern Background strictly following brand guidelines */}
      <svg className="absolute top-0 right-10 w-24 h-32 pointer-events-none opacity-40 z-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0 0 Q 10 60 70 40 Q 90 30 100 40" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" fill="none"/>
      </svg>

      <header className="px-6 md:px-0 pt-16 md:pt-0 pb-6 md:pb-8 flex flex-col gap-5 z-10 relative">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Gestión de Pedidos</h1>
            <p className="text-[12px] font-bold text-brand-blue uppercase tracking-widest leading-none">Mis ventas recientes</p>
          </div>
          <button 
            onClick={() => navigate('/app/pedidos/nuevo')}
            className="bg-brand-blue text-white p-3 md:px-6 md:py-3 rounded-2xl md:rounded-xl shadow-lg flex items-center gap-2 active:scale-95 transition-all"
          >
            <Plus size={20} />
            <span className="hidden md:block font-black text-xs uppercase tracking-widest">Nuevo Pedido</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-brand-blue/15 transition-all">
            <Search size={18} className="text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Buscar por folio o cliente..." 
              className="w-full text-sm font-medium text-slate-700 bg-transparent outline-none placeholder:text-slate-300"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-white border border-slate-200 p-3.5 rounded-2xl text-slate-400 hover:text-brand-blue shadow-sm">
            <Filter size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 md:px-0 pb-24 scrollbar-hide">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array(4).fill(0).map((_, i) => <SkeletonListItem key={i} />)
          ) : filteredOrders.length === 0 ? (
            <div className="col-span-full">
              <EmptyState 
                icon={ClipboardList} 
                title="Sin resultados" 
                description="No se encontraron pedidos que coincidan con tu búsqueda." 
              />
            </div>
          ) : (
            filteredOrders.map((order) => (
              <ListCard key={order.id} onClick={() => navigate(`/app/pedidos/${order.id}`)}>

                <ListCardHeader 
                  title={order.client}
                  subtitle={order.number}
                  badge={<StatusBadge status={order.status} size="sm" />}
                />
                <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Fecha</span>
                    <span className="text-[13px] font-bold text-slate-700">{order.date}</span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Productos</span>
                    <span className="text-[13px] font-black text-brand-blue">{order.items} uni.</span>
                  </div>
                </div>
                <ListCardFooter 
                  label="Total Bruto"
                  value={`$${order.total.toLocaleString()}`}
                  variant={order.status === 'draft' ? 'highlight' : 'default'}
                />
              </ListCard>
            ))
          )}
        </div>
      </div>

      {/* Decorative Dash Line Bottom */}
      <svg className="absolute bottom-[20%] right-6 w-2 h-40 pointer-events-none opacity-20" viewBox="0 0 10 100" fill="none">
        <line x1="5" y1="0" x2="5" y2="100" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" />
      </svg>
    </MobilePage>
  );
}
