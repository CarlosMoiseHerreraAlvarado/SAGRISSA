import { fetchApi } from '../../../core/api/api.config';
import { trackEvent } from '../../../core/utils/appInsights';

export interface ApprovalItem {
  id: string;
  productName: string;
  presentation: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ApprovalFinancials {
  creditLimit: number;
  totalDebt: number;
  availableCredit: number;
  aging0to30: number;
  aging31to60: number;
  aging61to90: number;
  aging90Plus: number;
}

export interface ApprovalRequest {
  id: string;
  orderNumber: string;
  invoiceNumber?: string;
  customer: string;
  customerCode: string;
  customerDui?: string;
  sellerName: string;
  sellerCode?: string;
  amount: number;
  reason: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  deliveryDate: string;
  deliveryAddress: string;
  observations: string;
  details: string;
  items: ApprovalItem[];
  financials: ApprovalFinancials;
  type: 'credit_limit' | 'order_approval' | 'price_discount';
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  decisionComment?: string;
}

export const approvalsService = {
  getPending: async (): Promise<ApprovalRequest[]> => {
    const response = await fetchApi<ApprovalRequest[]>('/approvals');
    if (Array.isArray(response)) {
      return response.map(item => ({
        id: String(item.id || item.orderNumber || ''),
        orderNumber: String(item.orderNumber || item.id || ''),
        invoiceNumber: item.invoiceNumber || `21DS000U${item.orderNumber || item.id}`,
        customer: item.customer || item.customerCode || 'Cliente SAGRISA',
        customerCode: item.customerCode || item.customer || 'C001',
        customerDui: item.customerDui || 'N/A',
        sellerName: item.sellerName || 'Vendedor Asignado',
        sellerCode: item.sellerCode,
        amount: Number(item.amount || 0),
        reason: item.reason || 'Pedido pendiente de aprobación',
        riskLevel: item.riskLevel || (item.amount > 10000 ? 'high' : 'medium'),
        date: item.date || new Date().toLocaleDateString('es-SV'),
        deliveryDate: item.deliveryDate || new Date().toLocaleDateString('es-SV'),
        deliveryAddress: item.deliveryAddress || 'Dirección de entrega registrada',
        observations: item.observations || '',
        details: item.details || '',
        items: Array.isArray(item.items) ? item.items : [],
        financials: item.financials || {
          creditLimit: 0,
          totalDebt: 0,
          availableCredit: 0,
          aging0to30: 0,
          aging31to60: 0,
          aging61to90: 0,
          aging90Plus: 0,
        },
        type: item.type || 'order_approval',
        status: item.status || 'pending',
        decisionComment: item.decisionComment,
      }));
    }
    return [];
  },

  decide: async (id: string, decision: 'approve' | 'reject', comment?: string): Promise<ApprovalRequest> => {
    const result = await fetchApi<ApprovalRequest>(`/approvals/${encodeURIComponent(id)}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision, comment }),
    });
    trackEvent('approvals.decision', { approvalId: id, decision });
    return result;
  },

  decideBulk: async (ids: string[], decision: 'approve' | 'reject', comment?: string): Promise<{ count: number }> => {
    await Promise.all(ids.map(id => approvalsService.decide(id, decision, comment)));
    return { count: ids.length };
  },
};
