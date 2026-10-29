/**
 * Centralized Route Paths for ShelfAware SaaS Frontend.
 */

export const PATHS = {
  // Auth
  LOGIN: '/login',
  SIGNUP: '/signup',
  ONBOARDING: '/onboarding',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // App Workspaces
  DASHBOARD: '/',
  POS: '/pos',
  SALES: '/sales',
  PRODUCTS: '/products',
  INVENTORY: '/inventory',
  EXPIRY: '/inventory/expiry',
  PURCHASES: '/purchases',
  SUPPLIERS: '/suppliers',
  CUSTOMERS: '/customers',
  REPORTS: '/reports',
  USERS: '/team',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  SUPPORT: '/support',

  // Fallbacks
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',
} as const;

