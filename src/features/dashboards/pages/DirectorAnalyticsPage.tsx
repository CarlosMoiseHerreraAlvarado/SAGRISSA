import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, TrendingUp, PieChart, Map, Activity, Layers } from 'lucide-react';
import { MobilePage } from '../../../core/layout/MobilePage';

export default function DirectorAnalyticsPage() {
  const navigate = useNavigate();

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
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Business Analytics</h1>
          <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Visión Ejecutiva Regional</p>
        </div>
      </header>

      <div className="flex flex-col gap-8 px-6 md:px-0 z-10 relative pb-24">
        
        {/* Map Placeholder / Geo Analytics - Consistent Light Style */}
        <div className="bg-white border border-slate-100 rounded-[40px] p-8 min-h-[350px] relative overflow-hidden flex flex-col justify-between shadow-sm">
           <div className="z-10">
              <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Distribución de Ventas</span>
              <h3 className="text-2xl font-black text-slate-800 mt-1">Presencia Regional</h3>
           </div>
           
           <div className="z-10 flex-1 flex items-center justify-center py-10">
              <Map size={80} className="text-slate-100" strokeWidth={1} />
           </div>

           <div className="z-10 grid grid-cols-3 gap-4 border-t border-slate-50 pt-6">
              <div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Zona Centro</p>
                 <p className="text-sm font-black text-slate-800">$2.4M</p>
              </div>
              <div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Zona Occid.</p>
                 <p className="text-sm font-black text-slate-800">$1.1M</p>
              </div>
              <div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Zona Orient.</p>
                 <p className="text-sm font-black text-slate-800">$1.3M</p>
              </div>
           </div>
        </div>


        {/* Charts Grid Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                    <TrendingUp size={20} />
                 </div>
                 <span className="font-black text-[13px] text-slate-800 uppercase tracking-widest">Tendencia Semestral</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center py-10">
                 <Activity className="text-slate-100" size={48} />
                 <p className="text-[11px] font-bold text-slate-300 mt-4">Analizando series temporales...</p>
              </div>
           </div>

           <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                    <PieChart size={20} />
                 </div>
                 <span className="font-black text-[13px] text-slate-800 uppercase tracking-widest">Participación Familias</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center py-10">
                 <Layers className="text-slate-100" size={48} />
                 <p className="text-[11px] font-bold text-slate-300 mt-4">Calculando mix de productos...</p>
              </div>
           </div>
        </div>

        {/* Metric Insights */}
        <div className="bg-brand-blue/5 border border-brand-blue/10 p-8 rounded-[40px] flex flex-col gap-4">
           <div className="flex items-center gap-2">
              <Globe size={16} className="text-brand-blue" />
              <span className="text-[11px] font-black text-brand-blue uppercase tracking-widest">Global Insights</span>
           </div>
           <p className="text-[13px] font-medium text-slate-600 leading-relaxed italic">
             "El crecimiento en la Zona Oriental está impulsado principalmente por la nueva línea de fertilizantes foliares, compensando la baja estacional en productos de consumo masivo."
           </p>
        </div>

      </div>

      <svg className="absolute bottom-[5%] right-6 w-2 h-40 pointer-events-none opacity-20" viewBox="0 0 10 100" fill="none">
        <line x1="5" y1="0" x2="5" y2="100" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" />
      </svg>
    </MobilePage>
  );
}
