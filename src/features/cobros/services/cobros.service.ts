import { fetchApi } from '../../../core/api/api.config';
import { trackEvent } from '../../../core/utils/appInsights';
import { API_ENDPOINTS } from '../../../core/api/endpoints';

export interface PendingInvoice {
  id: string;
  number: string;
  total: number;
  balance: number;
  date: string;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  paymentMethod: 'efectivo' | 'transferencia' | 'cheque';
  reference?: string;
  receiptFileName?: string;
  signatureDataUrl?: string;
  date: string;
  status: 'applied' | 'pending' | 'rejected';
  queuedOffline?: boolean;
}

export interface RegisterPaymentInput {
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  paymentMethod: PaymentRecord['paymentMethod'];
  reference: string;
  receiptFileName?: string;
  receiptContentBase64?: string;
  signatureDataUrl?: string;
}

export const cobrosService = {
  registerPayment: async (payment: RegisterPaymentInput): Promise<PaymentRecord> => {
    const response = await fetchApi<PaymentRecord & { _offlineQueued?: boolean }>(API_ENDPOINTS.cobros, {
      method: 'POST',
      body: JSON.stringify(payment),
    });
    if (response._offlineQueued) {
      trackEvent('collections.created.offline', { invoiceId: payment.invoiceId, amount: payment.amount });
      return { ...response, status: 'pending', queuedOffline: true };
    }
    trackEvent('collections.created', { invoiceId: payment.invoiceId, amount: payment.amount });
    return response;
  },

  getPaymentHistory: async (): Promise<PaymentRecord[]> => {
    try {
      return await fetchApi<PaymentRecord[]>(API_ENDPOINTS.cobros);
    } catch (caught) {
      console.warn('Endpoint /cobros no disponible aún en el backend; retornando historial vacío.', caught);
      return [];
    }
  },

  getPendingInvoices: async (customerId: string): Promise<PendingInvoice[]> => {
    try {
      return await fetchApi<PendingInvoice[]>(API_ENDPOINTS.cobrosPendientes(customerId));
    } catch (caught) {
      console.warn('Endpoint /cobros/pending-invoices no disponible aún en el backend.', caught);
      return [];
    }
  },
};
