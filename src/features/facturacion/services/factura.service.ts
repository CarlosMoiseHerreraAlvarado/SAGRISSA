import { downloadApiFile, fetchApi } from '../../../core/api/api.config';

export interface InvoiceItem { name: string; quantity: number; price: number; }
export interface CreditNote { id: string; number: string; date: string; amount: number; reason: string; }
export type InvoiceStatus = 'pending' | 'paid' | 'overdue';
export interface InvoiceSummary { id: string; number: string; date: string; total: number; balance: number; status: InvoiceStatus; }
export interface InvoiceDetail extends InvoiceSummary {
  orderNumber: string;
  dueDate: string;
  customer: { name: string; id: string };
  items: InvoiceItem[];
  creditNotes?: CreditNote[];
  delivery: { address: string; notes: string };
}

export function downloadInvoicePdf(id: string): Promise<void> {
  return downloadApiFile(`/invoices/${encodeURIComponent(id)}/pdf`, `SAGRISA_factura_${id}.pdf`);
}

export function getFacturaById(id: string): Promise<InvoiceDetail> {
  return fetchApi<InvoiceDetail>(`/invoices/${encodeURIComponent(id)}`);
}

export function getInvoices(): Promise<InvoiceSummary[]> {
  return fetchApi<InvoiceSummary[]>('/invoices');
}

export const facturaService = { getFacturaById, getInvoices };
