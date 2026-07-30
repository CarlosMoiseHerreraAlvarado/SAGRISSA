import { fetchApi } from '../../../core/api/api.config';
import type { BackendCliente, CustomerAccount } from '../../../types';
import { API_ENDPOINTS } from '../../../core/api/endpoints';

/**
 * Mapea un ClienteDto del backend al CustomerAccount del frontend.
 * Algunos campos (aging, DUI) pueden ser opcionales según el contrato de APIM.
 */
function mapCliente(c: BackendCliente): CustomerAccount {
  return {
    customerId: c.codCliente,
    name: c.nomCliente,
    dui: '',
    totalDebt: c.totalDeuda,
    availableCredit: c.saldoCredito,
    aging0to30: 0,
    aging31to60: 0,
    aging61to90: 0,
    aging91to120: 0,
    aging120Plus: 0
  };
}

/**
 * Servicio de Clientes.
 * Conecta a GET /v1/customers mediante APIM.
 */
export const customerService = {
  getCustomersList: async () => {
    try {
      const data = await fetchApi<BackendCliente[]>(API_ENDPOINTS.clientes);
      return data.map(mapCliente);
    } catch (caught) {
      console.error('Error al obtener lista de clientes /clientes:', caught);
      return [];
    }
  }
};
