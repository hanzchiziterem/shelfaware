import type { UserRole } from '@/types/common';

export type PermissionKey =
  | 'access_platform_admin'
  | 'access_super_business_admin'
  | 'view_dashboard'
  | 'use_pos'
  | 'view_orders'
  | 'void_or_refund_sale'
  | 'view_products'
  | 'manage_products'
  | 'view_cost_price'
  | 'view_inventory'
  | 'adjust_inventory'
  | 'manage_purchases'
  | 'manage_suppliers'
  | 'manage_customers'
  | 'view_reports'
  | 'manage_users'
  | 'manage_settings';

export const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  platform_admin: [
    'access_platform_admin',
    'view_dashboard',
    'view_orders',
    'view_products',
    'view_inventory',
    'view_reports',
  ],
  super_business_admin: [
    'access_super_business_admin',
    'view_dashboard',
    'use_pos',
    'view_orders',
    'void_or_refund_sale',
    'view_products',
    'manage_products',
    'view_cost_price',
    'view_inventory',
    'adjust_inventory',
    'manage_purchases',
    'manage_suppliers',
    'manage_customers',
    'view_reports',
    'manage_users',
    'manage_settings',
  ],
  administrator: [
    'access_super_business_admin',
    'view_dashboard',
    'use_pos',
    'view_orders',
    'void_or_refund_sale',
    'view_products',
    'manage_products',
    'view_cost_price',
    'view_inventory',
    'adjust_inventory',
    'manage_purchases',
    'manage_suppliers',
    'manage_customers',
    'view_reports',
    'manage_users',
    'manage_settings',
  ],
  manager: [
    'view_dashboard',
    'use_pos',
    'view_orders',
    'void_or_refund_sale',
    'view_products',
    'manage_products',
    'view_cost_price',
    'view_inventory',
    'adjust_inventory',
    'manage_purchases',
    'manage_suppliers',
    'manage_customers',
    'view_reports',
  ],
  cashier: [
    'view_dashboard',
    'use_pos',
    'view_orders',
    'view_products',
    'view_inventory',
    'manage_customers',
  ],
};

export function hasPermission(role: UserRole | undefined, permission: PermissionKey): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
