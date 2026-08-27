import { fetchApi } from '../../../core/api/api.config';

export interface CarteraSummary { totalDebt: number; current: number; overdue30: number; overdue60: number; overdue90: number; }
export interface OverdueInvoice { id: string; number: string; customerName: string; amount: number; daysOverdue: number; status: 'warning' | 'critical'; }

interface BackendAgingItem { range?: string; amount?: number; }
interface BackendAccountSummary { totalDebt?: number; aging?: BackendAgingItem[]; }

function mapSummary(data: BackendAccountSummary): CarteraSummary {
  const aging = data.aging ?? [];
  const amountFor = (range: string) => Number(aging.find(item => item.range?.trim().toLowerCase() === range.toLowerCase())?.amount) || 0;

  return {
    totalDebt: Number(data.totalDebt) || 0,
    // Azure returns the exact buckets: Actual, 1-30, 31-60 and +60 días.
    current: amountFor('Actual'),
    overdue30: amountFor('1-30 días'),
    overdue60: amountFor('31-60 días'),
    overdue90: amountFor('+60 días'),
  };
}

export const carteraService = {
  getSummary: async (): Promise<CarteraSummary> => mapSummary(await fetchApi<BackendAccountSummary>('/accounts/me/summary')),
  getOverdueInvoices: (): Promise<OverdueInvoice[]> => fetchApi<OverdueInvoice[]>('/accounts/me/overdue-invoices'),
};
