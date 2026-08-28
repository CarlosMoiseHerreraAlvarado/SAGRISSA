import { fetchApi } from '../../../core/api/api.config';

export interface DivisionGoal {
  id: string;
  code: 'AGR' | 'VET' | 'IND' | 'PRO' | 'TAL';
  name: string;
  projection: number;   // Presupuesto / Meta
  sales: number;        // Ventas alcanzadas
  pendingToSell: number;// Por vender
  collections: number;  // Cobros alcanzados
  pendingToCollect: number; // Por cobrar
  percentage: number;
}

export interface SellerPerformance {
  id: string;
  name: string;
  code: string;
  avatar?: string;
  sales: number;
  projection: number;
  collections: number;
  percentage: number;
  division: string;
}

export interface PeriodGoalData {
  periodType: 'mensual' | 'trimestral' | 'anual';
  periodLabel: string;
  totalProjection: number;
  totalSales: number;
  totalPendingToSell: number;
  totalCollections: number;
  totalPendingToCollect: number;
  progressPercentage: number;
  divisions: DivisionGoal[];
  sellers: SellerPerformance[];
}

export interface GoalItem {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  owner?: string;
  status?: string;
}

interface BackendDivisionResponse {
  id: string;
  title: string;
  code: 'AGR' | 'VET' | 'IND' | 'PRO' | 'TAL';
  name: string;
  projection: number;
  sales: number;
  pendingToSell: number;
  collections: number;
  percentage: number;
  current: number;
  target: number;
}

interface BackendTeamResponse {
  id: string;
  name: string;
  role: string;
  monthlySales: number;
  performance: number;
  region: string;
}

export const goalsService = {
  async getGoals(scope?: string): Promise<GoalItem[]> {
    const query = scope ? `?scope=${encodeURIComponent(scope)}` : '';
    const response = await fetchApi<BackendDivisionResponse[] | { data: BackendDivisionResponse[] }>(`/goals${query}`);
    const items = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : [];
    
    return items.map(d => ({
      id: d.id,
      title: d.title || `${d.name} (${d.code})`,
      current: Number(d.current ?? d.sales ?? 0),
      target: Number(d.target ?? d.projection ?? 0),
      unit: 'USD',
      owner: 'División Comercial',
      status: d.percentage >= 70 ? 'on_track' : 'needs_attention',
    }));
  },

  async getPeriodGoalData(
    periodType: 'mensual' | 'trimestral' | 'anual',
    periodValue: string = 'Noviembre'
  ): Promise<PeriodGoalData> {
    const [goalsRes, teamRes] = await Promise.all([
      fetchApi<BackendDivisionResponse[] | { data: BackendDivisionResponse[] }>('/goals').catch(() => []),
      fetchApi<BackendTeamResponse[] | { data: BackendTeamResponse[] }>('/team').catch(() => [])
    ]);

    const rawDivisions = Array.isArray(goalsRes) ? goalsRes : Array.isArray(goalsRes?.data) ? goalsRes.data : [];
    const rawTeam = Array.isArray(teamRes) ? teamRes : Array.isArray(teamRes?.data) ? teamRes.data : [];

    const divisions: DivisionGoal[] = rawDivisions.map(d => {
      const proj = Number(d.projection || d.target || 0);
      const sales = Number(d.sales || d.current || 0);
      const coll = Number(d.collections || 0);
      return {
        id: d.id || `div-${d.code?.toLowerCase() || 'gen'}`,
        code: d.code || 'AGR',
        name: d.name || 'División Comercial',
        projection: proj,
        sales: sales,
        pendingToSell: Math.max(0, proj - sales),
        collections: coll,
        pendingToCollect: Math.max(0, proj - coll),
        percentage: proj > 0 ? Math.round((sales / proj) * 100) : 0,
      };
    });

    const sellers: SellerPerformance[] = rawTeam.map((t, idx) => ({
      id: t.id || `sel-${idx}`,
      name: t.name || 'Vendedor Comercial',
      code: `VEND-${idx + 1}`,
      sales: Number(t.monthlySales || 0),
      projection: 10000.00,
      collections: Number(t.monthlySales || 0) * 0.95,
      percentage: Number(t.performance || 0),
      division: 'Comercial',
    }));

    const totalProj = divisions.reduce((sum, d) => sum + d.projection, 0);
    const totalSales = divisions.reduce((sum, d) => sum + d.sales, 0);
    const totalPendingToSell = totalProj - totalSales;
    const totalColl = divisions.reduce((sum, d) => sum + d.collections, 0);
    const totalPendingToCollect = totalProj - totalColl;
    const progress = totalProj > 0 ? Math.round((totalSales / totalProj) * 100) : 0;

    return {
      periodType,
      periodLabel: `${periodValue} 2022`,
      totalProjection: totalProj,
      totalSales: totalSales,
      totalPendingToSell: totalPendingToSell,
      totalCollections: totalColl,
      totalPendingToCollect: totalPendingToCollect,
      progressPercentage: progress,
      divisions,
      sellers,
    };
  },
};
