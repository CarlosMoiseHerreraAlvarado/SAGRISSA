import { useEffect, useState } from 'react';
import { ArrowLeft, Download, Mail, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/hooks/useAuth';
import { fetchApi } from '../../../core/api/api.config';
import { accountService } from '../services/account.service';
import { AgingCard } from '../../../core/ui/AgingCard';
import { StatCard } from '../../../core/ui/StatCard';

interface AccountData {
  totalDebt: number; availableCredit: number; pendingInvoices: number; openOrders: number; daysToPay: number; creditTerm: number; lastPayment: number; lastPaymentDate: string; creditLine: number; aging: { range: string; amount: number }[];
}

export default function AccountCliente() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<AccountData | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<'download' | 'email' | null>(null);

  useEffect(() => {
    fetchApi<AccountData>('/accounts/me').then(setData).catch(caught => setError(caught instanceof Error ? caught.message : 'No fue posible cargar el estado de cuenta.'));
  }, []);

  const download = async () => { setBusy('download'); try { await accountService.downloadStatement(); } catch (caught) { setError(caught instanceof Error ? caught.message : 'No fue posible descargar el estado de cuenta.'); } finally { setBusy(null); } };
  const email = async () => { setBusy('email'); try { await accountService.sendByEmail(user?.email ?? ''); } catch (caught) { setError(caught instanceof Error ? caught.message : 'No fue posible enviar el estado de cuenta.'); } finally { setBusy(null); } };

  return <main className="w-full min-h-full bg-white md:bg-transparent pb-24"><div className="mx-auto w-full max-w-6xl px-6 py-6 md:px-8 md:py-8"><header className="mb-8 flex items-center gap-3"><button type="button" onClick={() => navigate('/app/cliente/home')} className="min-h-11 min-w-11 text-ink-muted md:hidden" aria-label="Volver"><ArrowLeft size={24} className="mx-auto" /></button><div><h1 className="text-xl font-black text-ink md:text-2xl">Estado de cuenta</h1><p className="text-xs font-bold uppercase tracking-widest text-brand-blue">{user?.name}</p></div></header>{error && <p role="alert" className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}{data && <div className="grid gap-6 lg:grid-cols-[1fr_300px]"><section className="space-y-6"><div className="rounded-3xl bg-brand-blue p-6 text-white"><p className="text-xs font-bold uppercase tracking-widest text-white/70">Total adeudado</p><strong className="mt-2 block text-3xl font-black">${data.totalDebt.toLocaleString()}</strong><p className="mt-2 text-sm text-white/80">Crédito disponible: ${data.availableCredit.toLocaleString()}</p></div><AgingCard items={data.aging} loading={false} /><div className="grid grid-cols-2 gap-3 md:grid-cols-3"><StatCard title="Facturas pendientes" value={String(data.pendingInvoices)} variant="default" /><StatCard title="Pedidos abiertos" value={String(data.openOrders)} variant="default" /><StatCard title="Días de pago" value={`${data.daysToPay}`} variant="default" /></div></section><aside className="space-y-3"><button type="button" onClick={() => void download()} disabled={busy !== null} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-blue text-sm font-black uppercase tracking-widest text-white disabled:opacity-60">{busy === 'download' ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />} Descargar PDF</button><button type="button" onClick={() => void email()} disabled={busy !== null || !user?.email} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-surface-border bg-white text-sm font-black uppercase tracking-widest text-ink-muted disabled:opacity-60">{busy === 'email' ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />} Enviar por email</button><button type="button" onClick={() => navigate('/app/cliente/facturas')} className="min-h-12 w-full rounded-2xl bg-surface-soft text-xs font-black uppercase tracking-widest text-ink-muted">Ver facturas</button></aside></div>}</div></main>;
}
