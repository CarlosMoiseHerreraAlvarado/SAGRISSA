import { fetchApi } from '../../../core/api/api.config';
import type {
  Order,
  OrderStatus,
  BackendPedidoEncabezado,
  BackendPedidoResponse,
} from '../../../types';

/**
 * Mapea el estatus del backend al OrderStatus del frontend.
 */
function mapEstatus(estatus: string): OrderStatus {
  const map: Record<string, OrderStatus> = {
    'Activo': 'draft',
    'Procesado': 'approved',
    'Pendiente': 'pending_approval',
    'Anulado': 'rejected',
    'Facturado': 'fulfilled',
  };
  return map[estatus] ?? 'draft';
}

/**
 * Mapea un PedidoEncabezadoDto del backend al Order del frontend.
 */
function mapPedidoEncabezado(p: BackendPedidoEncabezado): Order {
  return {
    id: p.numPedido,
    orderNumber: p.numPedido,
    customerId: p.codCliente,
    customerName: p.codCliente,
    dateCreated: p.fechaPedido,
    deliveryDate: p.fechaEntrega ?? '',
    deliveryAddress: '',
    observations: p.observacion,
    status: mapEstatus(p.estatus),
    items: [],
    totalAmount: p.totalPedido,
  };
}

/**
 * Servicio de Pedidos.
 * Conecta a GET /api/pedidos y GET /api/pedidos/{numero} del backend ASP.NET Core.
 */
export const orderService = {
  // Listar todos los pedidos
  getMyOrders: async (): Promise<Order[]> => {
    const data = await fetchApi<BackendPedidoEncabezado[]>('/api/pedidos');
    return data.map(mapPedidoEncabezado);
  },

  // Obtener un pedido por numero con su detalle completo
  getOrderById: async (id: string): Promise<Order> => {
    const data = await fetchApi<BackendPedidoResponse>(`/api/pedidos/${id}`);
    const base = mapPedidoEncabezado(data.encabezado);
    base.items = data.detalle.map((d) => ({
      productId: d.codProducto,
      productName: d.nomProducto,
      quantity: d.cantidad,
      unitPrice: d.precioUnitario,
      totalPrice: d.precioTotal,
    }));
    return base;
  },

  // POST /api/pedidos — aun no existe en el backend, mantener mock
  createOrder: async (orderPayload: Partial<Order>): Promise<Order> => {
    await new Promise((r) => setTimeout(r, 1200));
    return {
      ...orderPayload,
      id: `ord_${Math.random().toString(36).substring(7)}`,
      orderNumber: `5000U${Math.floor(Math.random() * 90000) + 10000}`,
      status: 'draft',
      dateCreated: new Date().toISOString(),
    } as Order;
  },

  // PUT /api/pedidos/{id} — aun no existe en el backend, mantener mock
  updateOrder: async (id: string, orderPayload: Partial<Order>): Promise<Order> => {
    await new Promise((r) => setTimeout(r, 1200));
    return {
      ...orderPayload,
      id,
      status: 'draft',
    } as Order;
  },
};
