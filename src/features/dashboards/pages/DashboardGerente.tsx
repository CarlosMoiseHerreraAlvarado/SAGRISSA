import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, ChevronRight, PieChart, Activity, Clock, TrendingUp } from 'lucide-react';

import { MobilePage } from '../../../core/layout/MobilePage';
import { StatCard } from '../../../core/ui/StatCard';
import { ListCard } from '../../../core/ui/ListCard';
import { Skeleton } from '../../../core/ui/Skeleton';

export default function DashboardGerente() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const pendingApprovals = [
    { id: '1', customer: 'Distribuidora X', amount: '$15,000', reason: 'Exceso de Crédito', urgency: 'high' },
    { id: '2', customer: 'Ferretería Central', amount: '$8,400', reason: 'Margen Bajo', urgency: 'medium' },
    { id: '3', customer: 'Agropecuaria El Sol', amount: '$12,200', reason: 'Cliente Nuevo', urgency: 'medium' },
  ];

  return (
    <MobilePage>
      {/* Brand Pattern Decor */}
      <svg className="absolute top-0 right-10 w-24 h-32 pointer-events-none opacity-20 z-0" viewBox="0 0 100 100" fill="none">
        <path d="M 0 0 Q 10 60 70 40 Q 90 30 100 40" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" fill="none"/>
      </svg>

      <header className="px-6 md:px-0 pt-16 md:pt-0 pb-8 flex flex-col gap-1 z-10 relative">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Gestión Gerencial</h1>
        <p className="text-[12px] font-bold text-brand-blue uppercase tracking-[0.2em]">Finanzas y Operaciones</p>
      </header>

      <div className="flex flex-col gap-8 md:gap-10 px-6 md:px-0 z-10 relative pb-24">
        
        {/* Main Metric Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <StatCard
            title="Ventas Totales"
            value="$1.2M"
            trend={{ value: 8.2 }}
            variant="primary"
          />
          <StatCard
            title="Eficiencia Cobro"
            value="94.2%"
            trend={{ value: 1.5 }}
            variant="default"
          />
          <StatCard
            title="Aprobaciones Ptes."
            value="12"
            icon={FileCheck}
            variant="default"
            onClick={() => navigate('/app/gerente/aprobaciones')}
          />
          <StatCard
            title="Margen Bruto"
            value="32.5%"
            icon={TrendingUp}
            variant="default"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
          
          {/* Approval Monitor Section */}
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileCheck size={18} className="text-brand-blue" />
                Pendientes de Aprobación
              </h3>
              <button 
                onClick={() => navigate('/app/gerente/aprobaciones')}
                className="text-[11px] font-bold text-brand-blue uppercase hover:underline"
              >
                Ver Todas
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {loading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} height={90} className="rounded-[28px]" />)
              ) : (
                pendingApprovals.map((item) => (
                  <ListCard 
                    key={item.id} 
                    className="group cursor-pointer hover:border-brand-blue/30 transition-all border-slate-50"
                    onClick={() => navigate('/app/gerente/aprobaciones')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${item.urgency === 'high' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'}`}>
                           <Clock size={24} />
                        </div>
                        <div>
                          <p className="text-[15px] font-black text-slate-800">{item.customer}</p>
                          <p className="text-[11px] font-bold text-brand-blue uppercase tracking-widest">{item.reason}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-6">
                        <div>
                           <p className="text-[16px] font-black text-slate-800">{item.amount}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Solicitud Hoy</p>
                        </div>
                        <ChevronRight size={18} className="text-slate-200 group-hover:text-brand-blue transition-colors" />
                      </div>
                    </div>
                  </ListCard>
                ))
              )}
            </div>
          </div>

          {/* Strategic Insight Sidebar */}
          <div className="flex flex-col gap-6">
             <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-wider px-2">
                Análisis y Reportes
             </h3>

             {/* Financial Performance Card */}
             <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm flex flex-col gap-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <PieChart size={20} />
                   </div>
                   <span className="font-black text-[13px] text-slate-800 uppercase tracking-widest">Utilidad Operativa</span>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                   <div className="text-4xl font-black text-slate-800 tracking-tighter mb-1">18.4%</div>
                   <div className="flex items-center gap-1.5 text-emerald-500">
                      <TrendingUp size={14} />
                      <span className="text-[11px] font-bold">+2.1% vs mes pasado</span>
                   </div>
                </div>

                <button 
                  onClick={() => navigate('/app/gerente/reportes')}
                  className="w-full py-4 bg-white border border-slate-100 text-brand-blue rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-brand-blue hover:text-white transition-all shadow-sm"
                >
                   Ver Reporte Completo
                </button>

             </div>

              {/* Regional Sales Insights */}
              <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm flex flex-col gap-6">
                 <h3 className="font-black text-[13px] text-slate-800 uppercase tracking-widest">Ventas por Región</h3>
                 <div className="space-y-5">
                    {[
                      { region: 'Centro', value: 45, color: 'bg-brand-blue' },
                      { region: 'Occidente', value: 30, color: 'bg-slate-800' },
                      { region: 'Oriente', value: 25, color: 'bg-slate-300' },
                    ].map((item) => (
                      <div key={item.region} className="flex flex-col gap-2">
                         <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">{item.region}</span>
                            <span className="text-slate-800">{item.value}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* System Health / Connectivity */}
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[32px] flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                    <Activity size={18} />
                 </div>
                 <div>
                    <p className="text-[12px] font-black text-emerald-900">Dynamics 365 Online</p>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Sincronización Exitosa</p>
                 </div>
              </div>
          </div>
        </div>
      </div>

      {/* Footer Dash */}
      <svg className="absolute bottom-[20%] right-6 w-2 h-40 pointer-events-none opacity-20" viewBox="0 0 10 100" fill="none">
        <line x1="5" y1="0" x2="5" y2="100" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" />
      </svg>
    </MobilePage>
  );
}
