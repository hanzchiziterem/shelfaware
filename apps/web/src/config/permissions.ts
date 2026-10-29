import { Role } from '../types/domain';

export type Permission =
  | 'pos:operate'
  | 'products:view'
  | 'products:create'
  | 'products:edit'
  | 'products:delete'
  | 'products:view_cost'
  | 'inventory:view'
  | 'inventory:adjust'
  | 'inventory:stocktake'
  | 'sales:view'
  | 'sales:void'
  | 'sales:refund'
  | 'purchases:view'
  | 'purchases:create'
  | 'purchases:receive'
  | 'reports:view'
  | 'reports:profit'
  | 'users:manage'
  | 'settings:manage';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'pos:operate',
    'products:view',
    'products:create',
    'products:edit',
    'products:delete',
    'products:view_cost',
    'inventory:view',
    'inventory:adjust',
    'inventory:stocktake',
    'sales:view',
    'sales:void',
    'sales:refund',
    'purchases:view',
    'purchases:create',
    'purchases:receive',
    'reports:view',
    'reports:profit',
    'users:manage',
    'settings:manage',
  ],
  manager: [
    'pos:operate',
    'products:view',
    'products:create',
    'products:edit',
    'products:view_cost',
    'inventory:view',
    'inventory:adjust',
    'inventory:stocktake',
    'sales:view',
    'sales:void',
    'purchases:view',
    'purchases:create',
    'purchases:receive',
    'reports:view',
    'reports:profit',
  ],
  cashier: [
    'pos:operate',
    'products:view',
    'inventory:view',
    'sales:view',
  ],
};

export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

