export const API_ENDPOINTS = {
  productos: '/productos',
  pedidos: '/pedidos',
  clientes: '/clientes',
  cobros: '/cobros',
  cobrosPendientes: (customerId: string) => `/cobros/pending-invoices?customerId=${encodeURIComponent(customerId)}`,
} as const;
