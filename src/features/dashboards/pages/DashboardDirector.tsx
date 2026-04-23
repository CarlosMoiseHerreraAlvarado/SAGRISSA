import { useNavigate } from 'react-router-dom';
import { Globe, BarChart3, TrendingUp, Award, FileText, MapPin, Package, DollarSign, ChevronRight } from 'lucide-react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { StatCard } from '../../../core/ui/StatCard';


export default function DashboardDirector() {
  const navigate = useNavigate();

  const regionalPerformance = [
    { region: 'Zona Centro (SS)', sales: '$2.4M', goal: '$2.2M', status: 'over' },
    { region: 'Zona Occidente (SA)', sales: '$1.1M', goal: '$1.3M', status: 'under' },
    { region: 'Zona Oriente (SM)', sales: '$1.3M', goal: '$1.2M', status: 'over' },
  ];

  return (
    <MobilePage>
      {/* Background Decor - Corporate Subtle Pattern */}
      <svg className="absolute top-0 right-10 w-32 h-40 pointer-events-none opacity-20 z-0" viewBox="0 0 100 100" fill="none">
        <circle cx="90" cy="10" r="40" stroke="#00A9F4" strokeWidth="0.5" strokeDasharray="4 4" />
        <path d="M 0 0 Q 20 50 80 30" stroke="#00A9F4" strokeWidth="1" strokeDasharray="6 6" fill="none"/>
      </svg>

      <header className="px-6 md:px-0 pt-16 md:pt-0 pb-8 flex flex-col gap-1 z-10 relative">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Dirección General</h1>
        <p className="text-[12px] font-bold text-brand-blue uppercase tracking-[0.2em]">Visión Estratégica Corporativa</p>
      </header>

      <div className="flex flex-col gap-8 px-6 md:px-0 z-10 relative pb-32">
        
        {/* Top KPIs - Executive Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Ingreso Anual"
            value="$4.8M"
            trend={{ value: 12.4, label: 'vs año anterior' }}
            variant="primary"
          />
          <StatCard
            title="Margen EBTIDA"
            value="24.5%"
            icon={TrendingUp}
            variant="default"
          />
          <StatCard
            title="Disponibilidad Caja"
            value="$1.2M"
            icon={DollarSign}
            variant="default"
          />
          <StatCard
            title="Market Share"
            value="38%"
            icon={Globe}
            variant="default"
          />
        </div>

        {/* Central Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Strategic Map / Analytics Card */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 size={18} className="text-brand-blue" />
                Rendimiento por Región
              </h3>
              <button 
                onClick={() => navigate('/app/director/analytics')}
                className="text-[11px] font-bold text-brand-blue uppercase hover:underline flex items-center gap-1"
              >
                Ver Analytics <ChevronRight size={14} />
              </button>
            </div>

            <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Ventas Consolidadas</p>
                    <p className="text-3xl font-black text-slate-800">$4,820,450.00</p>
                  </div>
                  <div className="hidden md:block">
                     <Award className="text-brand-blue/20" size={48} />
                  </div>
               </div>
               
               <div className="p-2">
                 {regionalPerformance.map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors rounded-[32px]">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                            <MapPin size={20} />
                         </div>
                         <div>
                            <p className="text-[14px] font-black text-slate-800">{item.region}</p>
                            <p className="text-[11px] font-medium text-slate-400">Meta: {item.goal}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[15px] font-black text-slate-700">{item.sales}</p>
                         <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${item.status === 'over' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {item.status === 'over' ? '+ Cumplimiento' : '- Pendiente'}
                         </span>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Strategic Actions Sidebar */}
          <div className="flex flex-col gap-6">
             <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-wider px-2">
                Acciones de Control
             </h3>

             {/* Inventory Card */}
             <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm flex flex-col gap-6 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                    <Package size={24} />
                  </div>
                  <h4 className="text-[16px] font-black text-slate-800 mb-2">Inventario Crítico</h4>
                  <p className="text-[12px] font-medium text-slate-500 leading-relaxed">
                    Existen <span className="font-bold text-amber-600">12 productos</span> con stock por debajo del nivel de seguridad regional.
                  </p>
                  <button className="mt-6 w-full py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-600 uppercase tracking-widest hover:bg-amber-50 hover:text-amber-600 hover:border-amber-100 transition-all">
                    Revisar Stock
                  </button>
                </div>
                <Package size={100} className="absolute -bottom-10 -right-10 text-slate-50 group-hover:text-amber-50 transition-colors duration-500" />
             </div>

             {/* Reports Button - Consistent Brand Profile */}
             <button 
               onClick={() => navigate('/app/director/reportes')}
               className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm flex flex-col items-center text-center group hover:border-brand-blue/30 transition-all"
             >
                <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-6 text-brand-blue group-hover:scale-110 transition-transform">
                   <FileText size={28} />
                </div>
                <h4 className="text-[16px] font-black text-slate-800 mb-2">Reportes Ejecutivos</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed px-4">
                  Descarga consolidada de cierres, estados financieros y matrices de venta.
                </p>
                <div className="mt-6 flex items-center gap-2 text-[11px] font-black text-brand-blue uppercase">
                  Acceder <ChevronRight size={14} />
                </div>
             </button>

          </div>

        </div>

      </div>

      {/* Decorative Bottom Line */}
      <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-20 pointer-events-none">
         <div className="w-20 h-[2px] bg-brand-blue rounded-full" />
         <div className="w-2 h-2 rounded-full bg-brand-blue" />
         <div className="w-20 h-[2px] bg-brand-blue rounded-full" />
      </div>
    </MobilePage>
  );
}
