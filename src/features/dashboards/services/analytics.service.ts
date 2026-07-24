import { fetchApi } from '../../../core/api/api.config';

export interface RegionalSales { region: string; amount: number; }
export interface TrendData { period: string; value: number; }
export interface ProductMix { category: string; percentage: number; }
export interface BusinessAnalytics {
  totalRevenue: number;
  regionalSales: RegionalSales[];
  sixMonthTrend: TrendData[];
  productMix: ProductMix[];
  globalInsight: string;
}

export function getBusinessAnalytics(): Promise<BusinessAnalytics> {
  return fetchApi<BusinessAnalytics>('/analytics');
}
