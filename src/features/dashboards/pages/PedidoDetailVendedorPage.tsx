import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Clock, User, MapPin, Printer, Share2, ChevronRight } from 'lucide-react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { StatusBadge } from '../../../core/ui/StatusBadge';
import { Skeleton } from '../../../core/ui/Skeleton';
import type { OrderStatus } from '../../../types';

export default function PedidoDetailVendedorPage() {
  const { id: _id } = useParams();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const order = {
    number: 'ORD-99020',
    client: 'Luis Armando S.',
    date: '22 Abr 2026, 10:30 AM',
    status: 'draft',
    address: 'Finca Las Marías, Santa Tecla',
    total: 45800.00,
    latitude: 13.6894,
    longitude: -89.1872,
    items: [
      { id: '1', name: 'Biomin Booster 11', qty: 10, price: 4000.00, subtotal: 40000.00 },
      { id: '2', name: 'Urea 46% Granulada', qty: 163, price: 35.50, subtotal: 5800.00 },
    ]
  };

  return (
    <MobilePage>
      <header className="px-6 md:px-0 pt-16 md:pt-0 pb-6 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-4">
           <button type="button" onClick={() => navigate(-1)} className="min-h-11 min-w-11 p-2 -ml-2 text-slate-400 hover:text-brand-blue transition-colors" aria-label="Volver">
             <ArrowLeft aria-hidden="true" size={24} className="mx-auto" />
           </button>
           <div>
             <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{order.number}</h1>
             <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Detalle del Pedido</p>
           </div>
        </div>
        <div className="flex gap-2">
           <button type="button" className="min-h-11 min-w-11 rounded-xl bg-slate-50 p-2.5 text-slate-400 transition-colors hover:text-brand-blue" aria-label="Imprimir pedido">
              <Printer aria-hidden="true" size={20} className="mx-auto" />
           </button>
           <button type="button" className="min-h-11 min-w-11 rounded-xl bg-slate-50 p-2.5 text-slate-400 transition-colors hover:text-brand-blue" aria-label="Compartir pedido">
              <Share2 aria-hidden="true" size={20} className="mx-auto" />
           </button>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-6 md:px-0 z-10 relative pb-32">
        
        {loading ? (
          <Skeleton className="h-48 w-full rounded-[40px]" />
        ) : (
          <>
            {/* Order Status Hero */}
            <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
               <div className="flex justify-between items-start mb-8">
                  <div>
                     <StatusBadge status={order.status as OrderStatus} />
                     <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase flex items-center gap-1">
                        <Clock size={12} /> {order.date}
                     </p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Monto Total</p>
                     <p className="text-2xl font-black text-slate-800">${order.total.toLocaleString()}</p>
                  </div>
               </div>

               <div className="space-y-4 border-t border-slate-50 pt-6">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <User size={16} />
                     </div>
                     <span className="text-sm font-bold text-slate-700">{order.client}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <MapPin size={16} />
                     </div>
                     <span className="text-xs font-medium text-slate-500 leading-tight">{order.address}</span>
                  </div>
               </div>
            </div>

            {/* Items List */}
            <div className="flex flex-col gap-4">
               <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider px-2">Productos ({order.items.length})</h3>
               <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">
                  {order.items.map((item, idx) => (
                    <div key={item.id} className={`p-6 flex items-center justify-between ${idx !== order.items.length - 1 ? 'border-b border-slate-50' : ''}`}>
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                             <Package size={20} />
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-800">{item.name}</p>
                             <p className="text-[11px] font-bold text-slate-400 uppercase">{item.qty} unidades · ${item.price.toFixed(2)}</p>
                          </div>
                       </div>
                       <p className="text-sm font-black text-slate-700">${item.subtotal.toLocaleString()}</p>
                    </div>
                  ))}
               </div>
            </div>

            {/* Action Bottom */}
            <div className="fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-40 border-t border-slate-100 bg-white/90 p-4 backdrop-blur-lg md:relative md:inset-auto md:z-auto md:border-none md:bg-transparent md:p-0">
               <div className="flex gap-3">
                 <button className="flex-1 py-5 bg-white border border-red-100 text-red-500 rounded-[32px] font-black text-[13px] uppercase tracking-widest shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all">
                    Eliminar
                 </button>
                 <button onClick={() => navigate(`/app/pedidos/${_id}/editar`)} className="flex-[2] py-5 bg-brand-blue text-white rounded-[32px] font-black text-[13px] uppercase tracking-widest shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2 active:scale-95 transition-all">
                    Editar Pedido <ChevronRight size={18} />
                 </button>
               </div>
            </div>
            {/* Geolocation Audit Integration */}
            <div className="bg-slate-50 border border-slate-100 rounded-[40px] p-8 flex flex-col gap-4">
               <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-brand-blue" />
                  <span className="text-[11px] font-black text-brand-blue uppercase tracking-widest">Auditoría de Ubicación</span>
               </div>
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase">Coordenadas Capturadas</p>
                     <p className="text-[13px] font-black text-slate-700">{order.latitude}, {order.longitude}</p>
                  </div>
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-blue transition-all">
                     Ver en Mapa
                  </button>
               </div>
               <p className="text-[10px] font-medium text-slate-400 leading-tight">
                  Ubicación verificada vía GPS PWA al momento de la firma del pedido.
               </p>
            </div>
          </>
        )}

      </div>

      {/* Decor */}
      <svg className="absolute bottom-[5%] right-6 w-2 h-40 pointer-events-none opacity-20" viewBox="0 0 10 100" fill="none">
        <line x1="5" y1="0" x2="5" y2="100" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" />
      </svg>
    </MobilePage>
  );
}
