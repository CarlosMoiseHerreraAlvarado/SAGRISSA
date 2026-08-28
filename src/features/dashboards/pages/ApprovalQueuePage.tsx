import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, FileText, Loader2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobilePage } from '../../../core/layout/MobilePage';
import { useAuth } from '../../../core/hooks/useAuth';
import { hasPermission } from '../../../core/auth/permissions';
import { approvalsService, type ApprovalRequest } from '../services/approvals.service';

interface Props { title: string; subtitle: string; }

export default function ApprovalQueuePage({ title, subtitle }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canDecide = hasPermission(user?.permissions, 'approvals.decide');
  const [items, setItems] = useState<ApprovalRequest[]>([]);
  const [selected, setSelected] = useState<ApprovalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deciding, setDeciding] = useState(false);

  const load = () => { setLoading(true); approvalsService.getPending().then(setItems).catch(caught => setError(caught instanceof Error ? caught.message : 'No fue posible cargar las aprobaciones.')).finally(() => setLoading(false)); };
  useEffect(load, []);

  const decide = async (decision: 'approve' | 'reject') => {
    if (!selected) return;
    setDeciding(true);
    try { await approvalsService.decide(selected.id, decision); setItems(current => current.filter(item => item.id !== selected.id)); setSelected(null); } catch (caught) { setError(caught instanceof Error ? caught.message : 'No fue posible registrar la decisión.'); } finally { setDeciding(false); }
  };

  return <MobilePage><header className="flex items-center gap-4 px-6 pb-6 pt-12 md:px-0 md:pt-0"><button type="button" onClick={() => navigate(-1)} className="min-h-11 min-w-11 text-ink-muted md:hidden" aria-label="Volver"><ArrowLeft size={24} className="mx-auto" /></button><div><h1 className="text-xl font-black text-ink md:text-2xl">{title}</h1><p className="text-[10px] font-black uppercase tracking-widest text-brand-blue">{subtitle}</p></div></header><div className="px-6 pb-24 md:px-0">{error && <p role="alert" className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}{loading ? <Loader2 className="mx-auto animate-spin text-brand-blue" /> : items.length === 0 ? <div className="py-20 text-center"><CheckCircle2 size={42} className="mx-auto mb-4 text-emerald-500" /><p className="font-bold text-ink-muted">No hay aprobaciones pendientes.</p></div> : <div className="grid gap-4 md:grid-cols-2">{items.map(item => <button key={item.id} type="button" onClick={() => setSelected(item)} className="rounded-3xl border border-surface-border bg-white p-6 text-left shadow-card hover:border-brand-blue/40"><div className="mb-4 flex items-start justify-between"><span className="rounded-2xl bg-surface-soft p-3 text-brand-blue"><FileText size={22} /></span><strong className="text-ink">${item.amount.toLocaleString()}</strong></div><strong className="block text-sm text-ink">{item.customer}</strong><span className="text-xs font-bold text-amber-600">{item.reason}</span><small className="mt-4 block text-xs text-ink-muted">{item.date}</small></button>)}</div>}{selected && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-4 md:items-center"><div className="w-full max-w-lg rounded-3xl bg-white p-6"><div className="flex justify-between"><div><p className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Detalle</p><h2 className="text-xl font-black text-ink">{selected.customer}</h2></div><button type="button" onClick={() => setSelected(null)} aria-label="Cerrar" className="min-h-11 min-w-11 text-ink-muted"><XCircle size={22} className="mx-auto" /></button></div><p className="my-6 rounded-2xl bg-surface-soft p-4 text-sm leading-relaxed text-ink-muted">{selected.details}</p>{canDecide ? <div className="flex gap-3"><button type="button" disabled={deciding} onClick={() => void decide('reject')} className="min-h-14 flex-1 rounded-2xl bg-surface-soft text-sm font-black uppercase tracking-widest text-ink-muted">Rechazar</button><button type="button" disabled={deciding} onClick={() => void decide('approve')} className="min-h-14 flex-1 rounded-2xl bg-brand-blue text-sm font-black uppercase tracking-widest text-white">{deciding ? <Loader2 className="mx-auto animate-spin" /> : 'Aprobar'}</button></div> : <p className="rounded-2xl bg-surface-soft p-4 text-center text-xs font-bold text-ink-muted">Modo consulta: las decisiones corresponden a Gerente/Admin.</p>}</div></div>}</div></MobilePage>;
}
