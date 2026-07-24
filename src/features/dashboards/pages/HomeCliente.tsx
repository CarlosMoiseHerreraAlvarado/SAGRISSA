import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, FileText, Package, ClipboardList } from 'lucide-react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { StatCard } from '../../../core/ui/StatCard';
import { AgingCard } from '../../../core/ui/AgingCard';
import { ActionCard } from '../../../core/ui/ActionCard';
import { ListCard, ListCardHeader, ListCardFooter } from '../../../core/ui/ListCard';
import { StatusBadge } from '../../../core/ui/StatusBadge';
import { Skeleton } from '../../../core/ui/Skeleton';
import { useAuth } from '../../../core/hooks/useAuth';
import { fetchApi } from '../../../core/api/api.config';
import type { InvoiceSummary } from '../../facturacion/services/factura.service';

interface AccountData { totalDebt: number; availableCredit: number; pendingInvoices: number; openOrders: number; daysToPay: number; creditTerm: number; lastPayment: number; lastPaymentDate: string; creditLine: number; aging: { range: string; amount: number }[]; }

export default function HomeCliente() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [account, setAccount] = useState<AccountData | null>(null);
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchApi<AccountData>('/accounts/me'), fetchApi<InvoiceSummary[]>('/invoices')])
      .then(([accountData, invoiceData]) => { setAccount(accountData); setInvoices(invoiceData.slice(0, 3)); })
      .catch(caught => setError(caught instanceof Error ? caught.message : 'No fue posible cargar el resumen de cuenta.'))
      .finally(() => setLoading(false));
  }, []);

  return <MobilePage>
    <header className="px-6 pb-6 pt-16 md:hidden"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue text-xl font-black text-white">{user?.name?.charAt(0) ?? 'C'}</div><div><p className="text-sm font-black text-ink">Hola, {user?.name?.split(' ')[0]}</p><p className="text-[11px] font-black uppercase tracking-widest text-brand-blue">Cliente</p></div></div></header>
    <div className="space-y-8 px-6 pb-24 md:px-0">
      {error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
      {loading ? <Skeleton className="h-44 rounded-3xl" /> : <StatCard title="Saldo total adeudado" value={account ? `$${account.totalDebt.toLocaleString()}` : '—'} subtitle="Información actualizada desde el API" variant="primary" />}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4"><StatCard title="Disponible" value={account ? `$${account.availableCredit.toLocaleString()}` : '—'} variant="default" /><StatCard title="Días crédito" value={account ? `${account.creditTerm} d` : '—'} variant="default" /><StatCard title="Último pago" value={account ? `$${account.lastPayment.toLocaleString()}` : '—'} variant="default" /><StatCard title="Facturas pendientes" value={account ? String(account.pendingInvoices) : '—'} variant="default" /></div>
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]"><section className="space-y-6"><AgingCard items={account?.aging ?? []} loading={loading} /><div className="space-y-3"><h2 className="px-1 text-sm font-black uppercase tracking-widest text-ink">Accesos rápidos</h2><div className="grid grid-cols-2 gap-3"><ActionCard label="Estado de cuenta" icon={DollarSign} color="emerald" onClick={() => navigate('/app/cliente/cartera')} /><ActionCard label="Facturas" icon={FileText} color="blue" onClick={() => navigate('/app/cliente/facturas')} /><ActionCard label="Catálogo" icon={Package} color="orange" onClick={() => navigate('/app/cliente/catalogo')} /><ActionCard label="Mis pedidos" icon={ClipboardList} color="purple" onClick={() => navigate('/app/cliente/pedidos')} /></div></div></section><section className="space-y-3"><h2 className="px-1 text-sm font-black uppercase tracking-widest text-ink">Actividad reciente</h2>{loading ? [1, 2].map(item => <Skeleton key={item} className="h-28 rounded-3xl" />) : invoices.length === 0 ? <div className="rounded-3xl border border-dashed border-surface-border p-6 text-center text-sm font-semibold text-ink-muted">No hay facturas recientes.</div> : invoices.map(invoice => <ListCard key={invoice.id} onClick={() => navigate(`/app/cliente/facturas/${invoice.id}`)}><ListCardHeader title={invoice.number} badge={<StatusBadge status={invoice.status} size="sm" />} /><div className="mb-3 text-xs font-semibold text-ink-muted">{invoice.date}</div><ListCardFooter label="Saldo" value={`$${invoice.balance.toLocaleString()}`} /></ListCard>)}</section></div>
    </div>
  </MobilePage>;
}
