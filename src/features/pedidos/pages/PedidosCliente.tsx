import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { SearchInput } from '../../../core/ui/SearchInput';
import { ListCard, ListCardHeader, ListCardFooter } from '../../../core/ui/ListCard';
import { StatusBadge } from '../../../core/ui/StatusBadge';
import { EmptyState } from '../../../core/ui/EmptyState';
import { SkeletonListItem } from '../../../core/ui/Skeleton';

const MOCK_ORDERS = [
  {
    id: '1',
    number: 'ORD-99020',
    date: '15 May, 2022',
    items: 12,
    total: 45800,
    status: 'draft' as const,
  },
  {
    id: '2',
    number: 'ORD-99018',
    date: '12 May, 2022',
    items: 8,
    total: 32400,
    status: 'fulfilled' as const,
  },
  {
    id: '3',
    number: 'ORD-99015',
    date: '08 May, 2022',
    items: 15,
    total: 67200,
    status: 'fulfilled' as const,
  },
  {
    id: '4',
    number: 'ORD-99010',
    date: '01 May, 2022',
    items: 6,
    total: 21500,
    status: 'fulfilled' as const,
  },
];

export default function PedidosCliente() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredOrders = MOCK_ORDERS.filter(order =>
    order.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen flex justify-center bg-white md:bg-transparent pb-20 md:pb-0">
      <div className="w-full h-full xl:max-w-6xl flex flex-col relative md:pt-4 md:px-8">

        {/* Header */}
        <div className="md:bg-transparent bg-white border-b border-slate-100 md:border-none p-6 flex flex-col gap-5 sticky top-0 z-30 md:relative md:p-0 md:mb-8">
          <div className="flex items-center gap-3">
            <button
              className="p-2 -ml-2 text-slate-400 hover:text-brand-blue transition-colors md:hidden"
              onClick={() => navigate('/app/cliente/home')}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Mis Pedidos</h1>
          </div>

          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por número..."
          />
        </div>

        {/* Order List */}
        <div className="flex-1 overflow-y-auto p-6 pb-24 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <>
                <SkeletonListItem />
                <SkeletonListItem />
                <SkeletonListItem />
              </>
            ) : filteredOrders.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Sin pedidos"
                description="Aún no tienes pedidos registrados"
              />
            ) : (
              filteredOrders.map((order) => (
                <ListCard
                  key={order.id}
                  onClick={() => navigate(`/app/cliente/pedidos/${order.id}`)}
                >
                  <ListCardHeader
                    title={order.number}
                    badge={<StatusBadge status={order.status} size="sm" />}
                  />
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fecha</span>
                      <span className="text-[13px] font-bold text-slate-700">{order.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Artículos</span>
                      <span className="text-[13px] font-bold text-slate-700">{order.items}</span>
                    </div>
                  </div>
                  <ListCardFooter
                    label="Total"
                    value={`$${order.total.toLocaleString()}`}
                    variant={order.status === 'draft' ? 'highlight' : 'default'}
                  />
                </ListCard>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
