import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileCheck, TrendingUp, ChevronRight, Search } from 'lucide-react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { StatCard } from '../../../core/ui/StatCard';
import { ListCard } from '../../../core/ui/ListCard';
import { Skeleton } from '../../../core/ui/Skeleton';
import { useAuth } from '../../../core/hooks/useAuth';
import { approvalsService, type ApprovalRequest } from '../services/approvals.service';
import { getBusinessAnalytics, type BusinessAnalytics } from '../services/analytics.service';

export default function DashboardGerente() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchApprovals, setSearchApprovals] = useState('');

  useEffect(() => {
    Promise.all([approvalsService.getPending(), getBusinessAnalytics(user?.area)])
      .then(([pending, data]) => { setApprovals(pending); setAnalytics(data); })
      .catch(caught => setError(caught instanceof Error ? caught.message : 'No fue posible cargar el dashboard gerencial.'))
      .finally(() => setLoading(false));
  }, [user?.area]);

  return (
    <MobilePage>
      <header className="px-6 pb-8 pt-16 md:px-0 md:pt-0">
        <h1 className="text-2xl font-black text-ink dark:text-white md:text-3xl">Gestión Gerencial</h1>
        <p className="text-[12px] font-black uppercase tracking-widest text-brand-blue">Finanzas y operaciones</p>
      </header>
      
      <div className="space-y-8 px-6 pb-24 md:px-0">
        {error && <p role="alert" className="rounded-2xl bg-red-50 dark:bg-red-950/60 p-4 text-sm font-semibold text-red-700 dark:text-red-300">{error}</p>}
        
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard title="Ventas consolidadas" value={analytics ? `$${analytics.totalRevenue.toLocaleString()}` : '—'} variant="primary" />
          <StatCard title="Áreas reportadas" value={analytics ? String(analytics.regionalSales.length) : '—'} icon={TrendingUp} variant="default" />
          <StatCard title="Aprobaciones pendientes" value={String(approvals.length)} icon={FileCheck} onClick={() => navigate('/app/gerente/aprobaciones')} variant="default" />
          <StatCard title="Tendencias" value={analytics ? String(analytics.sixMonthTrend.length) : '—'} icon={TrendingUp} variant="default" />
        </div>
        
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-ink dark:text-white">Pendientes de aprobación</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchApprovals}
                  onChange={e => setSearchApprovals(e.target.value)}
                  placeholder="Buscar cliente o razón..."
                  className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-xl text-xs text-ink dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                />
              </div>
              <button type="button" onClick={() => navigate('/app/gerente/aprobaciones')} className="flex items-center gap-1 text-xs font-black uppercase text-brand-blue">
                Ver todas <ChevronRight size={14} />
              </button>
            </div>
          </div>
          {loading ? (
            [1, 2, 3].map(item => <Skeleton key={item} className="h-20 rounded-2xl" />)
          ) : approvals.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-surface-border dark:border-slate-800 p-8 text-center text-sm font-semibold text-ink-muted dark:text-slate-400">
              No hay aprobaciones pendientes en la base de datos.
            </div>
          ) : (
            approvals
              .filter(item => {
                const q = searchApprovals.trim().toLowerCase();
                return !q || item.customer.toLowerCase().includes(q) || item.reason.toLowerCase().includes(q);
              })
              .slice(0, 5).map(item => (
              <ListCard key={item.id} onClick={() => navigate('/app/gerente/aprobaciones')}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                      <Clock size={18} />
                    </span>
                    <div>
                      <p className="font-black text-ink dark:text-white">{item.customer}</p>
                      <p className="text-xs font-bold text-ink-muted dark:text-slate-400">{item.reason}</p>
                    </div>
                  </div>
                  <strong className="text-brand-blue">${item.amount.toLocaleString()}</strong>
                </div>
              </ListCard>
            ))
          )}
        </section>
      </div>
    </MobilePage>
  );
}
