import { fetchApi } from '../../../core/api/api.config';
import { syncService } from '../../../core/api/sync.service';
import type { BackendCliente, CustomerAccount } from '../../../types';
import { API_ENDPOINTS } from '../../../core/api/endpoints';

/**
 * Mapea un ClienteDto del backend al CustomerAccount del frontend.
 * Algunos campos (aging, DUI) pueden ser opcionales según el contrato de APIM.
 */
type PagedApiResponse<T> = { items?: T[] };

function mapCliente(c: BackendCliente): CustomerAccount {
  return {
    customerId: c.codCliente,
    name: c.nomCliente,
    dui: '',
    totalDebt: Number(c.totalDeuda) || 0,
    availableCredit: Number(c.saldoCredito) || 0,
    aging0to30: 0,
    aging31to60: 0,
    aging61to90: 0,
    aging91to120: 0,
    aging120Plus: 0
  };
}

/**
 * Servicio de Clientes.
 * Conecta a GET /clientes mediante APIM / Backend con respaldo offline local.
 */
export const customerService = {
  getCustomersList: async (): Promise<CustomerAccount[]> => {
    const ownerId = syncService.getCurrentOwnerId();
    try {
      const response = await fetchApi<BackendCliente[] | PagedApiResponse<BackendCliente>>(API_ENDPOINTS.clientes);
      const data = Array.isArray(response) ? response : response.items ?? [];
      const mapped = data.map(mapCliente);
      if (mapped.length > 0) {
        await syncService.saveCustomersLocally(mapped, ownerId);
      }
      return mapped;
    } catch (caught) {
      console.warn('No fue posible consultar clientes en red; usando respaldo local.', caught);
      return syncService.getCustomersLocally(ownerId);
    }
  }
};
