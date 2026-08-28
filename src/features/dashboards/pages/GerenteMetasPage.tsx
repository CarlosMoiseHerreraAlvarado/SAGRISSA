import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { goalsService, type PeriodGoalData } from '../services/goals.service';

export default function GerenteMetasPage() {
  const [periodType, setPeriodType] = useState<'mensual' | 'trimestral' | 'anual'>('mensual');
  const [selectedMonth, setSelectedMonth] = useState('Noviembre');
  const [selectedQuarter, setSelectedQuarter] = useState('T4');
  const [activeDivision, setActiveDivision] = useState<string>('all');
  const [data, setData] = useState<PeriodGoalData | null>(null);
  const [loading, setLoading] = useState(true);

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const quarters = ['T1 (Ene-Mar)', 'T2 (Abr-Jun)', 'T3 (Jul-Sep)', 'T4 (Oct-Dic)'];

  useEffect(() => {
    setLoading(true);
    const label = periodType === 'mensual' ? selectedMonth : periodType === 'trimestral' ? selectedQuarter : '2022';
    goalsService.getPeriodGoalData(periodType, label)
      .then(setData)
      .finally(() => setLoading(false));
  }, [periodType, selectedMonth, selectedQuarter]);

  const filteredDivisions = data?.divisions.filter(d => 
    activeDivision === 'all' || d.code === activeDivision
  ) || [];

  return (
    <MobilePage>
      {/* Header */}
      <header className="px-6 md:px-0 pt-12 md:pt-0 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 z-10 relative">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-ink dark:text-white tracking-tight">Metas y Desempeño</h1>
          <p className="text-[11px] font-black uppercase tracking-widest text-brand-blue">
            Control Gerencial · 5 Divisiones Comerciales
          </p>
        </div>

        {/* Temporal Filters */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-surface-soft dark:bg-slate-800 rounded-2xl border border-surface-border dark:border-slate-700">
            {(['mensual', 'trimestral', 'anual'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriodType(p)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  periodType === p 
                    ? 'bg-brand-blue text-white shadow-sm' 
                    : 'text-ink-muted dark:text-slate-400 hover:text-ink dark:hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Sub-selector (Month or Quarter) */}
      <div className="px-6 md:px-0 pb-6">
        {periodType === 'mensual' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {months.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMonth(m)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedMonth === m
                    ? 'bg-ink dark:bg-white text-white dark:text-ink font-black shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 text-ink-muted dark:text-slate-400 hover:text-ink'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {periodType === 'trimestral' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {quarters.map((q, idx) => {
              const code = `T${idx + 1}`;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setSelectedQuarter(code)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedQuarter === code
                      ? 'bg-ink dark:bg-white text-white dark:text-ink font-black shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 text-ink-muted dark:text-slate-400 hover:text-ink'
                  }`}
                >
                  {q}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="px-6 md:px-0 pb-32 space-y-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-brand-blue" size={32} />
            <p className="text-xs font-bold text-slate-400">Calculando metas de las 5 divisiones...</p>
          </div>
        ) : data && (
          <>
            {/* Main KPI Summary Card (Matching PDF: Proyección vs Ventas vs Por Vender) */}
            <div className="bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-card dark:shadow-card-dark space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">
                  Resumen Global · {data.periodLabel}
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-ink dark:text-white mt-1">
                  ${data.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </h2>
                <p className="text-xs font-bold text-slate-400 mt-0.5">
                  Ventas Consolidadas ({data.progressPercentage}% de la proyección total)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Proyección Total</span>
                  <span className="text-base font-black text-ink dark:text-white">
                    ${data.totalProjection.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Global Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-ink dark:text-slate-200">
                <span>Avance de Presupuesto</span>
                <span className="text-brand-blue font-black">{data.progressPercentage}%</span>
              </div>
              <div className="w-full h-3 bg-surface-soft dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-blue rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, data.progressPercentage)}%` }}
                />
              </div>
            </div>

            {/* 3 Metric Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-surface-soft dark:bg-slate-800/60 rounded-2xl border border-surface-border dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Ventas Logradas</span>
                <p className="text-lg font-black text-emerald-600 mt-1">
                  ${data.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 bg-surface-soft dark:bg-slate-800/60 rounded-2xl border border-surface-border dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Por Vender (Restante)</span>
                <p className="text-lg font-black text-amber-600 mt-1">
                  ${data.totalPendingToSell.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 bg-surface-soft dark:bg-slate-800/60 rounded-2xl border border-surface-border dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Cobrado</span>
                <p className="text-lg font-black text-brand-blue mt-1">
                  ${data.totalCollections.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

          </div>

        {/* 5 Divisions Breakdown Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-ink dark:text-white">
              Metas por División de Negocio (5 Áreas)
            </h3>
            
            {/* Division Filter Badges */}
            <div className="flex items-center gap-1">
              {['all', 'AGR', 'VET', 'IND', 'PRO', 'TAL'].map(code => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setActiveDivision(code)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                    activeDivision === code
                      ? 'bg-brand-blue text-white'
                      : 'bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 text-slate-400'
                  }`}
                >
                  {code === 'all' ? 'Todas' : code}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDivisions.map(div => (
              <div 
                key={div.id} 
                className="p-5 bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-3xl shadow-card dark:shadow-card-dark space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 bg-brand-blue/10 text-brand-blue rounded-full text-[10px] font-black uppercase tracking-widest">
                      {div.code}
                    </span>
                    <h4 className="text-base font-black text-ink dark:text-white mt-1.5">{div.name}</h4>
                  </div>
                  <span className="text-base font-black text-brand-blue">{div.percentage}%</span>
                </div>

                <div className="w-full h-2 bg-surface-soft dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-blue rounded-full"
                    style={{ width: `${Math.min(100, div.percentage)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-surface-border dark:border-slate-800">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Ventas</span>
                    <strong className="text-ink dark:text-white">${div.sales.toLocaleString()}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Proyección</span>
                    <strong className="text-slate-500 dark:text-slate-400">${div.projection.toLocaleString()}</strong>
                  </div>
                  <div className="pt-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Por Vender</span>
                    <strong className="text-amber-600">${div.pendingToSell.toLocaleString()}</strong>
                  </div>
                  <div className="text-right pt-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Cobros</span>
                    <strong className="text-emerald-600">${div.collections.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sellers Group Ranking Section (Matching PDF) */}
        {data && data.sellers.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-ink dark:text-white">
              Desempeño Individual del Equipo de Ventas
            </h3>

            <div className="bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-3xl p-6 shadow-card dark:shadow-card-dark divide-y divide-surface-border dark:divide-slate-800">
              {data.sellers.map(seller => (
                <div key={seller.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-black text-xs">
                      {seller.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-ink dark:text-white">{seller.name}</h4>
                      <p className="text-xs text-slate-400 font-semibold">{seller.division} · {seller.code}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 text-right">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Ventas Logradas</span>
                      <strong className="text-sm font-black text-ink dark:text-white">
                        ${seller.sales.toLocaleString()}
                      </strong>
                    </div>
                    <div className="w-16">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Cumpl.</span>
                      <strong className="text-sm font-black text-brand-blue">
                        {seller.percentage}%
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        </>
        )}

      </div>
    </MobilePage>
  );
}
