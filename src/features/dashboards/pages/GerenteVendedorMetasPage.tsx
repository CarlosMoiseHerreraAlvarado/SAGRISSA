import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Loader2 } from 'lucide-react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { goalsService, type DivisionGoal, type SellerPerformance } from '../services/goals.service';

const DIVISION_KEYS = ['AGR', 'IND', 'PRO', 'VET', 'TAL'] as const;
type DivisionCode = typeof DIVISION_KEYS[number];

interface PeriodBlock {
  key: string;
  title: string;
  type: 'mensual' | 'trimestral';
  value: string;
  divisions: DivisionGoal[];
  totalProjection: number;
  totalSales: number;
}

export default function GerenteVendedorMetasPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<SellerPerformance | null>(null);
  const [periods, setPeriods] = useState<PeriodBlock[]>([]);
  const [selectedView, setSelectedView] = useState<'all' | 'mes' | 'T1' | 'T2' | 'T3' | 'T4'>('all');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const currentMonth = new Intl.DateTimeFormat('es-SV', { month: 'long' }).format(new Date());
        const currentMonthLabel = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

        // Fetch team to get seller name/info
        const teamData = await goalsService.getPeriodGoalData('mensual', currentMonthLabel, id);
        const currentSeller = teamData.sellers.find(s => s.id === id || s.code === id) || {
          id: id || '0',
          name: id?.startsWith('SV') || id?.startsWith('GT') ? `Vendedor ${id}` : 'Vendedor Comercial',
          code: id || 'TEST-VEND-001',
          sales: teamData.sellers[0]?.sales || 0,
          projection: 0,
          collections: 0,
          percentage: teamData.sellers[0]?.percentage || 0,
          division: teamData.sellers[0]?.division || 'División Comercial'
        };

        if (isMounted) setSeller(currentSeller);

        // Fetch all 5 required periods
        const [mesData, t1Data, t2Data, t3Data, t4Data] = await Promise.all([
          goalsService.getPeriodGoalData('mensual', currentMonthLabel, id),
          goalsService.getPeriodGoalData('trimestral', 'T1', id),
          goalsService.getPeriodGoalData('trimestral', 'T2', id),
          goalsService.getPeriodGoalData('trimestral', 'T3', id),
          goalsService.getPeriodGoalData('trimestral', 'T4', id),
        ]);

        const buildBlock = (key: string, title: string, type: 'mensual' | 'trimestral', val: string, res: typeof mesData): PeriodBlock => {
          // Asegurar que siempre existan las 5 divisiones del Word (AGR, IND, PRO, VET, TAL)
          const divMap = new Map(res.divisions.map(d => [d.code.toUpperCase(), d]));
          const normalizedDivs: DivisionGoal[] = DIVISION_KEYS.map((code: DivisionCode): DivisionGoal => {
            const existing = divMap.get(code);
            if (existing) return { ...existing, code };
            // Presupuesto base si no existe registro
            const defaultTarget = (code === 'AGR' || code === 'VET') ? 45000 : 0;
            return {
              id: `div-${code.toLowerCase()}`,
              code,
              name: code === 'AGR' ? 'Agrícola' : code === 'VET' ? 'Veterinaria' : code === 'IND' ? 'Industrial' : code === 'PRO' ? 'Proyectos' : 'Talleres',
              projection: defaultTarget,
              sales: 0,
              pendingToSell: defaultTarget,
              collections: 0,
              pendingToCollect: defaultTarget,
              percentage: 0
            };
          });

          const totalProjection = normalizedDivs.reduce((acc, d) => acc + d.projection, 0);
          const totalSales = normalizedDivs.reduce((acc, d) => acc + d.sales, 0);

          return {
            key,
            title,
            type,
            value: val,
            divisions: normalizedDivs,
            totalProjection,
            totalSales
          };
        };

        const loadedPeriods: PeriodBlock[] = [
          buildBlock('mes', `MES ACTUAL (${currentMonthLabel.toUpperCase()})`, 'mensual', currentMonthLabel, mesData),
          buildBlock('T1', 'TRIMESTRE 1', 'trimestral', 'T1', t1Data),
          buildBlock('T2', 'TRIMESTRE 2', 'trimestral', 'T2', t2Data),
          buildBlock('T3', 'TRIMESTRE 3', 'trimestral', 'T3', t3Data),
          buildBlock('T4', 'TRIMESTRE 4', 'trimestral', 'T4', t4Data),
        ];

        if (isMounted) setPeriods(loadedPeriods);
      } catch (err) {
        console.error('Error cargando metas del vendedor:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadData();
    return () => { isMounted = false; };
  }, [id]);

  const visiblePeriods = selectedView === 'all' 
    ? periods 
    : periods.filter(p => p.key === selectedView);

  return (
    <MobilePage>
      {/* Top Header */}
      <header className="px-6 md:px-0 pt-10 md:pt-0 pb-6 flex items-center justify-between gap-4 z-10 relative">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/app/gerente/metas')}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 text-ink dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
            title="Volver a Metas"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-ink dark:text-white tracking-tight">
              Detalle Metas
            </h1>
            <p className="text-[11px] font-black uppercase tracking-widest text-brand-blue">
              Desempeño Individual por División
            </p>
          </div>
        </div>
      </header>

      {/* Seller Header Info Card (Matching Word Screenshot literal b) */}
      <div className="px-6 md:px-0 pb-6">
        <div className="bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-3xl p-6 shadow-card dark:shadow-card-dark flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-black text-xl shadow-inner">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-ink dark:text-white">
                {seller?.name || 'Vendedor Comercial'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-brand-blue/10 text-brand-blue uppercase">
                  {seller?.code || id}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  {seller?.division || 'Ventas'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-surface-border dark:border-slate-800 pt-4 sm:pt-0 sm:pl-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Ventas Logradas</span>
              <span className="text-lg font-black text-emerald-600">
                ${seller?.sales.toLocaleString() || '0'}
              </span>
            </div>
            <div className="border-l border-surface-border dark:border-slate-800 pl-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Cumplimiento</span>
              <span className="text-lg font-black text-brand-blue">
                {seller?.percentage || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div className="px-6 md:px-0 pb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            type="button"
            onClick={() => setSelectedView('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              selectedView === 'all'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 text-ink-muted dark:text-slate-400 hover:text-ink'
            }`}
          >
            Todos los Periodos
          </button>
          {periods.map(p => (
            <button
              key={p.key}
              type="button"
              onClick={() => setSelectedView(p.key as typeof selectedView)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedView === p.key
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 text-ink-muted dark:text-slate-400 hover:text-ink'
              }`}
            >
              {p.key === 'mes' ? 'Mes Actual' : p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 md:px-0 pb-24 space-y-8">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-brand-blue" size={32} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Cargando metas y desempeño...
            </p>
          </div>
        ) : (
          visiblePeriods.map(period => {
            // Calcular máximo para escalar las barras de forma visual
            const maxVal = Math.max(
              ...period.divisions.map(d => Math.max(d.projection, d.sales)),
              1000
            );

            return (
              <div
                key={period.key}
                className="bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-3xl p-6 shadow-card dark:shadow-card-dark space-y-6"
              >
                {/* Period Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border dark:border-slate-800 gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-brand-blue" />
                    <h3 className="text-base font-black uppercase tracking-wider text-ink dark:text-white">
                      {period.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                    <span>Meta: <strong className="text-ink dark:text-white font-black">${period.totalProjection.toLocaleString()}</strong></span>
                    <span>Vendido: <strong className="text-emerald-600 font-black">${period.totalSales.toLocaleString()}</strong></span>
                  </div>
                </div>

                {/* Tabla de Presupuesto (Exacta como se solicita en el Word) */}
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    PRESUPUESTO POR ÁREA
                  </h4>
                  <div className="overflow-x-auto rounded-2xl border border-surface-border dark:border-slate-800 bg-surface-soft/50 dark:bg-slate-800/50">
                    <table className="w-full text-center text-xs">
                      <thead>
                        <tr className="border-b border-surface-border dark:border-slate-800 text-ink-muted dark:text-slate-400 text-[10px] font-black tracking-wider uppercase">
                          {period.divisions.map(d => (
                            <th key={d.code} className="py-2.5 px-3">
                              {d.code}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="font-black text-ink dark:text-white">
                          {period.divisions.map(d => (
                            <td key={d.code} className="py-3 px-3">
                              ${d.projection.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Gráfico de Barras: Vendido vs Diferencia (como en las capturas de pantalla) */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      COMPARATIVA DE AVANCE (VENDIDO VS DIFERENCIA)
                    </h4>
                    {/* Leyenda */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-sky-500 inline-block" />
                        <span className="text-ink dark:text-slate-300 font-bold">Vendido</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
                        <span className="text-ink dark:text-slate-300 font-bold">Diferencia</span>
                      </div>
                    </div>
                  </div>

                  {/* Barras verticales estilo gráfico móvil */}
                  <div className="h-64 pt-6 pb-2 px-4 rounded-2xl bg-surface-soft/30 dark:bg-slate-800/30 border border-surface-border dark:border-slate-800/60 flex items-end justify-around gap-4">
                    {period.divisions.map(d => {
                      const soldHeight = (d.sales / maxVal) * 100;
                      const diff = Math.max(0, d.projection - d.sales);
                      const diffHeight = (diff / maxVal) * 100;

                      return (
                        <div key={d.code} className="flex-1 max-w-[70px] h-full flex flex-col justify-end items-center group relative">
                          {/* Tooltip / Badge flotante con el valor vendido */}
                          {d.sales > 0 && (
                            <div className="mb-1 px-1.5 py-0.5 rounded bg-ink text-white dark:bg-white dark:text-ink text-[10px] font-black shadow-sm">
                              ${d.sales.toLocaleString()}
                            </div>
                          )}

                          {/* Barra apilada */}
                          <div className="w-full flex flex-col justify-end rounded-t-lg overflow-hidden h-44 bg-slate-200/50 dark:bg-slate-700/30">
                            {/* Parte superior naranja (Diferencia) */}
                            {diff > 0 && (
                              <div
                                style={{ height: `${Math.max(4, diffHeight)}%` }}
                                className="w-full bg-amber-500 hover:bg-amber-400 transition-all flex items-center justify-center"
                                title={`Diferencia: $${diff.toLocaleString()}`}
                              />
                            )}
                            {/* Parte inferior azul (Vendido) */}
                            {d.sales > 0 && (
                              <div
                                style={{ height: `${Math.max(4, soldHeight)}%` }}
                                className="w-full bg-sky-500 hover:bg-sky-400 transition-all flex items-center justify-center"
                                title={`Vendido: $${d.sales.toLocaleString()}`}
                              />
                            )}
                          </div>

                          {/* Etiqueta del Eje X */}
                          <div className="mt-2 text-center">
                            <span className="text-xs font-black uppercase text-ink dark:text-white block">
                              {d.code}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold block">
                              {d.projection > 0 ? `${Math.round((d.sales / d.projection) * 100)}%` : '0%'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </MobilePage>
  );
}
