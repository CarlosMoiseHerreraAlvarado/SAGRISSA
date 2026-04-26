import { fetchApi } from '../../../core/api/api.config';

export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

export interface CreditNote {
  id: string;
  number: string;
  date: string;
  amount: number;
  reason: string;
}

export interface InvoiceDetail {
  id: string;
  number: string;
  orderNumber: string;
  date: string;
  dueDate: string;
  total: number;
  balance: number;
  status: 'pending' | 'paid' | 'overdue';
  customer: {
    name: string;
    id: string;
  };
  items: InvoiceItem[];
  creditNotes?: CreditNote[];
  delivery: {
    address: string;
    notes: string;
  };
}

const MOCK_INVOICE: InvoiceDetail = {
  id: '1',
  number: 'FAC-99201-1',
  orderNumber: '#45676',
  date: '30 Abr, 2022',
  dueDate: '30 May, 2022',
  total: 580000,
  balance: 530000,
  status: 'pending',
  customer: {
    name: 'Cliente SAGRISA',
    id: 'CLIENT-9920-A',
  },
  items: [
    { name: 'PRODUCTO INDUSTRIAL SAGRISA - PRESENTACIÓN 120 UNIDADES PACK ESPECIAL', quantity: 250, price: 2320 },
    { name: 'PRODUCTO INDUSTRIAL SAGRISA - PRESENTACIÓN 60 UNIDADES', quantity: 150, price: 1200 },
    { name: 'PRODUCTO INDUSTRIAL SAGRISA - PRESENTACIÓN 30 UNIDADES PACK BÁSICO', quantity: 100, price: 600 },
  ],
  creditNotes: [
    { id: 'nc1', number: 'NC-5020', date: '02 May, 2022', amount: 50000, reason: 'Descuento por pronto pago' }
  ],
  delivery: {
    address: 'Urb. Industrial - Bodega 01KJH, San Salvador.',
    notes: 'Presentación renovada. Entrega en horario matutino.',
  },
};

export async function downloadInvoicePdf(id: string): Promise<void> {
  console.log(`[PDF] Generando PDF para factura ${id}...`);
  await new Promise(r => setTimeout(r, 1500));
  // En producción: window.open(`${API_URL}/invoices/${id}/pdf`, '_blank');
  alert('Factura PDF generada y lista para descarga.');
}

export async function getFacturaById(id: string): Promise<InvoiceDetail> {
  try {
    return await fetchApi<InvoiceDetail>(`/invoices/${id}`);
  } catch (error) {
    console.warn(`[API] Fallback to mock data for invoice ${id}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...MOCK_INVOICE, id, number: `FAC-${id.padStart(5, '0')}-1` });
      }, 800);
    });
  }
}

export async function getInvoices(): Promise<any[]> {
  try {
    return await fetchApi<any[]>('/invoices');
  } catch (error) {
    console.warn('[API] Fallback to mock data for invoices list');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: '1', number: 'FAC-99201-1', date: '30 Abr, 2022', total: 580000, balance: 580000, status: 'pending' as const },
          { id: '2', number: 'FAC-99201-2', date: '15 Mar, 2022', total: 245000, balance: 0, status: 'paid' as const },
          { id: '3', number: 'FAC-99201-3', date: '28 Feb, 2022', total: 125000, balance: 0, status: 'paid' as const },
          { id: '4', number: 'FAC-99201-4', date: '10 Ene, 2022', total: 89000, balance: 0, status: 'paid' as const },
        ]);
      }, 600);
    });
  }
}

export const facturaService = {
  getFacturaById,
  getInvoices
};
