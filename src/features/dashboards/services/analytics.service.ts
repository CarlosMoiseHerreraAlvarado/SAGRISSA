import { fetchApi } from '../../../core/api/api.config';

export interface RegionalSales { region: string; amount: number; orders: number; }
export interface TrendData { period: string; value: number; orders: number; invoiced: number; collected: number; }
export interface ProductMix { category: string; quantity: number; percentage: number; }
export interface TopClientItem {
  code: string;
  name: string;
  country: string;
  clientClass?: string;
  totalAmount: number;
}

export interface RegionalCollectionItem {
  country: string;
  totalAmount: number;
  percentage: number;
  count?: number;
}

export interface ArticleClassItem {
  className: string;
  percentage: number;
  quantity?: number;
  amount?: number;
}

export interface BudgetComparisonItem {
  name: string;
  budget: number;
  actual: number;
  percentage: number;
}

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
  topClients?: TopClientItem[];
  regionalCollections?: RegionalCollectionItem[];
  articleClasses?: ArticleClassItem[];
  budgetByCountry?: BudgetComparisonItem[];
  budgetByArea?: BudgetComparisonItem[];
}

export function getBusinessAnalytics(area?: string): Promise<BusinessAnalytics> {
  const query = area ? `?area=${encodeURIComponent(area)}` : '';
  return fetchApi<BusinessAnalytics>(`/analytics${query}`);
}
