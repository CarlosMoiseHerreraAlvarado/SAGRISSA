import { fetchApi } from '../../../core/api/api.config';
import type { BackendPedidoEncabezado, BackendPedidoResponse, Order, OrderStatus } from '../../../types';
import { trackEvent } from '../../../core/utils/appInsights';
import { API_ENDPOINTS } from '../../../core/api/endpoints';

type PagedApiResponse<T> = { items?: T[] };
type OrderInput = Partial<Order>;
type OfflineOrderResponse = Order & { _offlineQueued?: boolean; syncTaskId?: string };
type BackendCreateOrderPayload = {
  codCliente: string;
  tpago: string;
  fechaEntrega?: string;
  observacion?: string;
  direccionEntrega?: string;
  latitud?: number;
  longitud?: number;
  detalles: Array<{
    codProducto: string;
    cantidad: number;
    precioUnitario?: number;
    bodega?: string;
  }>;
};

function mapEstatus(estatus: string): OrderStatus {
  const map: Record<string, OrderStatus> = {
    activo: 'draft',
    procesado: 'approved',
    pendiente: 'pending_approval',
    aprobado: 'approved',
    anulado: 'rejected',
    rechazado: 'rejected',
    facturado: 'fulfilled',
  };
  return map[estatus.trim().toLowerCase()] ?? 'draft';
}

function mapPedidoEncabezado(pedido: BackendPedidoEncabezado): Order {
  return {
    id: pedido.numPedido,
    orderNumber: pedido.numPedido,
    customerId: pedido.codCliente,
    customerName: pedido.codCliente,
    dateCreated: pedido.fechaPedido,
    deliveryDate: pedido.fechaEntrega ?? '',
    deliveryAddress: pedido.direccionEntrega ?? '',
    observations: pedido.observacion ?? '',
    status: mapEstatus(pedido.estatus),
    items: [],
    totalAmount: pedido.totalPedido,
    latitude: pedido.latitud ?? undefined,
    longitude: pedido.longitud ?? undefined,
  };
}

function mapPedidoResponse(data: BackendPedidoResponse): Order {
  const order = mapPedidoEncabezado(data.encabezado);
  order.items = (data.detalle ?? []).map(detail => ({
    productId: detail.codProducto,
    productName: detail.nomProducto,
    quantity: detail.cantidad,
    unitPrice: detail.precioUnitario,
    totalPrice: detail.precioTotal,
  }));
  return order;
}

function toBackendCreatePayload(payload: OrderInput): BackendCreateOrderPayload {
  const codCliente = String(payload.customerId ?? '').trim();
  const detalles = (payload.items ?? []).map(item => ({
    codProducto: item.productId,
    cantidad: item.quantity,
    precioUnitario: item.unitPrice,
  }));

  if (!codCliente) throw new Error('Debe seleccionar un cliente antes de crear el pedido.');
  if (detalles.length === 0) throw new Error('Debe agregar al menos un producto al pedido.');

  return {
    codCliente,
    tpago: 'Contado',
    fechaEntrega: payload.deliveryDate || undefined,
    observacion: payload.observations ?? '',
    direccionEntrega: payload.deliveryAddress ?? '',
    latitud: payload.latitude,
    longitud: payload.longitude,
    detalles,
  };
}

function isOfflineQueued(value: unknown): value is OfflineOrderResponse {
  return Boolean(value && typeof value === 'object' && '_offlineQueued' in value && (value as { _offlineQueued?: boolean })._offlineQueued === true);
}

export const orderService = {
  getMyOrders: async (): Promise<Order[]> => {
    try {
      const response = await fetchApi<BackendPedidoEncabezado[] | PagedApiResponse<BackendPedidoEncabezado>>(API_ENDPOINTS.pedidos);
      const data = Array.isArray(response) ? response : response.items ?? [];
      return data.map(mapPedidoEncabezado);
    } catch (caught) {
      console.error('Error al obtener pedidos backend /pedidos:', caught);
      return [];
    }
  },

  getOrderById: async (id: string): Promise<Order> => {
    const data = await fetchApi<BackendPedidoResponse>(`${API_ENDPOINTS.pedidos}/${encodeURIComponent(id)}`);
    return mapPedidoResponse(data);
  },

  createOrder: async (orderPayload: OrderInput): Promise<Order> => {
    const response = await fetchApi<BackendPedidoResponse | OfflineOrderResponse>(API_ENDPOINTS.pedidos, {
      method: 'POST',
      body: JSON.stringify(toBackendCreatePayload(orderPayload)),
    });

    if (isOfflineQueued(response)) {
      trackEvent('orders.created.offline', { customerId: String(orderPayload.customerId ?? '') });
      return {
        ...orderPayload,
        id: `offline-${Date.now()}`,
        orderNumber: 'PENDIENTE',
        status: 'pending_approval',
        dateCreated: new Date().toISOString(),
        items: orderPayload.items ?? [],
        totalAmount: orderPayload.totalAmount ?? 0,
        queuedOffline: true,
      } as Order;
    }

    const created = 'encabezado' in response ? mapPedidoResponse(response) : response;
    trackEvent('orders.created', { orderId: created.id });
    return created;
  },

  updateOrder: async (id: string, _orderPayload: OrderInput): Promise<Order> => {
    throw new Error(`La edición del pedido ${id} todavía no está disponible en la API de Azure.`);
  },
};