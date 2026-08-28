import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BarChart3, CircleDollarSign, FileText, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobilePage } from '../../../core/layout/MobilePage';
import { Skeleton } from '../../../core/ui/Skeleton';
import { getBusinessAnalytics, type BusinessAnalytics } from '../services/analytics.service';

interface Props { title: string; subtitle: string; }

const money = new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('es-SV');

export default function RoleAnalyticsPage({ title, subtitle }: Props) {
  const navigate = useNavigate();
  const [data, setData] = useState<BusinessAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    getBusinessAnalytics()
      .then(value => { if (mounted) setData(value); })
      .catch(caught => { if (mounted) setError(caught instanceof Error ? caught.message : 'No fue posible cargar analytics.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const maxTrend = useMemo(() => Math.max(...(data?.sixMonthTrend.map(item => item.value) ?? [0]), 1), [data]);
  const maxRegion = useMemo(() => Math.max(...(data?.regionalSales.map(item => item.amount) ?? [0]), 1), [data]);

  return (
    <MobilePage>
      <header className="flex items-center gap-4 px-6 pb-8 pt-12 md:px-0 md:pt-0">
        <button type="button" onClick={() => navigate(-1)} className="min-h-11 min-w-11 rounded-xl text-ink-muted md:hidden" aria-label="Volver">
          <ArrowLeft size={22} className="mx-auto" />
        </button>
        <div><h1 className="text-2xl font-black tracking-tight text-ink">{title}</h1><p className="mt-1 text-[11px] font-black uppercase tracking-widest text-brand-blue">{subtitle}</p></div>
      </header>
      <div className="space-y-6 px-6 pb-24">
        {error && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
        {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[1, 2, 3, 4, 5].map(item => <Skeleton key={item} className="h-28 rounded-3xl" />)}</div> : !data ? <div className="rounded-3xl border border-dashed border-surface-border bg-white p-12 text-center text-sm font-semibold text-ink-muted">No hay datos disponibles para tu alcance.</div> : <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Metric title="Ventas válidas" value={money.format(data.totalRevenue)} icon={TrendingUp} primary />
            <Metric title="Pedidos" value={number.format(data.totalOrders)} icon={ShoppingCart} />
            <Metric title="Facturación" value={money.format(data.totalInvoiced)} icon={FileText} />
            <Metric title="Cobros recibidos" value={money.format(data.totalCollected)} icon={CircleDollarSign} />
            <Metric title="Saldo pendiente" value={money.format(data.outstandingBalance)} icon={BarChart3} />
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <section className="rounded-3xl border border-surface-border bg-white p-6 shadow-card">
              <div className="mb-6 flex items-center justify-between"><div><h2 className="text-base font-black text-ink">Ventas por mes</h2><p className="mt-1 text-xs text-ink-muted">Pedidos válidos del último semestre</p></div><TrendingUp size={20} className="text-brand-blue" /></div>
              {data.sixMonthTrend.length === 0 ? <Empty /> : <div className="space-y-4">{data.sixMonthTrend.map(item => <div key={item.period} className="grid grid-cols-[4.5rem_1fr_5.5rem] items-center gap-3 text-xs"><span className="font-bold text-ink-muted">{item.period}</span><div className="h-3 overflow-hidden rounded-full bg-surface-soft"><div className="h-full rounded-full bg-brand-blue transition-[width] duration-200" style={{ width: `${Math.max(2, item.value / maxTrend * 100)}%` }} /></div><span className="text-right font-black text-ink">{money.format(item.value)}</span></div>)}</div>}
            </section>
            <section className="rounded-3xl border border-surface-border bg-white p-6 shadow-card">
              <div className="mb-6 flex items-center justify-between"><div><h2 className="text-base font-black text-ink">Ventas por región</h2><p className="mt-1 text-xs text-ink-muted">Alcance autorizado</p></div><BarChart3 size={20} className="text-brand-blue" /></div>
              {data.regionalSales.length === 0 ? <Empty /> : <div className="space-y-4">{data.regionalSales.map(item => <div key={item.region}><div className="mb-1 flex justify-between text-xs"><span className="font-bold text-ink">{item.region}</span><span className="font-black text-ink">{money.format(item.amount)}</span></div><div className="h-2 overflow-hidden rounded-full bg-surface-soft"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(2, item.amount / maxRegion * 100)}%` }} /></div></div>)}</div>}
            </section>
          </div>
          <section className="rounded-3xl border border-surface-border bg-white p-6 shadow-card">
            <div className="mb-6 flex items-center justify-between"><div><h2 className="text-base font-black text-ink">Productos más vendidos</h2><p className="mt-1 text-xs text-ink-muted">Unidades en pedidos válidos</p></div><Package size={20} className="text-brand-blue" /></div>
            {data.productMix.length === 0 ? <Empty /> : <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">{data.productMix.map((item, index) => <div key={item.category} className="flex items-center gap-3"><span className="w-6 text-xs font-black text-ink-muted">{String(index + 1).padStart(2, '0')}</span><div className="min-w-0 flex-1"><div className="flex justify-between gap-3 text-xs"><span className="truncate font-bold text-ink">{item.category}</span><span className="font-black text-brand-blue">{number.format(item.quantity)} · {item.percentage}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-soft"><div className="h-full rounded-full bg-brand-blue" style={{ width: `${item.percentage}%` }} /></div></div></div>)}</div>}
          </section>
          <p className="rounded-3xl border border-brand-blue/10 bg-brand-blue/5 p-5 text-sm leading-relaxed text-ink-muted">{data.globalInsight}</p>
        </>}
      </div>
    </MobilePage>
  );
}

function Metric({ title, value, icon: Icon, primary = false }: { title: string; value: string; icon: typeof TrendingUp; primary?: boolean }) {
  return <div className={primary ? 'rounded-3xl bg-brand-blue p-5 text-white shadow-card' : 'rounded-3xl border border-surface-border bg-white p-5 shadow-card'}><Icon size={19} className={primary ? 'mb-5 text-white/80' : 'mb-5 text-brand-blue'} /><p className={primary ? 'text-[10px] font-black uppercase tracking-widest text-white/75' : 'text-[10px] font-black uppercase tracking-widest text-ink-muted'}>{title}</p><p className={primary ? 'mt-1 text-xl font-black text-white' : 'mt-1 text-xl font-black text-ink'}>{value}</p></div>;
}

function Empty() { return <p className="rounded-2xl bg-surface-soft p-6 text-center text-sm font-semibold text-ink-muted">No hay datos para este periodo.</p>; }
