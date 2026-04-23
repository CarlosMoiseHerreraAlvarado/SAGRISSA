import type { CustomerAccount } from '../../../types';

/**
 * Servicio de Clientes. 
 * Combina peticiones mixtas: Consulta de catálogo al Mirror, confirmación financiera a ERP.
 */
export const customerService = {
  getCustomersList: async () => {
    // Simulating APIM fetch mapped to /customers
    await new Promise(r => setTimeout(r, 300));
    return MOCK_CUSTOMERS;
  }
};

const MOCK_CUSTOMERS: CustomerAccount[] = [
  {
    customerId: 'c1',
    name: 'Andrea Montoya',
    dui: '05678945-8',
    totalDebt: 5400.50,
    availableCredit: 10000.00,
    aging0to30: 2000,
    aging31to60: 3400.50,
    aging61to90: 0,
    aging91to120: 0,
    aging120Plus: 0
  },
  {
    customerId: 'c2',
    name: 'Luis Armando Sanchez',
    dui: '02886731-1',
    totalDebt: 32000.00,
    availableCredit: 50000.00,
    aging0to30: 10000,
    aging31to60: 0,
    aging61to90: 0,
    aging91to120: 0,
    aging120Plus: 22000
  }
];
