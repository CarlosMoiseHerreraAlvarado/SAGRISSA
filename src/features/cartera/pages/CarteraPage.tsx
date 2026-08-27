import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, ChevronRight, PieChart, DollarSign, TrendingUp } from 'lucide-react';
import { carteraService, type CarteraSummary, type OverdueInvoice } from '../services/cartera.service';
import { Card } from '../../../core/ui/Card';
import { Skeleton } from '../../../core/ui/Skeleton';
import { APP_ROUTES } from '../../../core/routing/routes';

export default function CarteraPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CarteraSummary | null>(null);
  const [invoices, setInvoices] = useState<OverdueInvoice[]>([]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      carteraService.getSummary(),
      carteraService.getOverdueInvoices()
    ])
      .then(([s, i]) => {
        if (isMounted) {
          setSummary(s);
          setInvoices(i);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Error al cargar datos de cartera:', err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-white md:bg-transparent pb-20 md:pb-10">
      <div className="w-full h-full xl:max-w-6xl mx-auto flex flex-col relative md:pt-6 md:px-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 px-6 md:px-0">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="min-h-11 min-w-11 rounded-2xl border border-slate-100 bg-white p-3 text-slate-400 shadow-sm transition-all hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue md:hidden"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </button>
          <div>
            <h2 className="font-black text-xl text-slate-800 tracking-tight">Estado de Cartera</h2>
            <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Gestión de Cobranza (Aging)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
          
          {/* Aging Dashboard */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card padding="lg" className="bg-slate-900 text-white shadow-2xl shadow-slate-900/20 overflow-hidden relative border-none rounded-[40px]">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Deuda Total Gestionada</p>
                    <h3 className="text-3xl font-black">${summary?.totalDebt.toLocaleString()}</h3>
                  </div>
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <PieChart size={24} className="text-brand-blue" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Actual', val: summary?.current, color: 'bg-emerald-400' },
                    { label: '1-30 Días', val: summary?.overdue30, color: 'bg-amber-400' },
                    { label: '31-60 Días', val: summary?.overdue60, color: 'bg-orange-500' },
                    { label: '+60 Días', val: summary?.overdue90, color: 'bg-red-500' },
                  ].map(step => (
                    <div key={step.label} className="bg-white/5 p-4 rounded-[24px] border border-white/5 hover:bg-white/10 transition-all">
                      <div className={`w-1.5 h-1.5 rounded-full ${step.color} mb-3`} />
                      <p className="text-[9px] font-black text-white/40 uppercase mb-1">{step.label}</p>
                      <p className="text-[15px] font-black">${step.val?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* Progress Bar Style Aging */}
                <div className="mt-10 h-3 bg-white/5 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-400" style={{ width: `${(summary?.current || 0) / (summary?.totalDebt || 1) * 100}%` }}></div>
                  <div className="h-full bg-amber-400" style={{ width: `${(summary?.overdue30 || 0) / (summary?.totalDebt || 1) * 100}%` }}></div>
                  <div className="h-full bg-orange-500" style={{ width: `${(summary?.overdue60 || 0) / (summary?.totalDebt || 1) * 100}%` }}></div>
                  <div className="h-full bg-red-500" style={{ width: `${(summary?.overdue90 || 0) / (summary?.totalDebt || 1) * 100}%` }}></div>
                </div>
              </div>
              <TrendingUp size={200} className="absolute -bottom-20 -right-20 text-white/5 pointer-events-none" />
            </Card>

            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Facturas Críticas</h3>
            <div className="space-y-4">
              {loading ? (
                Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-[32px]" />)
              ) : (
                invoices.map(fac => (
                  <div key={fac.id} className="bg-white border border-slate-50 p-6 rounded-[32px] shadow-sm flex items-center justify-between group hover:border-brand-blue/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${fac.status === 'critical' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                        <AlertCircle size={24} />
                      </div>
                      <div>
                        <p className="text-[14px] font-black text-slate-800">{fac.customerName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{fac.number} · {fac.daysOverdue} días vencido</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-[15px] font-black text-slate-700">${fac.amount.toLocaleString()}</p>
                        <button 
                          onClick={() => navigate(APP_ROUTES.vendedor.nuevoCobro)}
                          className="text-[9px] font-black text-brand-blue uppercase hover:underline"
                        >
                          Cobrar Ahora
                        </button>
                      </div>
                      <ChevronRight size={18} className="text-slate-100" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Side Actions & Insights */}
          <div className="flex flex-col gap-6">
            <Card padding="lg" className="bg-brand-blue text-white shadow-xl shadow-brand-blue/20 rounded-[40px] border-none">
              <h4 className="text-[11px] font-black uppercase tracking-widest mb-4 opacity-70">Acción Rápida</h4>
              <p className="text-sm font-medium mb-6 leading-relaxed">¿Recibiste un abono o pago total? Regístralo de inmediato para actualizar la cartera.</p>
              <button 
                onClick={() => navigate(APP_ROUTES.vendedor.nuevoCobro)}
                className="w-full py-4 bg-white text-brand-blue rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all"
              >
                <DollarSign size={16} />
                Registrar Cobro
              </button>
            </Card>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
               <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Facturas vencidas</h4>
               <div className="space-y-6">
                 {invoices.length === 0 ? <p className="text-sm font-semibold text-slate-400">No hay facturas vencidas.</p> : invoices.slice(0, 4).map(invoice => (
                   <div key={invoice.id} className="flex items-center justify-between gap-4">
                     <div className="flex flex-col">
                       <span className="truncate text-[13px] font-black text-slate-700">{invoice.customerName}</span>
                       <span className="text-[10px] font-bold uppercase text-amber-500">{invoice.daysOverdue} días vencida</span>
                     </div>
                     <span className="text-sm font-black text-slate-400">${invoice.amount.toLocaleString()}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>

        </div>

        {/* Background Pattern */}
        <svg className="absolute bottom-10 right-10 w-40 h-40 pointer-events-none opacity-5 z-0" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="40" stroke="#00A9F4" strokeWidth="2" strokeDasharray="8 8" />
        </svg>

      </div>
    </div>
  );
}
