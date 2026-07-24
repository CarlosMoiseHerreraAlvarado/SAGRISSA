import type { OfflineCapability, Permission, Role } from '../../types';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  cliente: [
    'account.read',
    'catalog.read',
    'orders.read',
    'collections.read',
    'invoices.read',
  ],
  vendedor: [
    'catalog.read',
    'customers.read',
    'orders.read',
    'orders.create',
    'orders.update',
    'collections.read',
    'collections.create',
    'invoices.read',
    'reports.read',
    'reports.export',
    'goals.read',
  ],
  supervisor: [
    'catalog.read',
    'customers.read',
    'orders.read',
    'collections.read',
    'invoices.read',
    'approvals.read',
    'approvals.decide',
    'goals.read',
  ],
  gerente: [
    'catalog.read',
    'customers.read',
    'orders.read',
    'collections.read',
    'invoices.read',
    'approvals.read',
    'approvals.decide',
    'goals.read',
    'reports.read',
    'reports.export',
  ],
  director: [
    'catalog.read',
    'invoices.read',
    'goals.read',
    'analytics.read',
    'reports.read',
    'reports.export',
    'collections.read',
  ],
};

export const ROLE_OFFLINE_CAPABILITIES: Record<Role, OfflineCapability[]> = {
  cliente: [],
  vendedor: ['orders.write', 'collections.write'],
  supervisor: [],
  gerente: [],
  director: [],
};

export function hasPermission(
  permissions: Permission[] | undefined,
  required: Permission | Permission[],
  mode: 'some' | 'every' = 'some',
): boolean {
  const requiredPermissions = Array.isArray(required) ? required : [required];
  if (!permissions) return false;
  return mode === 'every'
    ? requiredPermissions.every(permission => permissions.includes(permission))
    : requiredPermissions.some(permission => permissions.includes(permission));
}
