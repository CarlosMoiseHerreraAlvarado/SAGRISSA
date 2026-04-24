import type { Order } from '../../../types';

/**
 * Servicio de Pedidos y Transacciones (Escritura hacia Dynamics 365 vía APIM)
 */
export const orderService = {
  // Enviar un nuevo pedido. Según arquitectura, va de APIM a Dynamics 365 como Single Source of Truth
  createOrder: async (orderPayload: Partial<Order>): Promise<Order> => {
    try {
      // return await fetchApi<Order>('/orders', {
      //   method: 'POST',
      //   body: JSON.stringify(orderPayload)
      // });
      
      // Simulación
      await new Promise(r => setTimeout(r, 1200));
      return {
        ...orderPayload,
        id: `ord_${Math.random().toString(36).substring(7)}`,
        orderNumber: `5000U${Math.floor(Math.random() * 90000) + 10000}`,
        status: 'draft',
        dateCreated: new Date().toISOString(),
      } as Order;
    } catch (e) {
      throw e;
    }
  },

  // Listar pedidos del vendedor logueado
  getMyOrders: async (): Promise<Order[]> => {
    // return await fetchApi<Order[]>('/orders/me');
    await new Promise(r => setTimeout(r, 600));
    return [];
  },

  getOrderById: async (id: string): Promise<Order> => {
    // return await fetchApi<Order>(`/orders/${id}`);
    await new Promise(r => setTimeout(r, 800));
    // Mocking an existing order
    return {
      id,
      orderNumber: 'ORD-99020',
      status: 'draft',
      customerId: 'CUST-001',
      customerName: 'Luis Armando S.',
      totalAmount: 45800.00,
      deliveryDate: '2026-04-30',
      deliveryAddress: 'Finca Las Marías, Santa Tecla',
      observations: 'Entregar en la mañana.',
      dateCreated: '2026-04-22T10:30:00Z',
      items: [
        { productId: 'p1', productName: 'Biomin Booster 11', quantity: 10, unitPrice: 4000.00, totalPrice: 40000.00 },
        { productId: 'p2', productName: 'Urea 46% Granulada', quantity: 163, unitPrice: 35.50, totalPrice: 5800.00 },
      ]
    } as Order;
  },

  updateOrder: async (id: string, orderPayload: Partial<Order>): Promise<Order> => {
    // return await fetchApi<Order>(`/orders/${id}`, {
    //   method: 'PUT',
    //   body: JSON.stringify(orderPayload)
    // });
    await new Promise(r => setTimeout(r, 1200));
    return {
      ...orderPayload,
      id,
      status: 'draft'
    } as Order;
  }
};
