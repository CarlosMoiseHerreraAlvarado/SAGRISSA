import { useEffect, useState } from 'react';
import { Target, TrendingUp, Users, DollarSign, Download } from 'lucide-react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { StatCard } from '../../../core/ui/StatCard';
import { Skeleton } from '../../../core/ui/Skeleton';
import { goalsService, type GoalItem } from '../services/goals.service';

export default function GerenteMetasPage() {
  const [filter, setFilter] = useState('mensual');
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    goalsService.getGoals('gerente')
      .then(setGoals)
      .catch(caught => setError(caught instanceof Error ? caught.message : 'No fue posible cargar las metas.'))
      .finally(() => setLoading(false));
  }, [filter]);

  const current = goals.reduce((sum, goal) => sum + goal.current, 0);
  const target = goals.reduce((sum, goal) => sum + goal.target, 0);
  const progress = target > 0 ? Math.round((current / target) * 100) : 0;

  return <MobilePage>
    <header className="px-6 pb-8 pt-16 md:px-0 md:pt-0"><div className="flex items-end justify-between gap-4"><div><h1 className="text-2xl font-black text-ink md:text-3xl">Metas y desempeño</h1><p className="text-[12px] font-black uppercase tracking-widest text-brand-blue">Visión gerencial</p></div><button type="button" className="hidden min-h-11 items-center gap-2 rounded-xl border border-surface-border bg-white px-4 text-xs font-black md:flex"><Download size={14} /> Exportar</button></div></header>
    <div className="space-y-6 px-6 pb-24 md:px-0">
      <div className="flex gap-2">{['mensual', 'trimestral', 'anual'].map(period => <button type="button" key={period} onClick={() => setFilter(period)} className={`min-h-11 rounded-xl px-4 text-xs font-black uppercase tracking-widest ${filter === period ? 'bg-brand-blue text-white' : 'border border-surface-border bg-white text-ink-muted'}`}>{period}</button>)}</div>
      {error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><StatCard title="Meta global" value={target ? target.toLocaleString() : '—'} icon={Target} variant="primary" /><StatCard title="Cumplimiento" value={target ? `${progress}%` : '—'} icon={TrendingUp} variant="default" /><StatCard title="Metas recibidas" value={goals.length ? String(goals.length) : '—'} icon={Users} variant="default" /><StatCard title="Resultado actual" value={current ? current.toLocaleString() : '—'} icon={DollarSign} variant="default" /></div>
      <section className="space-y-4 rounded-3xl border border-surface-border bg-white p-6 shadow-card"><h2 className="text-sm font-black uppercase tracking-widest text-ink">Desempeño recibido del API</h2>{loading ? [1, 2, 3].map(item => <Skeleton key={item} className="h-16 w-full rounded-2xl" />) : goals.length === 0 ? <p className="rounded-2xl border border-dashed border-surface-border p-6 text-center text-sm font-semibold text-ink-muted">No hay metas para este periodo.</p> : goals.map(goal => { const value = goal.target > 0 ? Math.min(100, goal.current / goal.target * 100) : 0; return <div key={goal.id} className="space-y-2"><div className="flex justify-between gap-4 text-sm"><span className="font-black text-ink">{goal.title}</span><span className="font-bold text-ink-muted">{value.toFixed(0)}%</span></div><div className="h-2 rounded-full bg-surface-soft"><div className="h-full rounded-full bg-brand-blue" style={{ width: `${value}%` }} /></div>{goal.owner && <p className="text-xs text-ink-muted">{goal.owner}</p>}</div>; })}</section>
    </div>
  </MobilePage>;
}
