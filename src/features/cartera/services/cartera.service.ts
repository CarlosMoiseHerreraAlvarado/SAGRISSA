export interface CarteraSummary {
  totalDebt: number;
  current: number; // 0-30 days
  overdue30: number; // 31-60 days
  overdue60: number; // 61-90 days
  overdue90: number; // +91 days
}

export interface OverdueInvoice {
  id: string;
  number: string;
  customerName: string;
  amount: number;
  daysOverdue: number;
  status: 'warning' | 'critical';
}

export const carteraService = {
  getSummary: async (): Promise<CarteraSummary> => {
    await new Promise(r => setTimeout(r, 800));
    return {
      totalDebt: 12450.00,
      current: 8600.00,
      overdue30: 2200.00,
      overdue60: 1200.00,
      overdue90: 450.00
    };
  },

  getOverdueInvoices: async (): Promise<OverdueInvoice[]> => {
    await new Promise(r => setTimeout(r, 600));
    return [
      { id: '1', number: 'FAC-2024-001', customerName: 'Agropecuaria El Sol', amount: 1200.00, daysOverdue: 45, status: 'critical' },
      { id: '2', number: 'FAC-2024-015', customerName: 'Distribuidora X', amount: 450.00, daysOverdue: 92, status: 'critical' },
      { id: '3', number: 'FAC-2024-088', customerName: 'Finca Las Marías', amount: 2200.00, daysOverdue: 15, status: 'warning' },
    ];
  }
};
