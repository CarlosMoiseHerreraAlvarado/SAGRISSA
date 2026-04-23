import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Target, Activity, ChevronRight, ClipboardList, Phone, User } from 'lucide-react';

import { MobilePage } from '../../../core/layout/MobilePage';
import { StatCard } from '../../../core/ui/StatCard';
import { ListCard } from '../../../core/ui/ListCard';
import { Skeleton } from '../../../core/ui/Skeleton';

export default function DashboardSupervisor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const teamMembers = [
    { name: 'Luis Navarro', sales: '$24,500', target: '92%', status: 'online', role: 'Vendedor Senior' },
    { name: 'Andrea Montoya', sales: '$18,200', target: '75%', status: 'online', role: 'Vendedor Junior' },
    { name: 'Carlos Ruíz', sales: '$12,800', target: '60%', status: 'offline', role: 'Vendedor Senior' },
  ];

  return (
    <MobilePage>
      {/* Pattern Background - Subtle Corporate Design */}
      <svg className="absolute top-0 right-10 w-24 h-32 pointer-events-none opacity-20 z-0" viewBox="0 0 100 100" fill="none">
        <path d="M 0 0 Q 10 60 70 40 Q 90 30 100 40" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" fill="none"/>
      </svg>

      <header className="px-6 md:px-0 pt-16 md:pt-0 pb-8 flex flex-col gap-1 z-10 relative">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Control Operativo</h1>
        <p className="text-[12px] font-bold text-brand-blue uppercase tracking-[0.2em]">Dashboard de Supervisor</p>
      </header>

      <div className="flex flex-col gap-8 md:gap-10 px-6 md:px-0 z-10 relative pb-24">
        
        {/* Metric Grid - High Contrast Corporate */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard
            title="Ventas del Equipo"
            value="$55,500"
            trend={{ value: 12, label: 'vs periodo anterior' }}
            variant="primary"
          />
          <StatCard
            title="Cumplimiento Meta"
            value="82%"
            icon={Target}
            variant="default"
            onClick={() => navigate('/app/supervisor/metas')}
          />
          <StatCard
            title="Fuerza de Venta"
            value="8 / 10"
            icon={Users}
            variant="default"
            onClick={() => navigate('/app/supervisor/equipo')}
          />
        </div>

        {/* Operational Intelligence Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
          
          {/* Team Performance Monitor */}
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Users size={18} className="text-brand-blue" />
                Monitoreo de Equipo
              </h3>
              <button 
                onClick={() => navigate('/app/supervisor/equipo')}
                className="text-[11px] font-bold text-brand-blue uppercase hover:underline"
              >
                Ver Todo
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {loading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} height={85} className="rounded-[28px]" />)
              ) : (
                teamMembers.map((member, idx) => (
                  <ListCard 
                    key={idx} 
                    className="group cursor-pointer hover:border-brand-blue/30 transition-all border-slate-50"
                    onClick={() => navigate('/app/supervisor/equipo')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                           <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-colors">
                              <User size={24} />
                           </div>
                           <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${member.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        </div>
                        <div>
                          <p className="text-[15px] font-black text-slate-800">{member.name}</p>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-6">
                        <div className="hidden sm:block">
                          <p className="text-[11px] font-bold text-slate-400 uppercase mb-0.5">Cumplimiento</p>
                          <div className="flex items-center gap-2">
                             <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-blue" style={{ width: member.target }} />
                             </div>
                             <span className="text-[12px] font-black text-slate-700">{member.target}</span>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-200 group-hover:text-brand-blue transition-colors" />
                      </div>
                    </div>
                  </ListCard>
                ))
              )}
            </div>
          </div>

          {/* Critical Alerts & Quick Actions */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-wider px-2">
              Alertas y Control
            </h3>
            
            {/* Warning Alert */}
            <div className="bg-amber-50/50 border border-amber-100 p-8 rounded-[40px] flex flex-col gap-5 relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                    <Activity size={24} />
                  </div>
                  <h4 className="text-[16px] font-black text-slate-800 mb-2">Pedidos Retenidos</h4>
                  <p className="text-[12px] font-medium text-slate-600 leading-relaxed">
                    Hay <span className="font-bold text-amber-700">3 pedidos</span> pendientes de liberación por falta de documentos adjuntos.
                  </p>
                  <button className="mt-6 w-full py-3 bg-white border border-amber-100 rounded-2xl text-[11px] font-black text-amber-700 uppercase tracking-widest hover:bg-amber-100 transition-all flex items-center justify-center gap-2">
                    <ClipboardList size={14} /> Gestionar Retenciones
                  </button>
               </div>
            </div>

            {/* Quick Contact Card - Consistent Brand Profile */}
            <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm flex items-center justify-between group overflow-hidden relative">
               <div className="z-10 relative">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Enlace Directo</p>
                  <h4 className="text-[16px] font-black text-slate-800 mb-1">Mesa de Ayuda</h4>
                  <p className="text-slate-400 text-[11px]">Soporte técnico y funcional</p>
                  <button className="mt-6 flex items-center gap-2 text-[11px] font-black text-brand-blue uppercase group-hover:gap-3 transition-all">
                    Llamar ahora <ChevronRight size={14} />
                  </button>
               </div>
               <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue relative z-10 group-hover:bg-brand-blue group-hover:text-white transition-all duration-500">
                  <Phone size={24} />
               </div>
            </div>


          </div>
        </div>
      </div>

      {/* Decorative Bottom Dash */}
      <svg className="absolute bottom-[5%] right-6 w-2 h-40 pointer-events-none opacity-20" viewBox="0 0 10 100" fill="none">
        <line x1="5" y1="0" x2="5" y2="100" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" />
      </svg>
    </MobilePage>
  );
}
