import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ChevronRight, Target, Users } from 'lucide-react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { StatCard } from '../../../core/ui/StatCard';
import { ListCard } from '../../../core/ui/ListCard';
import { Skeleton } from '../../../core/ui/Skeleton';
import { goalsService, type GoalItem } from '../services/goals.service';
import { getBusinessAnalytics, type BusinessAnalytics } from '../services/analytics.service';

export default function DashboardSupervisor() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([goalsService.getGoals('supervisor'), getBusinessAnalytics()])
      .then(([goalData, analyticsData]) => { setGoals(goalData); setAnalytics(analyticsData); })
      .catch(caught => setError(caught instanceof Error ? caught.message : 'No fue posible cargar el dashboard de supervisor.'))
      .finally(() => setLoading(false));
  }, []);

  const current = goals.reduce((sum, goal) => sum + goal.current, 0);
  const target = goals.reduce((sum, goal) => sum + goal.target, 0);
  const progress = target > 0 ? Math.round(current / target * 100) : 0;

  return <MobilePage>
    <header className="px-6 pb-8 pt-16 md:px-0 md:pt-0"><h1 className="text-2xl font-black text-ink md:text-3xl">Control operativo</h1><p className="text-[12px] font-black uppercase tracking-widest text-brand-blue">Dashboard de supervisor</p></header>
    <div className="space-y-8 px-6 pb-24 md:px-0">
      {error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
      <div className="grid gap-4 md:grid-cols-3"><StatCard title="Resultado actual" value={current ? current.toLocaleString() : '—'} variant="primary" /><StatCard title="Cumplimiento de metas" value={target ? `${progress}%` : '—'} icon={Target} onClick={() => navigate('/app/supervisor/metas')} variant="default" /><StatCard title="Regiones reportadas" value={analytics ? String(analytics.regionalSales.length) : '—'} icon={Users} onClick={() => navigate('/app/supervisor/equipo')} variant="default" /></div>
      <section className="space-y-4"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-ink"><Activity size={18} className="text-brand-blue" /> Metas recibidas</h2><button type="button" onClick={() => navigate('/app/supervisor/metas')} className="flex items-center gap-1 text-xs font-black uppercase text-brand-blue">Ver detalle <ChevronRight size={14} /></button></div>{loading ? [1, 2, 3].map(item => <Skeleton key={item} className="h-20 rounded-2xl" />) : goals.length === 0 ? <div className="rounded-3xl border border-dashed border-surface-border p-8 text-center text-sm font-semibold text-ink-muted">No hay metas disponibles para tu alcance.</div> : goals.slice(0, 5).map(goal => { const value = goal.target > 0 ? Math.min(100, goal.current / goal.target * 100) : 0; return <ListCard key={goal.id}><div className="flex items-center justify-between gap-4"><div><p className="font-black text-ink">{goal.title}</p><p className="text-xs text-ink-muted">{goal.owner || 'Equipo asignado'}</p></div><strong className="text-brand-blue">{value.toFixed(0)}%</strong></div><div className="mt-4 h-2 rounded-full bg-surface-soft"><div className="h-full rounded-full bg-brand-blue" style={{ width: `${value}%` }} /></div></ListCard>; })}</section>
    </div>
  </MobilePage>;
}
