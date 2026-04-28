import { useState } from 'react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { StatCard } from '../../../core/ui/StatCard';
import { Target, TrendingUp, Users, DollarSign, Download, Filter } from 'lucide-react';

export default function GerenteMetasPage() {
  const [filter, setFilter] = useState('mensual');

  return (
    <MobilePage>
      <header className="px-6 md:px-0 pt-16 md:pt-0 pb-8 flex flex-col gap-1 z-10 relative">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Metas y Desempeño</h1>
            <p className="text-[12px] font-bold text-brand-blue uppercase tracking-[0.2em]">Visión Gerencial</p>
          </div>
          <button className="hidden md:flex bg-white px-4 py-2 rounded-xl border border-slate-100 hover:border-brand-blue/40 text-[11px] font-black text-slate-700 tracking-wide items-center gap-2 transition-all shadow-sm">
            <Download size={14} className="text-brand-blue" />
            Exportar Reporte
          </button>
        </div>
      </header>

      <div className="px-6 md:px-0 flex gap-2 mb-6">
        {['mensual', 'trimestral', 'anual'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === f ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20' : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 px-6 md:px-0 mb-8">
        <StatCard
          title="Meta Global Ventas"
          value="$2.5M"
          trend={{ value: 12.5 }}
          icon={Target}
          variant="primary"
        />
        <StatCard
          title="Cumplimiento"
          value="84.2%"
          trend={{ value: 4.1 }}
          icon={TrendingUp}
          variant="default"
        />
        <StatCard
          title="Recuperación Carteras"
          value="91.5%"
          icon={DollarSign}
          variant="default"
        />
        <StatCard
          title="Productividad Equipo"
          value="A+"
          icon={Users}
          variant="default"
        />
      </div>

      <div className="px-6 md:px-0 space-y-6 pb-20">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-wider">Desempeño por Supervisor</h3>
          <div className="space-y-4">
            {[
              { name: 'Equipo Norte', sup: 'Carlos Ramírez', meta: '$800k', avance: 85, color: 'bg-brand-blue' },
              { name: 'Equipo Centro', sup: 'Ana Martínez', meta: '$1.2M', avance: 92, color: 'bg-emerald-500' },
              { name: 'Equipo Sur', sup: 'Luis Gómez', meta: '$500k', avance: 68, color: 'bg-amber-500' },
            ].map(eq => (
              <div key={eq.name} className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="font-black text-[13px] text-slate-800">{eq.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sup: {eq.sup}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[13px] text-slate-800">{eq.avance}%</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meta: {eq.meta}</p>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${eq.color}`} style={{ width: `${eq.avance}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobilePage>
  );
}
