import { PATHS } from '../router/paths';
import { Permission } from './permissions';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  iconName: string;
  badge?: string | number;
  requiredPermission?: Permission;
  children?: NavItem[];
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const NAVIGATION_SECTIONS: NavSection[] = [
  {
    title: 'Core Operations',
    items: [
      {
        id: 'pos',
        label: 'Point of Sale',
        path: PATHS.POS,
        iconName: 'ShoppingCart',
        requiredPermission: 'pos:operate',
      },
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: PATHS.DASHBOARD,
        iconName: 'LayoutDashboard',
      },
      {
        id: 'sales',
        label: 'Orders & Sales',
        path: PATHS.SALES,
        iconName: 'ReceiptText',
        requiredPermission: 'sales:view',
      },
    ],
  },
  {
    title: 'Catalog & Inventory',
    items: [
      {
        id: 'products',
        label: 'Products',
        path: PATHS.PRODUCTS,
        iconName: 'Package',
        requiredPermission: 'products:view',
      },
      {
        id: 'inventory',
        label: 'Stock Control',
        path: PATHS.INVENTORY,
        iconName: 'Boxes',
        requiredPermission: 'inventory:view',
      },
      {
        id: 'expiry',
        label: 'Perishables & Expiry',
        path: PATHS.EXPIRY,
        iconName: 'ClockAlert',
        requiredPermission: 'inventory:view',
      },
    ],
  },
  {
    title: 'Procurement & Relations',
    items: [
      {
        id: 'purchases',
        label: 'Purchases & Receiving',
        path: PATHS.PURCHASES,
        iconName: 'Truck',
        requiredPermission: 'purchases:view',
      },
      {
        id: 'suppliers',
        label: 'Suppliers',
        path: PATHS.SUPPLIERS,
        iconName: 'Building2',
      },
      {
        id: 'customers',
        label: 'Customers',
        path: PATHS.CUSTOMERS,
        iconName: 'Users',
      },
    ],
  },
  {
    title: 'Analytics & Admin',
    items: [
      {
        id: 'reports',
        label: 'Reports & Analytics',
        path: PATHS.REPORTS,
        iconName: 'BarChart3',
        requiredPermission: 'reports:view',
      },
      {
        id: 'team',
        label: 'Team & Staff',
        path: PATHS.USERS,
        iconName: 'UserCheck',
        requiredPermission: 'users:manage',
      },
      {
        id: 'notifications',
        label: 'Notifications',
        path: PATHS.NOTIFICATIONS,
        iconName: 'Bell',
      },
      {
        id: 'settings',
        label: 'Settings',
        path: PATHS.SETTINGS,
        iconName: 'Settings',
      },
      {
        id: 'support',
        label: 'Help & Support',
        path: PATHS.SUPPORT,
        iconName: 'HelpCircle',
      },
    ],
  },
];

