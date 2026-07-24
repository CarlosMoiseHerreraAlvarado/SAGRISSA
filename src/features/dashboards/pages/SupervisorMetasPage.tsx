import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Target } from 'lucide-react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { Skeleton } from '../../../core/ui/Skeleton';
import { goalsService, type GoalItem } from '../services/goals.service';

export default function SupervisorMetasPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    goalsService.getGoals('supervisor')
      .then(setGoals)
      .catch(caught => setError(caught instanceof Error ? caught.message : 'No fue posible cargar las metas.'))
      .finally(() => setLoading(false));
  }, []);

  const current = goals.reduce((sum, goal) => sum + goal.current, 0);
  const target = goals.reduce((sum, goal) => sum + goal.target, 0);
  const totalProgress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return <MobilePage>
    <header className="px-6 pb-6 pt-16 md:px-0 md:pt-0 flex items-center gap-4">
      <button type="button" onClick={() => navigate(-1)} className="min-h-11 min-w-11 text-ink-muted" aria-label="Volver"><ArrowLeft size={24} className="mx-auto" /></button>
      <div><h1 className="text-xl font-black text-ink md:text-2xl">Metas de equipo</h1><p className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Cumplimiento y objetivos</p></div>
    </header>
    <div className="space-y-6 px-6 pb-24 md:px-0">
      {error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
      <section className="rounded-3xl border border-surface-border bg-white p-8 text-center shadow-card">
        <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border-[12px] border-brand-blue/15 text-4xl font-black text-ink">{totalProgress}%</div>
        <h2 className="mt-5 text-lg font-black text-ink">Progreso agregado</h2>
        <p className="mt-1 text-sm text-ink-muted">Datos recibidos desde el servicio de metas.</p>
      </section>
      <section className="space-y-4">
        <h2 className="px-1 text-sm font-black uppercase tracking-widest text-ink">Detalle de objetivos</h2>
        {loading ? [1, 2, 3].map(item => <Skeleton key={item} className="h-32 w-full rounded-3xl" />) : goals.length === 0 ? <div className="rounded-3xl border border-dashed border-surface-border p-8 text-center text-sm font-semibold text-ink-muted">No hay metas disponibles para tu alcance.</div> : goals.map(goal => {
          const progress = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0;
          return <article key={goal.id} className="rounded-3xl border border-surface-border bg-white p-6 shadow-card">
            <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">{progress >= 100 ? <CheckCircle2 size={20} /> : <Target size={20} />}</span><div><h3 className="font-black text-ink">{goal.title}</h3>{goal.owner && <p className="text-xs text-ink-muted">{goal.owner}</p>}</div></div><strong className="text-sm text-ink">{progress.toFixed(0)}%</strong></div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-surface-soft"><div className="h-full rounded-full bg-brand-blue" style={{ width: `${progress}%` }} /></div>
            <div className="mt-3 flex justify-between text-xs font-semibold text-ink-muted"><span>Actual: {goal.current.toLocaleString()} {goal.unit}</span><span>Meta: {goal.target.toLocaleString()} {goal.unit}</span></div>
          </article>;
        })}
      </section>
    </div>
  </MobilePage>;
}
