import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ChevronRight, DollarSign, FileText, Globe, MapPin, Package, TrendingUp } from 'lucide-react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { StatCard } from '../../../core/ui/StatCard';
import { Skeleton } from '../../../core/ui/Skeleton';
import { getBusinessAnalytics, type BusinessAnalytics } from '../services/analytics.service';

const money = (value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export default function DashboardDirector() {
  const navigate = useNavigate();
  const [data, setData] = useState<BusinessAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getBusinessAnalytics().then(setData).catch(caught => setError(caught instanceof Error ? caught.message : 'No fue posible cargar analytics.')).finally(() => setLoading(false));
  }, []);

  return (
    <MobilePage>
      <header className="px-6 pb-8 pt-16 md:px-0 md:pt-0">
        <h1 className="text-2xl font-black text-ink dark:text-white md:text-3xl">Dirección General</h1>
        <p className="text-[12px] font-black uppercase tracking-widest text-brand-blue">Visión estratégica corporativa</p>
      </header>
      
      <div className="space-y-8 px-6 pb-32 md:px-0">
        {error && <p role="alert" className="rounded-2xl bg-red-50 dark:bg-red-950/60 p-4 text-sm font-semibold text-red-700 dark:text-red-300">{error}</p>}
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Ingreso consolidado" value={data ? money(data.totalRevenue) : '—'} icon={DollarSign} variant="primary" />
          <StatCard title="Regiones" value={data ? String(data.regionalSales.length) : '—'} icon={Globe} variant="default" />
          <StatCard title="Tendencias" value={data ? String(data.sixMonthTrend.length) : '—'} icon={TrendingUp} variant="default" />
          <StatCard title="Mix de productos" value={data ? String(data.productMix.length) : '—'} icon={Package} variant="default" />
        </div>
        
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-ink dark:text-white">
              <BarChart3 size={18} className="text-brand-blue" /> Rendimiento regional
            </h2>
            <button type="button" onClick={() => navigate('/app/director/analytics')} className="flex items-center gap-1 text-xs font-black uppercase text-brand-blue">
              Analytics <ChevronRight size={14} />
            </button>
          </div>
          <div className="rounded-3xl border border-surface-border dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-card dark:shadow-card-dark">
            {loading ? (
              [1, 2, 3].map(item => <Skeleton key={item} className="mb-4 h-16 rounded-2xl" />)
            ) : data?.regionalSales.length ? (
              data.regionalSales.map(region => (
                <div key={region.region} className="flex items-center justify-between border-b border-surface-border dark:border-slate-800 py-4 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-soft dark:bg-slate-800 text-brand-blue">
                      <MapPin size={18} />
                    </span>
                    <span className="font-black text-ink dark:text-white">{region.region}</span>
                  </div>
                  <strong className="text-brand-blue">{money(region.amount)}</strong>
                </div>
              ))
            ) : (
              <p className="p-6 text-center text-sm font-semibold text-ink-muted dark:text-slate-400">No hay datos regionales disponibles.</p>
            )}
          </div>
        </section>
        
        <button type="button" onClick={() => navigate('/app/director/reportes')} className="flex min-h-16 w-full items-center justify-center gap-3 rounded-3xl bg-brand-blue text-sm font-black uppercase tracking-widest text-white shadow-md shadow-brand-blue/20">
          <FileText size={20} /> Reportes ejecutivos
        </button>
      </div>
    </MobilePage>
  );
}
