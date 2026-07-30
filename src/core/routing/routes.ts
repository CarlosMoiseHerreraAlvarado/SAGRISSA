export const APP_ROUTES = {
  config: '/app/config',
  cliente: {
    home: '/app/cliente/home',
    cartera: '/app/cliente/cartera',
    operaciones: '/app/cliente/operaciones',
    catalogo: '/app/cliente/catalogo',
    facturas: '/app/cliente/facturas',
  },
  vendedor: {
    home: '/app/vendedor/home',
    catalogo: '/app/catalogo',
    pedidos: '/app/pedidos',
    clientes: '/app/clientes',
    cobros: '/app/cobros',
    nuevoCobro: '/app/cobros/nuevo',
  },
} as const;
