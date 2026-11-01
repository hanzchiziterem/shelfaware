export type { ApiResponse, NormalizedApiError, PaginatedResponse } from '@/types/api';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  BUSINESS: {
    CURRENT: '/businesses/current',
    CREATE: '/businesses',
    SETTINGS: '/businesses/current/settings',
    BRANDING: '/businesses/current/branding',
  },
  DASHBOARD: {
    OVERVIEW: '/dashboard/overview',
    SALES_TREND: '/dashboard/sales-trend',
    TOP_PRODUCTS: '/dashboard/top-products',
    RECENT_SALES: '/dashboard/recent-sales',
    LOW_STOCK: '/dashboard/low-stock',
    EXPIRING_STOCK: '/dashboard/expiring-stock',
  },
  PRODUCTS: {
    BASE: '/products',
    SEARCH: '/products/search',
    CATEGORIES: '/categories',
  },
  POS: {
    PRODUCTS: '/pos/products',
    CUSTOMERS: '/pos/customers',
    CHECKOUT: '/pos/checkout',
    TRANSACTIONS: '/pos/transactions',
  },
  SALES: {
    BASE: '/sales',
  },
  INVENTORY: {
    BASE: '/inventory',
    SUMMARY: '/inventory/summary',
    MOVEMENTS: '/inventory/movements',
    ADJUSTMENTS: '/inventory/adjustments',
    STOCKTAKES: '/inventory/stocktakes',
    BATCHES: '/inventory/batches',
    EXPIRY_ALERTS: '/inventory/expiry-alerts',
  },
  PURCHASES: {
    BASE: '/purchases',
  },
  SUPPLIERS: {
    BASE: '/suppliers',
  },
  CUSTOMERS: {
    BASE: '/customers',
  },
  REPORTS: {
    SALES: '/reports/sales',
    PRODUCTS: '/reports/products',
    PROFIT: '/reports/profit',
    INVENTORY: '/reports/inventory',
  },
  USERS: {
    BASE: '/users',
    ROLES: '/roles',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    READ_ALL: '/notifications/read-all',
  },
  SETTINGS: {
    BASE: '/settings',
    BRANDING: '/settings/branding',
  },
} as const;
