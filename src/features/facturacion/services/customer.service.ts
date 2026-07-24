import { fetchApi } from '../../../core/api/api.config';
import type { BackendCliente, CustomerAccount } from '../../../types';

/**
 * Mapea un ClienteDto del backend al CustomerAccount del frontend.
 * Algunos campos (aging, DUI) no existen aun en el backend mock.
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
 * Conecta a GET /api/clientes del backend ASP.NET Core.
 */
export const customerService = {
  getCustomersList: async () => {
    const data = await fetchApi<BackendCliente[]>('/api/clientes');
    return data.map(mapCliente);
  }
};
