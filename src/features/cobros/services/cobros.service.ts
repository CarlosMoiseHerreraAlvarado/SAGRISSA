import { fetchApi } from '../../../core/api/api.config';
import { trackEvent } from '../../../core/utils/appInsights';

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
    const response = await fetchApi<PaymentRecord & { _offlineQueued?: boolean }>('/collections', {
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
    return fetchApi<PaymentRecord[]>('/collections');
  },

  getPendingInvoices: async (customerId: string): Promise<PendingInvoice[]> => {
    return fetchApi<PendingInvoice[]>(`/collections/pending-invoices?customerId=${encodeURIComponent(customerId)}`);
  },
};
