import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle2, Truck, Calendar, MapPin, FileText } from 'lucide-react';
import { orderService } from '../services/order.service';
import type { Order } from '../../../types';
import { Skeleton } from '../../../core/ui/Skeleton';
import { StatusBadge } from '../../../core/ui/StatusBadge';
import { EmptyState } from '../../../core/ui/EmptyState';

export default function PedidoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    orderService.getOrderById(id)
      .then(data => {
        if (isMounted) {
          setOrder(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'No fue posible cargar la información del pedido.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="w-full min-h-screen p-8 flex flex-col gap-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-[40px]" />
        <Skeleton className="h-48 w-full rounded-[40px]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="w-full min-h-screen bg-white md:bg-transparent pt-14 md:pt-6 px-6 md:px-8">
        <EmptyState
          title={error || "Pedido no encontrado"}
          description="No se pudo obtener la información de este pedido."
          action={{
            label: "Volver a Pedidos",
            onClick: () => navigate(-1),
          }}
        />
      </div>
    );
  }

  const steps = [
    { label: 'Recibido', status: 'draft', icon: Clock },
    { label: 'Aprobado', status: 'approved', icon: CheckCircle2 },
    { label: 'En Preparación', status: 'processing', icon: Package },
    { label: 'En Camino', status: 'shipped', icon: Truck },
    { label: 'Entregado', status: 'fulfilled', icon: CheckCircle2 },
  ];

  const isRejected = order.status === 'rejected';

  // Determinar el índice actual del paso basado en el status
  const getActiveStep = () => {
    if (order.status === 'draft' || order.status === 'pending_approval' || order.status === 'rejected') return 0;
    if (order.status === 'approved') return 1;
    if (order.status === 'fulfilled') return 4;
    return 0;
  };

  const activeStep = getActiveStep();

  return (
    <div className="w-full min-h-screen bg-white md:bg-transparent pb-20 md:pb-10">
      <div className="w-full h-full xl:max-w-4xl mx-auto flex flex-col relative md:pt-6 md:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-6 md:px-0 pt-14 md:pt-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-blue shadow-sm transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="font-black text-xl text-slate-800 tracking-tight">{order.orderNumber}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detalle de Pedido</p>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* ─── Tracking Timeline (Premium Visual) ─── */}
        <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 mb-6 mx-4 md:mx-0">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-2">
            <Truck size={14} className="text-brand-blue" />
            Seguimiento de Entrega
          </h3>

          <div className="overflow-x-auto scrollbar-hide">
            <div className="relative flex justify-between min-w-[500px] md:min-w-full">
              {/* Background Line */}
              <div className="absolute top-5 left-0 w-full h-[2px] bg-slate-100 z-0"></div>
              {/* Active Progress Line */}
              <div 
                className={`absolute top-5 left-0 h-[2px] z-0 transition-all duration-1000 ${isRejected ? 'bg-red-500' : 'bg-brand-blue'}`}
                style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
              ></div>

              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx <= activeStep;
                const isCurrent = idx === activeStep;

                return (
                  <div key={step.label} className="relative z-10 flex flex-col items-center gap-3">
                    <div className={`
                      w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 border-2
                      ${isActive ? (isRejected ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/30') : 'bg-white border-slate-100 text-slate-300'}
                      ${isCurrent ? (isRejected ? 'scale-110 ring-4 ring-red-500/10' : 'scale-110 ring-4 ring-brand-blue/10') : ''}
                    `}>
                      <Icon size={18} />
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-tight text-center max-w-[70px] ${isActive ? (isRejected ? 'text-red-600' : 'text-slate-800') : 'text-slate-300'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Cards Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-4 md:mx-0">
          
          {/* Items Card */}
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Package size={14} className="text-brand-blue" />
              Artículos
            </h3>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black text-slate-800">{item.productName}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.quantity} unidades x ${item.unitPrice.toFixed(2)}</span>
                  </div>
                  <span className="font-black text-slate-800">${item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-100 flex justify-between items-center">
              <span className="text-xs font-black text-slate-400 uppercase">Total Pedido</span>
              <span className="text-xl font-black text-brand-blue">${order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Logistics Card */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50 flex-1">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <MapPin size={14} className="text-brand-blue" />
                Información de Entrega
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="p-3 bg-brand-blue/5 text-brand-blue rounded-2xl h-fit">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Estimada</p>
                    <p className="text-[13px] font-bold text-slate-700">{order.deliveryDate}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-3 bg-brand-blue/5 text-brand-blue rounded-2xl h-fit">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dirección de Envío</p>
                    <p className="text-[13px] font-bold text-slate-700">{order.deliveryAddress}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-3 bg-brand-blue/5 text-brand-blue rounded-2xl h-fit">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observaciones</p>
                    <p className="text-[13px] font-bold text-slate-700 italic">{order.observations || 'Sin observaciones'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Floating Background Pattern */}
        <svg className="absolute top-[20%] -left-10 w-32 h-32 pointer-events-none opacity-20 z-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" stroke="#00A9F4" strokeWidth="2" strokeDasharray="8 8" />
        </svg>

      </div>
    </div>
  );
}
