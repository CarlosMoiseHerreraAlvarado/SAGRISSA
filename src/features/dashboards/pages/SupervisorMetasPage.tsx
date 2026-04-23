import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, CheckCircle2, AlertCircle } from 'lucide-react';

import { MobilePage } from '../../../core/layout/MobilePage';
import { Skeleton } from '../../../core/ui/Skeleton';

export default function SupervisorMetasPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const goals = [
    { id: '1', title: 'Meta Ventas Abril', current: 55500, target: 80000, color: 'brand' },
    { id: '2', title: 'Recuperación de Cartera', current: 12000, target: 15000, color: 'emerald' },
    { id: '3', title: 'Nuevos Clientes', current: 8, target: 10, color: 'brand' },
  ];

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
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Metas de Equipo</h1>
          <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Cumplimiento y Objetivos</p>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-6 md:px-0 z-10 relative pb-24">
        
        {/* Main Progress Circle / Hero - Consistent Light Style */}
        <div className="bg-white border border-slate-100 rounded-[40px] p-8 relative overflow-hidden shadow-sm">
           <div className="relative z-10 flex flex-col items-center">
              <div className="w-40 h-40 rounded-full border-[12px] border-slate-50 flex flex-col items-center justify-center relative mb-6">
                 <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" cy="50" r="44" 
                      fill="none" 
                      stroke="#00A9F4" 
                      strokeWidth="12" 
                      strokeDasharray="276" 
                      strokeDashoffset="82" // Simulating 70%
                      strokeLinecap="round"
                    />
                 </svg>
                 <span className="text-4xl font-black tracking-tighter text-slate-800">70%</span>
                 <span className="text-[10px] font-bold uppercase text-slate-400">Total</span>
              </div>
              <h3 className="font-black text-[18px] text-slate-800 mb-1">Cierre de Mes</h3>
              <p className="text-slate-400 text-[11px] font-medium">Quedan 8 días para finalizar el periodo</p>
           </div>
        </div>


        {/* Detailed Goals */}
        <div className="flex flex-col gap-4">
           <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest px-2 underline decoration-[#00A9F4] decoration-2 underline-offset-4 mb-2">Detalle de Objetivos</h3>
           
           {loading ? (
             Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-[32px]" />)
           ) : (
             <div className="flex flex-col gap-4">
               {goals.map((goal) => {
                 const progress = (goal.current / goal.target) * 100;
                 return (
                   <div key={goal.id} className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${goal.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' : 'bg-brand-blue/10 text-brand-blue'} flex items-center justify-center`}>
                               {goal.color === 'emerald' ? <CheckCircle2 size={20} /> : <Target size={20} />}
                            </div>
                            <span className="font-black text-[14px] text-slate-800">{goal.title}</span>
                         </div>
                         <span className="text-sm font-black text-slate-800">{progress.toFixed(0)}%</span>
                      </div>

                      <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                         <div 
                           className={`h-full rounded-full transition-all duration-1000 ${goal.color === 'emerald' ? 'bg-emerald-500' : 'bg-brand-blue'}`} 
                           style={{ width: `${progress}%` }} 
                         />
                      </div>

                      <div className="flex justify-between items-center text-[11px] font-bold">
                         <div className="flex items-center gap-1 text-slate-400">
                            Actual: <span className="text-slate-700">${goal.current.toLocaleString()}</span>
                         </div>
                         <div className="flex items-center gap-1 text-slate-400">
                            Meta: <span className="text-slate-700">${goal.target.toLocaleString()}</span>
                         </div>
                      </div>
                   </div>
                 );
               })}
             </div>
           )}
        </div>

        {/* Insight Alert */}
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[32px] flex gap-4">
           <AlertCircle className="text-amber-500 shrink-0" size={24} />
           <div>
              <p className="text-[13px] font-black text-amber-800 mb-1">Atención Requerida</p>
              <p className="text-[11px] font-medium text-amber-700 leading-relaxed">
                El equipo se encuentra un 5% por debajo de la tendencia esperada para el cierre de mes. Se recomienda revisar los pedidos en estado "Draft".
              </p>
           </div>
        </div>

      </div>

      <svg className="absolute bottom-[10%] right-6 w-2 h-40 pointer-events-none opacity-20" viewBox="0 0 10 100" fill="none">
        <line x1="5" y1="0" x2="5" y2="100" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" />
      </svg>
    </MobilePage>
  );
}
