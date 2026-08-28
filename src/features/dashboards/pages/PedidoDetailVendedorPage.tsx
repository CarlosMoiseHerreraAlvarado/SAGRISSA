import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Package, Printer, Share2, User } from 'lucide-react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { StatusBadge } from '../../../core/ui/StatusBadge';
import { Skeleton } from '../../../core/ui/Skeleton';
import { EmptyState } from '../../../core/ui/EmptyState';
import { orderService } from '../../pedidos/services/order.service';
import type { Order } from '../../../types';

export default function PedidoDetailVendedorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(id ? '' : 'Pedido no especificado.');
  const [order, setOrder] = useState<Order | null>(null);
  useEffect(() => {
    if (!id) return;

    let mounted = true;
    orderService.getOrderById(id)
      .then(data => {
        if (mounted) setOrder(data);
      })
      .catch(caught => {
        if (mounted) setError(caught instanceof Error ? caught.message : 'No fue posible cargar el pedido.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <MobilePage>
        <div className="flex flex-col gap-6 px-6 pb-32 pt-16 md:px-0 md:pt-0">
          <Skeleton className="h-48 w-full rounded-[40px]" />
          <Skeleton className="h-64 w-full rounded-[40px]" />
        </div>
      </MobilePage>
    );
  }

  if (error || !order) {
    return (
      <div className="w-full min-h-screen bg-white px-6 pt-14 md:bg-transparent md:px-8 md:pt-6">
        <EmptyState
          title={error || 'Pedido no encontrado'}
          description="No se pudo obtener información real de este pedido desde Azure."
          action={{ label: 'Volver a pedidos', onClick: () => navigate(-1) }}
        />
      </div>
    );
  }

  return (
    <MobilePage>
      <header className="relative z-10 flex items-center justify-between px-6 pb-6 pt-16 md:px-0 md:pt-0">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate(-1)} className="-ml-2 min-h-11 min-w-11 p-2 text-slate-400 transition-colors hover:text-brand-blue" aria-label="Volver">
            <ArrowLeft aria-hidden="true" size={24} className="mx-auto" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-800 md:text-2xl">{order.orderNumber}</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">Detalle del pedido</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" className="min-h-11 min-w-11 rounded-xl bg-slate-50 p-2.5 text-slate-400" aria-label="Imprimir pedido">
            <Printer aria-hidden="true" size={20} className="mx-auto" />
          </button>
          <button type="button" className="min-h-11 min-w-11 rounded-xl bg-slate-50 p-2.5 text-slate-400" aria-label="Compartir pedido">
            <Share2 aria-hidden="true" size={20} className="mx-auto" />
          </button>
        </div>
      </header>

      <div className="relative z-10 flex flex-col gap-6 px-6 pb-32 md:px-0 md:pb-8">
        <section className="rounded-[40px] border border-slate-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <StatusBadge status={order.status} />
              <p className="mt-2 flex items-center gap-1 text-[11px] font-bold uppercase text-slate-400">
                <Clock size={12} /> {new Date(order.dateCreated).toLocaleString('es-SV')}
              </p>
            </div>
            <div className="text-right">
              <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">Monto total</p>
              <p className="text-2xl font-black text-slate-800">${order.totalAmount.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-50 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400"><User size={16} /></div>
              <span className="text-sm font-bold text-slate-700">{order.customerName}</span>
            </div>
            {order.deliveryAddress && <p className="text-xs font-medium leading-tight text-slate-500">{order.deliveryAddress}</p>}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="px-2 text-[13px] font-black uppercase tracking-wider text-slate-800">Productos ({order.items.length})</h2>
          <div className="overflow-hidden rounded-[40px] border border-slate-100 bg-white shadow-sm">
            {order.items.length === 0 ? (
              <p className="p-6 text-center text-sm font-semibold text-slate-400">Este pedido no tiene detalle disponible.</p>
            ) : order.items.map((item, index) => (
              <div key={`${item.productId}-${index}`} className={`flex items-center justify-between p-4 sm:p-6 ${index !== order.items.length - 1 ? 'border-b border-slate-50' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-300"><Package size={20} /></div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{item.productName}</p>
                    <p className="text-[11px] font-bold uppercase text-slate-400">{item.quantity} unidades · ${item.unitPrice.toFixed(2)}</p>
                  </div>
                </div>
                <p className="text-sm font-black text-slate-700">${item.totalPrice.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MobilePage>
  );
}