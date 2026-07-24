import { useEffect, useState } from 'react';
import { ClipboardList, Filter, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobilePage } from '../../../core/layout/MobilePage';
import { EmptyState } from '../../../core/ui/EmptyState';
import { ListCard, ListCardFooter, ListCardHeader } from '../../../core/ui/ListCard';
import { SkeletonListItem } from '../../../core/ui/Skeleton';
import { StatusBadge } from '../../../core/ui/StatusBadge';
import { orderService } from '../../pedidos/services/order.service';
import type { Order } from '../../../types';

export default function PedidosVendedorPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { orderService.getMyOrders().then(setOrders).catch(caught => setError(caught instanceof Error ? caught.message : 'No fue posible cargar los pedidos.')).finally(() => setLoading(false)); }, []);
  const filtered = orders.filter(order => `${order.orderNumber} ${order.customerName}`.toLowerCase().includes(search.toLowerCase()));
  return <MobilePage><header className="px-6 pb-6 pt-12 md:px-0 md:pt-0"><div className="flex items-center justify-between"><div><h1 className="text-xl font-black text-ink md:text-2xl">Gestión de pedidos</h1><p className="text-[11px] font-black uppercase tracking-widest text-brand-blue">Mis ventas recientes</p></div><button type="button" onClick={() => navigate('/app/pedidos/nuevo')} className="flex min-h-11 items-center gap-2 rounded-2xl bg-brand-blue px-4 text-xs font-black uppercase tracking-widest text-white"><Plus size={18} /> <span className="hidden md:inline">Nuevo</span></button></div><div className="mt-5 flex items-center gap-2 rounded-2xl border border-surface-border bg-white px-4 py-3"><Search size={18} className="text-ink-light" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar por folio o cliente" className="w-full outline-none" aria-label="Buscar pedido" /><button type="button" aria-label="Filtros" className="min-h-11 min-w-11 text-ink-muted"><Filter size={18} className="mx-auto" /></button></div></header><div className="px-6 pb-24 md:px-0">{error && <p role="alert" className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{loading ? [1, 2, 3].map(item => <SkeletonListItem key={item} />) : filtered.length === 0 ? <EmptyState icon={ClipboardList} title="Sin pedidos" description="No hay pedidos disponibles para tu alcance." /> : filtered.map(order => <ListCard key={order.id} onClick={() => navigate(`/app/pedidos/${order.id}`)}><ListCardHeader title={order.customerName} subtitle={order.orderNumber} badge={<StatusBadge status={order.status} size="sm" />} /><div className="mb-4 flex justify-between"><span className="text-xs font-semibold text-ink-muted">{new Date(order.dateCreated).toLocaleDateString('es-SV')}</span><span className="text-xs font-bold text-brand-blue">{order.items.length} artículos</span></div><ListCardFooter label="Total" value={`$${order.totalAmount.toLocaleString()}`} /></ListCard>)}</div></div></MobilePage>;
}
