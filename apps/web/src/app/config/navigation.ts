import { PATHS } from '@/app/router/paths';
import type { PermissionKey } from '@/app/config/permissions';
import type { UserRole } from '@/types/common';

export interface NavItemConfig {
  id: string;
  label: string;
  path: string;
  section: 'primary' | 'operations' | 'system';
  requiredPermission?: PermissionKey;
  allowedRoles?: UserRole[];
  badgeType?: 'notifications' | 'lowStock';
}

export interface PortalNavGroup {
  groupTitle: string;
  items: Array<{
    id: string;
    label: string;
    path: string;
  }>;
}

/**
 * 1. Business Admin (Retail Operations) Navigation
 */
export const NAVIGATION_ITEMS: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: PATHS.APP.DASHBOARD,
    section: 'primary',
    requiredPermission: 'view_dashboard',
  },
  {
    id: 'pos',
    label: 'Point of Sale',
    path: PATHS.APP.POS,
    section: 'primary',
    requiredPermission: 'use_pos',
  },
  {
    id: 'orders',
    label: 'Orders',
    path: PATHS.APP.ORDERS,
    section: 'primary',
    requiredPermission: 'view_orders',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    path: PATHS.APP.INVENTORY,
    section: 'primary',
    requiredPermission: 'view_inventory',
  },
  {
    id: 'products',
    label: 'Products',
    path: PATHS.APP.PRODUCTS,
    section: 'primary',
    requiredPermission: 'view_products',
  },
  {
    id: 'purchases',
    label: 'Purchases',
    path: PATHS.APP.PURCHASES,
    section: 'operations',
    requiredPermission: 'manage_purchases',
  },
  {
    id: 'customers',
    label: 'Customers',
    path: PATHS.APP.CUSTOMERS,
    section: 'operations',
    requiredPermission: 'manage_customers',
  },
  {
    id: 'suppliers',
    label: 'Suppliers',
    path: PATHS.APP.SUPPLIERS,
    section: 'operations',
    requiredPermission: 'manage_suppliers',
  },
  {
    id: 'reports',
    label: 'Reports',
    path: PATHS.APP.REPORTS,
    section: 'operations',
    requiredPermission: 'view_reports',
  },
  {
    id: 'users',
    label: 'Team & users',
    path: PATHS.APP.USERS,
    section: 'operations',
    requiredPermission: 'manage_users',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    path: PATHS.APP.NOTIFICATIONS,
    section: 'system',
    badgeType: 'notifications',
  },
  {
    id: 'help',
    label: 'Help & support',
    path: PATHS.APP.HELP,
    section: 'system',
  },
  {
    id: 'settings',
    label: 'Settings',
    path: PATHS.APP.SETTINGS,
    section: 'system',
    requiredPermission: 'manage_settings',
  },
];

/**
 * 2. Platform Admin Navigation (ShelfAware Internal SaaS Control Centre)
 */
export const PLATFORM_ADMIN_NAV_GROUPS: PortalNavGroup[] = [
  {
    groupTitle: 'Overview',
    items: [
      {
        id: 'plat-dashboard',
        label: 'Platform Dashboard',
        path: PATHS.PLATFORM.DASHBOARD,
      },
    ],
  },
  {
    groupTitle: 'Business Management',
    items: [
      {
        id: 'plat-businesses',
        label: 'All Businesses',
        path: PATHS.PLATFORM.BUSINESSES,
      },
      {
        id: 'plat-verification',
        label: 'Business Verification',
        path: PATHS.PLATFORM.VERIFICATION,
      },
      {
        id: 'plat-onboarding',
        label: 'Business Onboarding',
        path: PATHS.PLATFORM.ONBOARDING,
      },
      {
        id: 'plat-provisioning',
        label: 'Database & Provisioning',
        path: PATHS.PLATFORM.PROVISIONING,
      },
    ],
  },
  {
    groupTitle: 'Subscription Management',
    items: [
      {
        id: 'plat-plans',
        label: 'Subscription Plans',
        path: PATHS.PLATFORM.PLANS,
      },
      {
        id: 'plat-subscriptions',
        label: 'Active Subscriptions',
        path: PATHS.PLATFORM.SUBSCRIPTIONS,
      },
      {
        id: 'plat-payments',
        label: 'Payments & Transactions',
        path: PATHS.PLATFORM.PAYMENTS,
      },
      {
        id: 'plat-failed-payments',
        label: 'Failed Payments',
        path: PATHS.PLATFORM.FAILED_PAYMENTS,
      },
    ],
  },
  {
    groupTitle: 'Platform Configuration',
    items: [
      {
        id: 'plat-role-templates',
        label: 'Global Role Templates',
        path: PATHS.PLATFORM.ROLE_TEMPLATES,
      },
      {
        id: 'plat-features',
        label: 'Feature Management',
        path: PATHS.PLATFORM.FEATURES,
      },
      {
        id: 'plat-settings',
        label: 'Platform Settings',
        path: PATHS.PLATFORM.SETTINGS,
      },
    ],
  },
  {
    groupTitle: 'Support & Monitoring',
    items: [
      {
        id: 'plat-support',
        label: 'Support Requests',
        path: PATHS.PLATFORM.SUPPORT,
      },
      {
        id: 'plat-audit-logs',
        label: 'Audit Logs',
        path: PATHS.PLATFORM.AUDIT_LOGS,
      },
      {
        id: 'plat-activity',
        label: 'Platform Activity',
        path: PATHS.PLATFORM.ACTIVITY,
      },
      {
        id: 'plat-system-health',
        label: 'System Health',
        path: PATHS.PLATFORM.SYSTEM_HEALTH,
      },
    ],
  },
];

/**
 * 3. Super Business Admin Navigation (Single-Tenant Governance & Configuration)
 */
export const SUPER_BUSINESS_ADMIN_NAV_GROUPS: PortalNavGroup[] = [
  {
    groupTitle: 'Overview',
    items: [
      {
        id: 'sba-overview',
        label: 'Business Overview',
        path: PATHS.BUSINESS_ADMIN.OVERVIEW,
      },
    ],
  },
  {
    groupTitle: 'Business Configuration',
    items: [
      {
        id: 'sba-profile',
        label: 'Business Profile',
        path: PATHS.BUSINESS_ADMIN.PROFILE,
      },
      {
        id: 'sba-branches',
        label: 'Branch / Store Management',
        path: PATHS.BUSINESS_ADMIN.BRANCHES,
      },
      {
        id: 'sba-hours',
        label: 'Business Hours',
        path: PATHS.BUSINESS_ADMIN.HOURS,
      },
      {
        id: 'sba-receipt-settings',
        label: 'Branding & Receipt Settings',
        path: PATHS.BUSINESS_ADMIN.RECEIPT_SETTINGS,
      },
      {
        id: 'sba-currency-tax',
        label: 'Currency & Tax Settings',
        path: PATHS.BUSINESS_ADMIN.CURRENCY_TAX,
      },
    ],
  },
  {
    groupTitle: 'Operations Configuration',
    items: [
      {
        id: 'sba-modules',
        label: 'Module Management',
        path: PATHS.BUSINESS_ADMIN.MODULES,
      },
      {
        id: 'sba-categories',
        label: 'Product Categories',
        path: PATHS.BUSINESS_ADMIN.CATEGORIES,
      },
      {
        id: 'sba-units',
        label: 'Units of Measurement',
        path: PATHS.BUSINESS_ADMIN.UNITS,
      },
      {
        id: 'sba-inventory-settings',
        label: 'Inventory Settings',
        path: PATHS.BUSINESS_ADMIN.INVENTORY_SETTINGS,
      },
      {
        id: 'sba-sales-settings',
        label: 'Sales / POS Settings',
        path: PATHS.BUSINESS_ADMIN.SALES_SETTINGS,
      },
      {
        id: 'sba-notification-settings',
        label: 'Notification Settings',
        path: PATHS.BUSINESS_ADMIN.NOTIFICATION_SETTINGS,
      },
    ],
  },
  {
    groupTitle: 'Team & Access Control',
    items: [
      {
        id: 'sba-employees',
        label: 'Employees',
        path: PATHS.BUSINESS_ADMIN.EMPLOYEES,
      },
      {
        id: 'sba-roles',
        label: 'Roles & Permissions',
        path: PATHS.BUSINESS_ADMIN.ROLES,
      },
      {
        id: 'sba-access-history',
        label: 'Access History',
        path: PATHS.BUSINESS_ADMIN.ACCESS_HISTORY,
      },
    ],
  },
  {
    groupTitle: 'Account',
    items: [
      {
        id: 'sba-subscription',
        label: 'Subscription & Plan',
        path: PATHS.BUSINESS_ADMIN.SUBSCRIPTION,
      },
      {
        id: 'sba-billing-history',
        label: 'Billing History',
        path: PATHS.BUSINESS_ADMIN.BILLING_HISTORY,
      },
      {
        id: 'sba-account-settings',
        label: 'Account Settings',
        path: PATHS.BUSINESS_ADMIN.ACCOUNT_SETTINGS,
      },
    ],
  },
];
