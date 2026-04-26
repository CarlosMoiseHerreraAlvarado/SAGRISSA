

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  paymentMethod: 'efectivo' | 'transferencia' | 'cheque';
  reference?: string;
  date: string;
  status: 'applied' | 'pending';
}

let MOCK_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    invoiceId: '2',
    invoiceNumber: 'FAC-99201-2',
    customerName: 'Luis Armando S.',
    amount: 245000,
    paymentMethod: 'transferencia',
    reference: 'TRF-990201',
    date: '2026-03-15T14:30:00Z',
    status: 'applied'
  }
];

export const cobrosService = {
  // Registrar un nuevo pago (abono o total)
  registerPayment: async (payment: Omit<PaymentRecord, 'id' | 'status' | 'date'>): Promise<PaymentRecord> => {
    await new Promise(r => setTimeout(r, 1200));
    const newPayment: PaymentRecord = {
      ...payment,
      id: `pay-${Math.random().toString(36).substr(2, 9)}`,
      status: 'applied',
      date: new Date().toISOString()
    };
    MOCK_PAYMENTS = [newPayment, ...MOCK_PAYMENTS];
    return newPayment;
  },

  // Obtener historial de pagos
  getPaymentHistory: async (): Promise<PaymentRecord[]> => {
    await new Promise(r => setTimeout(r, 800));
    return MOCK_PAYMENTS;
  },

  // Obtener facturas pendientes de un cliente para abonar
  getPendingInvoices: async (_customerId: string): Promise<any[]> => {
    await new Promise(r => setTimeout(r, 600));
    // Simulación de facturas con saldo
    return [
      { id: '1', number: 'FAC-99201-1', total: 580000, balance: 530000, date: '30 Abr, 2022' },
      { id: '5', number: 'FAC-99205', total: 120000, balance: 120000, date: '05 May, 2022' },
    ];
  }
};
