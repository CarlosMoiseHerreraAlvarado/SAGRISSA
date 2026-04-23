import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Landmark, DollarSign, Calendar, ChevronRight, AlertCircle } from 'lucide-react';

import { MobilePage } from '../../../core/layout/MobilePage';
import { Skeleton } from '../../../core/ui/Skeleton';

export default function EstadoCarteraPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const facturasVencidas = [
    { id: '1', invoice: 'FAC-2024-001', customer: 'Agropecuaria El Sol', amount: '$1,200.00', days: '15 días', status: 'critical' },
    { id: '2', invoice: 'FAC-2024-015', customer: 'Distribuidora X', amount: '$450.00', days: '3 días', status: 'warning' },
  ];

  return (
    <MobilePage>
      <header className="px-6 md:px-0 pt-16 md:pt-0 pb-6 flex items-center gap-4 z-10 relative">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-brand-blue transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Estado de Cartera</h1>
          <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Cobros y Vencimientos</p>
        </div>
      </header>

      <div className="flex flex-col gap-8 px-6 md:px-0 z-10 relative pb-24">
        
        {/* Collection Summary */}
        <div className="bg-brand-blue rounded-[40px] p-8 text-white shadow-lg shadow-brand-blue/20 relative overflow-hidden">
           <div className="relative z-10">
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2">Total Pendiente de Cobro</p>
              <h2 className="text-3xl font-black mb-6">$12,450.00</h2>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/10 p-4 rounded-2xl">
                    <p className="text-[9px] font-bold text-white/60 uppercase">Vencido</p>
                    <p className="text-lg font-black">$1,650.00</p>
                 </div>
                 <div className="bg-white/10 p-4 rounded-2xl">
                    <p className="text-[9px] font-bold text-white/60 uppercase">Próximo</p>
                    <p className="text-lg font-black">$2,200.00</p>
                 </div>
              </div>
           </div>
           <Landmark size={120} className="absolute -bottom-10 -right-10 text-white/5" />
        </div>

        {/* Facturas Section */}
        <div className="flex flex-col gap-4">
           <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider px-2">Facturas por Cobrar</h3>
           <div className="flex flex-col gap-3">
              {loading ? (
                Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-[32px]" />)
              ) : (
                facturasVencidas.map((fac) => (
                  <div key={fac.id} className="bg-white border border-slate-50 p-6 rounded-[32px] shadow-sm flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${fac.status === 'critical' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                          {fac.status === 'critical' ? <AlertCircle size={24} /> : <Calendar size={24} />}
                       </div>
                       <div>
                          <p className="text-[14px] font-black text-slate-800">{fac.customer}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{fac.invoice} · Vence en {fac.days}</p>
                       </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                       <div>
                          <p className="text-[15px] font-black text-slate-700">{fac.amount}</p>
                          <button className="text-[9px] font-black text-brand-blue uppercase hover:underline">Registrar Cobro</button>
                       </div>
                       <ChevronRight size={18} className="text-slate-100" />
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* Action Button */}
        <button className="w-full py-5 bg-slate-900 text-white rounded-[32px] font-black text-[13px] uppercase tracking-widest shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2">
           <DollarSign size={18} /> Registrar Recibo de Caja
        </button>

      </div>

      <svg className="absolute bottom-[5%] left-6 w-2 h-40 pointer-events-none opacity-20" viewBox="0 0 10 100" fill="none">
        <line x1="5" y1="0" x2="5" y2="100" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" />
      </svg>
    </MobilePage>
  );
}
