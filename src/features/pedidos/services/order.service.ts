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
  }
};
