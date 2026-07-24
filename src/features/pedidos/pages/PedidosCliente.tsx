import { useEffect, useState } from 'react';
import { ArrowLeft, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SearchInput } from '../../../core/ui/SearchInput';
import { ListCard, ListCardFooter, ListCardHeader } from '../../../core/ui/ListCard';
import { StatusBadge } from '../../../core/ui/StatusBadge';
import { EmptyState } from '../../../core/ui/EmptyState';
import { SkeletonListItem } from '../../../core/ui/Skeleton';
import { orderService } from '../services/order.service';
import type { Order } from '../../../types';

export default function PedidosCliente() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    orderService.getMyOrders().then(setOrders).catch(caught => setError(caught instanceof Error ? caught.message : 'No fue posible cargar tus pedidos.')).finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(order => order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()));
  return <main className="w-full min-h-full bg-white md:bg-transparent pb-24"><div className="mx-auto w-full max-w-6xl px-6 py-6 md:px-8 md:py-8"><header className="mb-8 space-y-5"><div className="flex items-center gap-3"><button type="button" onClick={() => navigate('/app/cliente/home')} className="min-h-11 min-w-11 text-ink-muted md:hidden" aria-label="Volver"><ArrowLeft size={24} className="mx-auto" /></button><h1 className="text-xl font-black text-ink md:text-2xl">Mis pedidos</h1></div><SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por número..." /></header>{error && <p role="alert" className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{loading ? [1, 2, 3].map(item => <SkeletonListItem key={item} />) : filtered.length === 0 ? <EmptyState icon={Package} title="Sin pedidos" description={error ? 'Intenta nuevamente cuando haya conexión.' : 'Aún no tienes pedidos registrados.'} /> : filtered.map(order => <ListCard key={order.id} onClick={() => navigate(`/app/cliente/pedidos/${order.id}`)}><ListCardHeader title={order.orderNumber} badge={<StatusBadge status={order.status} size="sm" />} /><div className="mb-4 grid grid-cols-2 gap-4"><div><span className="block text-[10px] font-bold uppercase text-ink-muted">Fecha</span><span className="text-sm font-bold text-ink">{new Date(order.dateCreated).toLocaleDateString('es-SV')}</span></div><div className="text-right"><span className="block text-[10px] font-bold uppercase text-ink-muted">Artículos</span><span className="text-sm font-bold text-ink">{order.items.length}</span></div></div><ListCardFooter label="Total" value={`$${order.totalAmount.toLocaleString()}`} /></ListCard>)}</div></div></main>;
}
