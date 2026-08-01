export const API_ENDPOINTS = {
  productos: '/api/v1/catalog/products',
  pedidos: '/api/v1/orders',
  clientes: '/clientes',
  cobros: '/cobros',
  cobrosPendientes: (customerId: string) => `/cobros/pending-invoices?customerId=${encodeURIComponent(customerId)}`,
} as const;
