export const API_ENDPOINTS = {
  // VITE_API_URL ya termina en /api en producción.
  productos: '/productos',
  pedidos: '/pedidos',
  clientes: '/clientes',
  cobros: '/cobros',
  cobrosPendientes: (customerId: string) => `/cobros/pending-invoices?customerId=${encodeURIComponent(customerId)}`,
} as const;
