import { RouteObject, Navigate } from 'react-router-dom';
import { PATHS } from './paths';

// Layouts
import { AppLayout } from '../components/layout/AppLayout';
import { AuthLayout } from '../components/layout/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Auth Pages
import { LoginPage } from '../features/auth/pages/LoginPage';
import { SignupPage } from '../features/auth/pages/SignupPage';
import { OnboardingPage } from '../features/auth/pages/OnboardingPage';
import { VerifyEmailPage } from '../features/auth/pages/VerifyEmailPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';

// App Feature Pages
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { PosPage } from '../features/pos/pages/PosPage';
import { ProductsPage } from '../features/products/pages/ProductsPage';
import { InventoryPage } from '../features/inventory/pages/InventoryPage';
import { ExpiryPage } from '../features/inventory/pages/ExpiryPage';
import { SalesPage } from '../features/sales/pages/SalesPage';
import { PurchasesPage } from '../features/purchases/pages/PurchasesPage';
import { SuppliersPage } from '../features/suppliers/pages/SuppliersPage';
import { CustomersPage } from '../features/customers/pages/CustomersPage';
import { ReportsPage } from '../features/reports/pages/ReportsPage';
import { UsersPage } from '../features/users/pages/UsersPage';
import { NotificationsPage } from '../features/notifications/pages/NotificationsPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import { SupportPage } from '../features/support/pages/SupportPage';

// Error Pages
import { NotFoundPage } from '../features/errors/NotFoundPage';
import { UnauthorizedPage } from '../features/errors/UnauthorizedPage';

/**
 * Public authentication route objects
 */
export const publicRoutes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      { path: PATHS.LOGIN, element: <LoginPage /> },
      { path: PATHS.SIGNUP, element: <SignupPage /> },
      { path: PATHS.ONBOARDING, element: <OnboardingPage /> },
      { path: PATHS.VERIFY_EMAIL, element: <VerifyEmailPage /> },
      { path: PATHS.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
      { path: PATHS.RESET_PASSWORD, element: <ResetPasswordPage /> },
    ],
  },
];

/**
 * Protected application route objects
 */
export const protectedRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: PATHS.DASHBOARD, element: <DashboardPage /> },
          { path: PATHS.POS, element: <PosPage /> },
          { path: PATHS.SALES, element: <SalesPage /> },
          { path: PATHS.PRODUCTS, element: <ProductsPage /> },
          { path: PATHS.INVENTORY, element: <InventoryPage /> },
          { path: PATHS.EXPIRY, element: <ExpiryPage /> },
          { path: PATHS.PURCHASES, element: <PurchasesPage /> },
          { path: PATHS.SUPPLIERS, element: <SuppliersPage /> },
          { path: PATHS.CUSTOMERS, element: <CustomersPage /> },
          { path: PATHS.REPORTS, element: <ReportsPage /> },
          { path: PATHS.USERS, element: <UsersPage /> },
          { path: PATHS.NOTIFICATIONS, element: <NotificationsPage /> },
          { path: PATHS.SETTINGS, element: <SettingsPage /> },
          { path: PATHS.SUPPORT, element: <SupportPage /> },
        ],
      },
    ],
  },
];

/**
 * Fallback and error routes
 */
export const errorRoutes: RouteObject[] = [
  { path: PATHS.UNAUTHORIZED, element: <UnauthorizedPage /> },
  { path: PATHS.NOT_FOUND, element: <NotFoundPage /> },
  { path: '*', element: <Navigate to={PATHS.NOT_FOUND} replace /> },
];

/**
 * Combined route array
 */
export const appRoutes: RouteObject[] = [
  ...publicRoutes,
  ...protectedRoutes,
  ...errorRoutes,
];
