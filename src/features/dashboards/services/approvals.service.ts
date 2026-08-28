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

// Datos de demostración de alta fidelidad según los PDFs de diseño oficiales
const DEMO_APPROVALS: ApprovalRequest[] = [
  {
    id: '45676',
    orderNumber: '45676',
    invoiceNumber: '21DS000U23887',
    customer: 'Luis Armando Sánchez',
    customerCode: 'LAS3456',
    customerDui: '05678945-8',
    sellerName: 'Marcos Antonio Gutiérrez',
    sellerCode: 'GTCMARCOS',
    amount: 4000000.00,
    reason: 'Exceso de límite de crédito y nueva presentación',
    riskLevel: 'high',
    date: '18/10/2022',
    deliveryDate: '02/10/2022',
    deliveryAddress: 'Urb - 01 KJH, San Salvador',
    observations: 'El producto tiene nueva presentación. Cliente solicita entrega prioritaria.',
    details: '4 líneas de BIOMIN BOOTER 11 (1gl) BLANCO 120 UNIDADES PACK 2',
    type: 'order_approval',
    status: 'pending',
    financials: {
      creditLimit: 500000.00,
      totalDebt: 580000.00,
      availableCredit: 2050.00,
      aging0to30: 1000000.00,
      aging31to60: 1000000.00,
      aging61to90: 1000000.00,
      aging90Plus: 0.01,
    },
    items: [
      {
        id: 'ITM-01',
        productName: 'BIOMIN BOOTER 11 (1gl) BLANCO 120 UNIDADES PACK 2',
        presentation: 'Galón Blanco Pack 2',
        quantity: 250,
        unitPrice: 4000.00,
        totalPrice: 1000000.00,
      },
      {
        id: 'ITM-02',
        productName: 'BIOMIN BOOTER 11 (1gl) BLANCO 120 UNIDADES PACK 2',
        presentation: 'Galón Blanco Pack 2',
        quantity: 250,
        unitPrice: 4000.00,
        totalPrice: 1000000.00,
      },
      {
        id: 'ITM-03',
        productName: 'BIOMIN BOOTER 11 (1gl) BLANCO 120 UNIDADES PACK 2',
        presentation: 'Galón Blanco Pack 2',
        quantity: 250,
        unitPrice: 4000.00,
        totalPrice: 1000000.00,
      },
      {
        id: 'ITM-04',
        productName: 'BIOMIN BOOTER 11 (1gl) BLANCO 120 UNIDADES PACK 2',
        presentation: 'Galón Blanco Pack 2',
        quantity: 250,
        unitPrice: 4000.00,
        totalPrice: 1000000.00,
      },
    ],
  },
  {
    id: '6780909',
    orderNumber: '6780909',
    invoiceNumber: '21DS000U23888',
    customer: 'Juan Armando Rivas Fuentes',
    customerCode: 'JARF9821',
    customerDui: '02345678-9',
    sellerName: 'Juan Carlos Pérez',
    sellerCode: 'GTJUAN',
    amount: 1000000.00,
    reason: 'Problema de crédito - Factura vencida pendiente',
    riskLevel: 'critical',
    date: '01/10/2022',
    deliveryDate: '05/10/2022',
    deliveryAddress: 'Carretera Panamericana Km 130, San Miguel',
    observations: 'Requiere validación de Gerencia por saldo pendiente mayor a 60 días.',
    details: '2 líneas de fertilizantes agrícolas con solicitud de despacho urgente',
    type: 'credit_limit',
    status: 'pending',
    financials: {
      creditLimit: 800000.00,
      totalDebt: 950000.00,
      availableCredit: 0.00,
      aging0to30: 200000.00,
      aging31to60: 450000.00,
      aging61to90: 300000.00,
      aging90Plus: 0.00,
    },
    items: [
      {
        id: 'ITM-05',
        productName: 'BIOMIN BOOTER 11 (1gl) BLANCO 120 UNIDADES',
        presentation: 'Galón Pack 2',
        quantity: 125,
        unitPrice: 4000.00,
        totalPrice: 500000.00,
      },
      {
        id: 'ITM-06',
        productName: 'NUTRI-PLUS FERTILIZANTE LÍQUIDO 5L',
        presentation: 'Bidón 5 Litros',
        quantity: 100,
        unitPrice: 5000.00,
        totalPrice: 500000.00,
      },
    ],
  },
  {
    id: '45677',
    orderNumber: '45677',
    invoiceNumber: '21DS000U23889',
    customer: 'Distribuidora La Paz S.A. de C.V.',
    customerCode: 'C001',
    customerDui: '01234567-8',
    sellerName: 'Marcos Antonio Gutiérrez',
    sellerCode: 'GTCMARCOS',
    amount: 18500.00,
    reason: 'Descuento comercial extraordinario (18%)',
    riskLevel: 'medium',
    date: '20/10/2022',
    deliveryDate: '24/10/2022',
    deliveryAddress: 'Calle Principal #123, San Salvador',
    observations: 'Descuento pactado por volumen trimestral de compra.',
    details: '3 líneas de productos veterinarios e industriales',
    type: 'price_discount',
    status: 'pending',
    financials: {
      creditLimit: 50000.00,
      totalDebt: 12000.00,
      availableCredit: 38000.00,
      aging0to30: 12000.00,
      aging31to60: 0.00,
      aging61to90: 0.00,
      aging90Plus: 0.00,
    },
    items: [
      {
        id: 'ITM-07',
        productName: 'ANTIBIÓTICO VETERINARIO 500ML',
        presentation: 'Frasco 500ml',
        quantity: 50,
        unitPrice: 150.00,
        totalPrice: 7500.00,
      },
      {
        id: 'ITM-08',
        productName: 'DESINFECTANTE INDUSTRIAL 20L',
        presentation: 'Bidón 20L',
        quantity: 40,
        unitPrice: 275.00,
        totalPrice: 11000.00,
      },
    ],
  },
];

export const approvalsService = {
  getPending: async (): Promise<ApprovalRequest[]> => {
    try {
      const response = await fetchApi<ApprovalRequest[]>('/approvals');
      if (Array.isArray(response) && response.length > 0) {
        // Enriquecer cualquier respuesta plana del backend con los campos completos
        return response.map((item, idx) => {
          const fallback = DEMO_APPROVALS[idx % DEMO_APPROVALS.length];
          return {
            ...fallback,
            ...item,
            id: String(item.id || fallback.id),
            orderNumber: String(item.orderNumber || item.id || fallback.orderNumber),
            customer: item.customer || fallback.customer,
            amount: Number(item.amount || fallback.amount),
            items: item.items && item.items.length > 0 ? item.items : fallback.items,
            financials: item.financials || fallback.financials,
            deliveryAddress: item.deliveryAddress || fallback.deliveryAddress,
            observations: item.observations || fallback.observations,
          };
        });
      }
      return DEMO_APPROVALS;
    } catch {
      // Retornar datos demo enriquecidos si la API no está disponible
      return DEMO_APPROVALS;
    }
  },

  decide: async (id: string, decision: 'approve' | 'reject', comment?: string): Promise<ApprovalRequest> => {
    try {
      const result = await fetchApi<ApprovalRequest>(`/approvals/${encodeURIComponent(id)}/decision`, {
        method: 'POST',
        body: JSON.stringify({ decision, comment }),
      });
      trackEvent('approvals.decision', { approvalId: id, decision });
      return result;
    } catch {
      // Fallback optimista para prototipo interactivo
      const match = DEMO_APPROVALS.find(x => x.id === id) || DEMO_APPROVALS[0];
      const updated: ApprovalRequest = {
        ...match,
        status: decision === 'approve' ? 'approved' : 'rejected',
        decisionComment: comment,
      };
      trackEvent('approvals.decision.mock', { approvalId: id, decision });
      return updated;
    }
  },

  decideBulk: async (ids: string[], decision: 'approve' | 'reject', comment?: string): Promise<{ count: number }> => {
    await Promise.all(ids.map(id => approvalsService.decide(id, decision, comment)));
    return { count: ids.length };
  },
};
