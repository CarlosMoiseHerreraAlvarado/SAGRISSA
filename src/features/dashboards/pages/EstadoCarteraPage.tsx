import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, ChevronRight, DollarSign, Landmark } from 'lucide-react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { Skeleton } from '../../../core/ui/Skeleton';
import { APP_ROUTES } from '../../../core/routing/routes';
import { carteraService, type CarteraSummary, type OverdueInvoice } from '../../cartera/services/cartera.service';

export default function EstadoCarteraPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<CarteraSummary | null>(null);
  const [invoices, setInvoices] = useState<OverdueInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void Promise.all([carteraService.getSummary(), carteraService.getOverdueInvoices()])
      .then(([data, overdue]) => {
        setSummary(data);
        setInvoices(overdue);
      })
      .catch(caught => setError(caught instanceof Error ? caught.message : 'No fue posible cargar la cartera.'))
      .finally(() => setLoading(false));
  }, []);

  const overdueTotal = summary
    ? summary.overdue30 + summary.overdue60 + summary.overdue90
    : null;

  return (
    <MobilePage>
      <header className="flex items-center gap-4 px-6 pb-6 pt-16 md:px-0 md:pt-0">
        <button type="button" onClick={() => navigate(-1)} aria-label="Volver" className="min-h-11 min-w-11 text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
          <ArrowLeft aria-hidden="true" size={24} className="mx-auto" />
        </button>
        <div>
          <h1 className="text-xl font-black text-ink md:text-2xl">Estado de cartera</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Cobros y vencimientos</p>
        </div>
      </header>

      <div className="space-y-8 px-6 pb-24 md:px-0">
        {error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
        <section className="rounded-3xl bg-brand-blue p-8 text-white shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">Total pendiente</p>
              <h2 className="mt-2 text-3xl font-black">{summary ? `$${summary.totalDebt.toLocaleString()}` : '—'}</h2>
            </div>
            <Landmark aria-hidden="true" size={48} className="shrink-0 text-white/50" />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-white/70">Vencido</p><strong>${overdueTotal?.toLocaleString() ?? '—'}</strong></div>
            <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-white/70">Corriente</p><strong>${summary?.current.toLocaleString() ?? '—'}</strong></div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="px-1 text-sm font-black uppercase tracking-widest text-ink">Facturas por cobrar</h2>
          {loading ? [1, 2].map(item => <Skeleton key={item} className="h-24 rounded-3xl" />) : invoices.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-surface-border p-8 text-center text-sm font-semibold text-ink-muted">No hay facturas vencidas.</div>
          ) : invoices.map(invoice => (
            <article key={invoice.id} className="flex items-center justify-between gap-4 rounded-3xl border border-surface-border bg-white p-5 shadow-card">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Calendar aria-hidden="true" size={20} /></span>
                <div className="min-w-0"><p className="truncate font-black text-ink">{invoice.customerName}</p><p className="truncate text-xs font-bold uppercase tracking-widest text-ink-muted">{invoice.number} · {invoice.daysOverdue} días</p></div>
              </div>
              <div className="flex shrink-0 items-center gap-3"><strong className="text-sm text-ink">${invoice.amount.toLocaleString()}</strong><ChevronRight aria-hidden="true" size={18} className="text-ink-light" /></div>
            </article>
          ))}
        </section>

        <button type="button" onClick={() => navigate(APP_ROUTES.vendedor.nuevoCobro)} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-3xl bg-slate-900 text-sm font-black uppercase tracking-widest text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2">
          <DollarSign aria-hidden="true" size={18} /> Registrar cobro
        </button>
      </div>
    </MobilePage>
  );
}
