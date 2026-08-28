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
  periodLabel: string; // ej. "Noviembre 2022", "Trimestre 1", "Anual 2022"
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

// Datos oficiales de las 5 divisiones según los artes de diseño de SAGRISA
const DEMO_DIVISIONS: DivisionGoal[] = [
  {
    id: 'div-agr',
    code: 'AGR',
    name: 'Agrícola',
    projection: 1000000.00,
    sales: 580000.00,
    pendingToSell: 420000.00,
    collections: 575000.00,
    pendingToCollect: 425000.00,
    percentage: 58,
  },
  {
    id: 'div-vet',
    code: 'VET',
    name: 'Veterinaria',
    projection: 1000000.00,
    sales: 575000.00,
    pendingToSell: 425000.00,
    collections: 580000.00,
    pendingToCollect: 420000.00,
    percentage: 57.5,
  },
  {
    id: 'div-ind',
    code: 'IND',
    name: 'Industrial y Servicios',
    projection: 1000000.00,
    sales: 650000.00,
    pendingToSell: 350000.00,
    collections: 610000.00,
    pendingToCollect: 390000.00,
    percentage: 65,
  },
  {
    id: 'div-pro',
    code: 'PRO',
    name: 'Proyectos',
    projection: 1000000.00,
    sales: 420000.00,
    pendingToSell: 580000.00,
    collections: 400000.00,
    pendingToCollect: 600000.00,
    percentage: 42,
  },
  {
    id: 'div-tal',
    code: 'TAL',
    name: 'Talleres',
    projection: 1000000.00,
    sales: 800000.00,
    pendingToSell: 200000.00,
    collections: 790000.00,
    pendingToCollect: 210000.00,
    percentage: 80,
  },
];

const DEMO_SELLERS: SellerPerformance[] = [
  {
    id: 'SEL-01',
    name: 'Luis Fernando Vázquez Rodríguez',
    code: 'GTCLUIS',
    sales: 580000.00,
    projection: 1000000.00,
    collections: 580000.00,
    percentage: 80,
    division: 'Agrícola',
  },
  {
    id: 'SEL-02',
    name: 'Marcos Antonio Gutiérrez',
    code: 'GTCMARCOS',
    sales: 520000.00,
    projection: 750000.00,
    collections: 490000.00,
    percentage: 69.3,
    division: 'Veterinaria',
  },
  {
    id: 'SEL-03',
    name: 'Juan Carlos Pérez',
    code: 'GTJUAN',
    sales: 450000.00,
    projection: 600000.00,
    collections: 430000.00,
    percentage: 75,
    division: 'Industrial y Servicios',
  },
  {
    id: 'SEL-04',
    name: 'Michelle Alvarado',
    code: 'GTCMICH',
    sales: 610000.00,
    projection: 700000.00,
    collections: 590000.00,
    percentage: 87.1,
    division: 'Proyectos',
  },
];

export const goalsService = {
  async getGoals(scope?: string): Promise<GoalItem[]> {
    try {
      const query = scope ? `?scope=${encodeURIComponent(scope)}` : '';
      const response = await fetchApi<unknown>(`/goals${query}`);
      if (Array.isArray(response) && response.length > 0) {
        return response as GoalItem[];
      }
    } catch {
      // Fallback
    }

    // Retornar metas por división
    return DEMO_DIVISIONS.map(d => ({
      id: d.id,
      title: `${d.name} (${d.code})`,
      current: d.sales,
      target: d.projection,
      unit: 'USD',
      owner: 'División Comercial',
      status: d.percentage >= 70 ? 'on_track' : 'needs_attention',
    }));
  },

  async getPeriodGoalData(
    periodType: 'mensual' | 'trimestral' | 'anual',
    periodValue: string = 'Noviembre'
  ): Promise<PeriodGoalData> {
    const totalProj = DEMO_DIVISIONS.reduce((sum, d) => sum + d.projection, 0);
    const totalSales = DEMO_DIVISIONS.reduce((sum, d) => sum + d.sales, 0);
    const totalPendingToSell = totalProj - totalSales;
    const totalColl = DEMO_DIVISIONS.reduce((sum, d) => sum + d.collections, 0);
    const totalPendingToCollect = totalProj - totalColl;
    const progress = Math.round((totalSales / totalProj) * 100);

    return {
      periodType,
      periodLabel: `${periodValue} 2022`,
      totalProjection: totalProj,
      totalSales: totalSales,
      totalPendingToSell: totalPendingToSell,
      totalCollections: totalColl,
      totalPendingToCollect: totalPendingToCollect,
      progressPercentage: progress,
      divisions: DEMO_DIVISIONS,
      sellers: DEMO_SELLERS,
    };
  },
};
