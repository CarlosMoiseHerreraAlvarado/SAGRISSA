import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { goalsService, type PeriodGoalData } from '../services/goals.service';

export default function SupervisorMetasPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<PeriodGoalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    goalsService.getPeriodGoalData('mensual', 'Noviembre')
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <MobilePage>
      <header className="px-6 pb-6 pt-12 md:px-0 md:pt-0 flex items-center gap-4">
        <button 
          type="button" 
          onClick={() => navigate(-1)} 
          className="min-h-11 min-w-11 rounded-full p-2 text-ink-muted dark:text-slate-400 hover:bg-surface-soft dark:hover:bg-slate-800 md:hidden" 
          aria-label="Volver"
        >
          <ArrowLeft size={24} className="mx-auto" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-ink dark:text-white tracking-tight">Metas de Equipo</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue">
            Supervisor Comercial · Noviembre 2022
          </p>
        </div>
      </header>

      <div className="space-y-6 px-6 pb-32 md:px-0">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-brand-blue" size={32} />
            <p className="text-xs font-bold text-slate-400">Cargando metas de supervisión...</p>
          </div>
        ) : (
          <>
            {/* Global Progress Card */}
        {data && (
          <div className="rounded-3xl border border-surface-border dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-card dark:shadow-card-dark space-y-4">
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-brand-blue/20 dark:border-brand-blue/30 text-3xl font-black text-ink dark:text-white">
              {data.progressPercentage}%
            </div>
            <div>
              <h2 className="text-lg font-black text-ink dark:text-white">Cumplimiento Mensual del Equipo</h2>
              <p className="text-xs text-ink-muted dark:text-slate-400 mt-1">
                ${data.totalSales.toLocaleString()} vendidos de ${data.totalProjection.toLocaleString()} meta grupal
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-surface-border dark:border-slate-800 text-left text-xs">
              <div className="p-3 bg-surface-soft dark:bg-slate-800/60 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Por Vender</span>
                <strong className="text-sm font-black text-amber-600">${data.totalPendingToSell.toLocaleString()}</strong>
              </div>
              <div className="p-3 bg-surface-soft dark:bg-slate-800/60 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Cobros Realizados</span>
                <strong className="text-sm font-black text-emerald-600">${data.totalCollections.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Sellers Individual Breakdown */}
        {data && (
          <section className="space-y-3">
            <h3 className="px-1 text-sm font-black uppercase tracking-widest text-ink dark:text-white">
              Vendedores a Cargo ({data.sellers.length})
            </h3>
            
            <div className="space-y-3">
              {data.sellers.map(seller => (
                <div 
                  key={seller.id}
                  className="p-5 bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-3xl shadow-card dark:shadow-card-dark space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-black text-xs">
                        {seller.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-ink dark:text-white">{seller.name}</h4>
                        <p className="text-xs text-slate-400 font-semibold">{seller.division} · {seller.code}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-brand-blue">{seller.percentage}%</span>
                  </div>

                  <div className="w-full h-2 bg-surface-soft dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-blue rounded-full"
                      style={{ width: `${Math.min(100, seller.percentage)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs font-semibold text-ink-muted dark:text-slate-400 pt-1">
                    <span>Ventas: ${seller.sales.toLocaleString()}</span>
                    <span>Cuota: ${seller.projection.toLocaleString()}</span>
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
