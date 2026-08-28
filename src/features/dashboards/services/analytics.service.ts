import { fetchApi } from '../../../core/api/api.config';

export interface RegionalSales { region: string; amount: number; orders: number; }
export interface TrendData { period: string; value: number; orders: number; invoiced: number; collected: number; }
export interface ProductMix { category: string; quantity: number; percentage: number; }
export interface BusinessAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalInvoiced: number;
  totalCollected: number;
  outstandingBalance: number;
  regionalSales: RegionalSales[];
  sixMonthTrend: TrendData[];
  productMix: ProductMix[];
  globalInsight: string;
}

export function getBusinessAnalytics(): Promise<BusinessAnalytics> {
  return fetchApi<BusinessAnalytics>('/analytics');
}
