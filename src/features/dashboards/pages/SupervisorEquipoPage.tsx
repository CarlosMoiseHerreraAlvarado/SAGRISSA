import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, MoreVertical, TrendingUp, TrendingDown } from 'lucide-react';

import { MobilePage } from '../../../core/layout/MobilePage';
import { Skeleton } from '../../../core/ui/Skeleton';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  lastActive: string;
  monthlySales: number;
  performance: number; // percentage
  region: string;
}

export default function SupervisorEquipoPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTeam([
        { id: 'v1', name: 'Luis Navarro', role: 'Vendedor Senior', status: 'online', lastActive: 'Ahora', monthlySales: 24500, performance: 92, region: 'San Salvador' },
        { id: 'v2', name: 'Andrea Montoya', role: 'Vendedor Junior', status: 'online', lastActive: 'Hace 5m', monthlySales: 18200, performance: 75, region: 'La Libertad' },
        { id: 'v3', name: 'Carlos Ruíz', role: 'Vendedor Senior', status: 'offline', lastActive: 'Hace 2h', monthlySales: 12800, performance: 60, region: 'Santa Ana' },
        { id: 'v4', name: 'Roberto Sosa', role: 'Vendedor Junior', status: 'busy', lastActive: 'En reunión', monthlySales: 9500, performance: 45, region: 'San Miguel' },
      ]);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: TeamMember['status']) => {
    switch(status) {
      case 'online': return 'bg-emerald-500';
      case 'busy': return 'bg-amber-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <MobilePage>
      {/* Pattern Background strictly following brand guidelines */}
      <svg className="absolute top-0 right-10 w-24 h-32 pointer-events-none opacity-40 z-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0 0 Q 10 60 70 40 Q 90 30 100 40" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" fill="none"/>
      </svg>

      <header className="px-6 md:px-0 pt-16 md:pt-0 pb-6 flex items-center gap-4 z-10 relative">

        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-brand-blue transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Mi Equipo</h1>
          <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Gestión de Fuerza de Ventas</p>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-6 md:px-0 z-10 relative pb-24">
        
        {/* Team Summary KPIs */}
        {!loading && (
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Ventas Totales</p>
                <p className="text-2xl font-black tracking-tight">${team.reduce((acc, m) => acc + m.monthlySales, 0).toLocaleString()}</p>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                   <TrendingUp size={80} />
                </div>
             </div>
             <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Prom. Rendimiento</p>
                <p className="text-2xl font-black text-slate-800 tracking-tight">
                   {Math.round(team.reduce((acc, m) => acc + m.performance, 0) / team.length)}%
                </p>
             </div>
          </div>
        )}

        {loading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-[32px]" />)
        ) : (
          <div className="flex flex-col gap-4">
            {team.map((member) => (
              <div key={member.id} className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm flex flex-col gap-5 hover:border-brand-blue/30 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-all">
                        <User size={28} />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white ${getStatusColor(member.status)}`} />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-black text-[15px] text-slate-800">{member.name}</h3>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{member.role}</p>
                    </div>
                  </div>
                  <button className="p-2 text-slate-300 hover:text-slate-600">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ventas Mes</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[16px] font-black text-slate-800">${member.monthlySales.toLocaleString()}</span>
                      {member.performance >= 80 ? (
                        <TrendingUp size={16} className="text-emerald-500" />
                      ) : (
                        <TrendingDown size={16} className="text-amber-500" />
                      )}
                    </div>
                  </div>
                  <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cumplimiento Meta</p>
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${member.performance >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${member.performance}%` }} />
                       </div>
                       <span className="text-[13px] font-black text-slate-800">{member.performance}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                   <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                      <MapPin size={12} />
                      {member.region}
                   </div>
                   <div className="flex items-center gap-3">
                      <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-brand-blue hover:bg-brand-blue/10 transition-all">
                        <Phone size={14} />
                      </button>
                      <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-brand-blue hover:bg-brand-blue/10 transition-all">
                        <Mail size={14} />
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <svg className="absolute bottom-[10%] right-6 w-2 h-40 pointer-events-none opacity-20" viewBox="0 0 10 100" fill="none">
        <line x1="5" y1="0" x2="5" y2="100" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" />
      </svg>
    </MobilePage>
  );
}
