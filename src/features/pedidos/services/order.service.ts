import { fetchApi } from '../../../core/api/api.config';
import type { BackendPedidoEncabezado, BackendPedidoResponse, Order, OrderStatus } from '../../../types';
import { trackEvent } from '../../../core/utils/appInsights';
import { API_ENDPOINTS } from '../../../core/api/endpoints';

function mapEstatus(estatus: string): OrderStatus {
  const map: Record<string, OrderStatus> = {
    Activo: 'draft',
    Procesado: 'approved',
    Pendiente: 'pending_approval',
    Anulado: 'rejected',
    Facturado: 'fulfilled',
  };
  return map[estatus] ?? 'draft';
}

function mapPedidoEncabezado(pedido: BackendPedidoEncabezado): Order {
  return {
    id: pedido.numPedido,
    orderNumber: pedido.numPedido,
    customerId: pedido.codCliente,
    customerName: pedido.codCliente,
    dateCreated: pedido.fechaPedido,
    deliveryDate: pedido.fechaEntrega ?? '',
    deliveryAddress: '',
    observations: pedido.observacion,
    status: mapEstatus(pedido.estatus),
    items: [],
    totalAmount: pedido.totalPedido,
  };
}



function isOfflineQueued(value: Order & { _offlineQueued?: boolean }): value is Order & { _offlineQueued: true } {
  return value._offlineQueued === true;
}

export const orderService = {
  getMyOrders: async (): Promise<Order[]> => {
    try {
      const data = await fetchApi<BackendPedidoEncabezado[]>(API_ENDPOINTS.pedidos);
      return data.map(mapPedidoEncabezado);
    } catch (caught) {
      console.error('Error al obtener pedidos backend /pedidos:', caught);
      return [];
    }
  },

  getOrderById: async (id: string): Promise<Order> => {
    const data = await fetchApi<BackendPedidoResponse>(`${API_ENDPOINTS.pedidos}/${encodeURIComponent(id)}`);
    const base = mapPedidoEncabezado(data.encabezado);
    base.items = data.detalle.map(detail => ({
      productId: detail.codProducto,
      productName: detail.nomProducto,
      quantity: detail.cantidad,
      unitPrice: detail.precioUnitario,
      totalPrice: detail.precioTotal,
    }));
    return base;
  },

  createOrder: async (orderPayload: Partial<Order>): Promise<Order> => {
    const response = await fetchApi<Order & { _offlineQueued?: boolean }>(API_ENDPOINTS.pedidos, {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
    if (isOfflineQueued(response)) {
      trackEvent('orders.created.offline', { customerId: String(orderPayload.customerId ?? '') });
      return { ...orderPayload, id: `offline-${Date.now()}`, orderNumber: 'PENDIENTE', status: 'pending_approval', dateCreated: new Date().toISOString(), queuedOffline: true } as Order;
    }
    trackEvent('orders.created', { orderId: response.id });
    return response;
  },

  updateOrder: async (id: string, orderPayload: Partial<Order>): Promise<Order> => {
    const response = await fetchApi<Order & { _offlineQueued?: boolean }>(`${API_ENDPOINTS.pedidos}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(orderPayload),
    });
    if (isOfflineQueued(response)) {
      trackEvent('orders.updated.offline', { orderId: id });
      return { ...orderPayload, id, orderNumber: 'PENDIENTE', status: 'pending_approval', queuedOffline: true } as Order;
    }
    trackEvent('orders.updated', { orderId: id });
    return response;
  },
};
