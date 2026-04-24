import { fetchApi } from '../../../core/api/api.config';

export interface RegionalSales {
  region: string;
  amount: number;
}

export interface TrendData {
  period: string;
  value: number;
}

export interface ProductMix {
  category: string;
  percentage: number;
}

export interface BusinessAnalytics {
  totalRevenue: number;
  regionalSales: RegionalSales[];
  sixMonthTrend: TrendData[];
  productMix: ProductMix[];
  globalInsight: string;
}

const MOCK_ANALYTICS: BusinessAnalytics = {
  totalRevenue: 4800000,
  regionalSales: [
    { region: 'Zona Centro', amount: 2400000 },
    { region: 'Zona Occidente', amount: 1100000 },
    { region: 'Zona Oriente', amount: 1300000 },
  ],
  sixMonthTrend: [
    { period: 'Ene', value: 650000 },
    { period: 'Feb', value: 720000 },
    { period: 'Mar', value: 810000 },
    { period: 'Abr', value: 950000 },
    { period: 'May', value: 820000 },
    { period: 'Jun', value: 850000 },
  ],
  productMix: [
    { category: 'Fertilizantes', percentage: 45 },
    { category: 'Herbicidas', percentage: 30 },
    { category: 'Semillas', percentage: 15 },
    { category: 'Otros', percentage: 10 },
  ],
  globalInsight: "El crecimiento en la Zona Oriental está impulsado principalmente por la nueva línea de fertilizantes foliares, compensando la baja estacional en productos de consumo masivo. Se proyecta un cierre de trimestre un 12% por encima de la meta.",
};

export async function getBusinessAnalytics(): Promise<BusinessAnalytics> {
  try {
    const response = await fetchApi<BusinessAnalytics>('/analytics/executive');
    return response;
  } catch (error) {
    console.warn('[API] Fallback to mock data for business analytics');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_ANALYTICS);
      }, 800);
    });
  }
}
