import { fetchApi } from '../../../core/api/api.config';

export interface CarteraSummary { totalDebt: number; current: number; overdue30: number; overdue60: number; overdue90: number; }
export interface OverdueInvoice { id: string; number: string; customerName: string; amount: number; daysOverdue: number; status: 'warning' | 'critical'; }

export const carteraService = {
  getSummary: (): Promise<CarteraSummary> => fetchApi<CarteraSummary>('/accounts/me/summary'),
  getOverdueInvoices: (): Promise<OverdueInvoice[]> => fetchApi<OverdueInvoice[]>('/accounts/me/overdue-invoices'),
};
