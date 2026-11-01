import type { ReactNode } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { hasPermission, type PermissionKey } from '@/app/config/permissions';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { PATHS } from '@/app/router/paths';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { OnboardingPage } from '@/features/auth/pages/OnboardingPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage';
import { CustomersPage } from '@/features/customers/pages/CustomersPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { InventoryPage } from '@/features/inventory/pages/InventoryPage';
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage';
import {
  AllBusinessesPage,
  BusinessOnboardingPage,
  BusinessVerificationPage,
  DatabaseProvisioningPage,
} from '@/features/platformAdmin/pages/PlatformBusinessesPages';
import {
  FeatureManagementPage,
  GlobalRoleTemplatesPage,
  PlatformSettingsPage,
} from '@/features/platformAdmin/pages/PlatformConfigPages';
import { PlatformDashboardPage } from '@/features/platformAdmin/pages/PlatformDashboardPage';
import {
  ActiveSubscriptionsPage,
  FailedPaymentsPage,
  PlatformPaymentsPage,
  SubscriptionPlansPage,
} from '@/features/platformAdmin/pages/PlatformSubscriptionsPages';
import {
  PlatformActivityPage,
  PlatformAuditLogsPage,
  SupportRequestsPage,
  SystemHealthPage,
} from '@/features/platformAdmin/pages/PlatformSupportMonitoringPages';
import { PosPage } from '@/features/pos/pages/PosPage';
import { ProductsPage } from '@/features/products/pages/ProductsPage';
import { PurchasesPage } from '@/features/purchases/pages/PurchasesPage';
import { ReportsPage } from '@/features/reports/pages/ReportsPage';
import { OrdersPage } from '@/features/sales/pages/OrdersPage';
import { HelpPage } from '@/features/settings/pages/HelpPage';
import { NotFoundPage } from '@/features/settings/pages/NotFoundPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import {
  BillingHistoryPage,
  SubscriptionPlanViewPage,
  TenantAccountSettingsPage,
} from '@/features/superBusinessAdmin/pages/AccountBillingPages';
import {
  BrandingReceiptSettingsPage,
  BranchManagementPage,
  BusinessHoursPage,
  BusinessOverviewPage,
  BusinessProfilePage,
  CurrencyTaxSettingsPage,
} from '@/features/superBusinessAdmin/pages/BusinessConfigPages';
import {
  InventorySettingsConfigPage,
  ModuleManagementPage,
  NotificationSettingsConfigPage,
  ProductCategoriesConfigPage,
  SalesSettingsConfigPage,
  UnitsOfMeasureConfigPage,
} from '@/features/superBusinessAdmin/pages/OperationsConfigPages';
import {
  AccessHistoryPage,
  EmployeesManagementPage,
  RolesPermissionsMatrixPage,
} from '@/features/superBusinessAdmin/pages/TeamAccessControlPages';
import { SuppliersPage } from '@/features/suppliers/pages/SuppliersPage';
import { UsersPage } from '@/features/users/pages/UsersPage';
import { useAuthStore } from '@/store/authStore';

function RequirePermission({
  permission,
  children,
}: {
  permission: PermissionKey;
  children: ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  if (!hasPermission(user?.role, permission)) {
    return <NotFoundPage unauthorized />;
  }
  return <>{children}</>;
}

/**
 * Strict Portal Route Guards:
 * - Platform Admin routes require `access_platform_admin`.
 * - Super Business Admin routes require `access_super_business_admin` (isolated from Platform Admin).
 */
function RequirePlatformAdmin({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!hasPermission(user?.role, 'access_platform_admin')) {
    return <NotFoundPage unauthorized />;
  }
  return <>{children}</>;
}

function RequireSuperBusinessAdmin({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!hasPermission(user?.role, 'access_super_business_admin')) {
    return <NotFoundPage unauthorized />;
  }
  return <>{children}</>;
}

/**
 * Exported array of public authentication & onboarding routes.
 */
export const publicRoutes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      { path: PATHS.AUTH.LOGIN, element: <LoginPage /> },
      { path: PATHS.AUTH.REGISTER, element: <RegisterPage /> },
      { path: PATHS.AUTH.VERIFY_EMAIL, element: <VerifyEmailPage /> },
      { path: PATHS.AUTH.ONBOARDING, element: <OnboardingPage /> },
      { path: PATHS.AUTH.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
    ],
  },
];

/**
 * Exported array of protected application workspace routes across all 3 portals.
 */
export const protectedRoutes: RouteObject[] = [
  {
    path: PATHS.APP.ROOT,
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to={PATHS.APP.DASHBOARD} replace /> },

      // --- 1. Business Admin (Retail Operations Workspace) ---
      { path: PATHS.APP.DASHBOARD, element: <DashboardPage /> },
      { path: PATHS.APP.POS, element: <PosPage /> },
      { path: PATHS.APP.ORDERS, element: <OrdersPage /> },
      { path: PATHS.APP.INVENTORY, element: <InventoryPage /> },
      { path: PATHS.APP.PRODUCTS, element: <ProductsPage /> },
      {
        path: PATHS.APP.PURCHASES,
        element: (
          <RequirePermission permission="manage_purchases">
            <PurchasesPage />
          </RequirePermission>
        ),
      },
      {
        path: PATHS.APP.SUPPLIERS,
        element: (
          <RequirePermission permission="manage_suppliers">
            <SuppliersPage />
          </RequirePermission>
        ),
      },
      { path: PATHS.APP.CUSTOMERS, element: <CustomersPage /> },
      {
        path: PATHS.APP.REPORTS,
        element: (
          <RequirePermission permission="view_reports">
            <ReportsPage />
          </RequirePermission>
        ),
      },
      {
        path: PATHS.APP.USERS,
        element: (
          <RequirePermission permission="manage_users">
            <UsersPage />
          </RequirePermission>
        ),
      },
      { path: PATHS.APP.NOTIFICATIONS, element: <NotificationsPage /> },
      {
        path: PATHS.APP.SETTINGS,
        element: (
          <RequirePermission permission="manage_settings">
            <SettingsPage />
          </RequirePermission>
        ),
      },
      { path: PATHS.APP.HELP, element: <HelpPage /> },

      // --- 2. Platform Admin Portal (`/platform/*`) ---
      {
        path: PATHS.PLATFORM.ROOT,
        element: <Navigate to={PATHS.PLATFORM.DASHBOARD} replace />,
      },
      {
        path: PATHS.PLATFORM.DASHBOARD,
        element: (
          <RequirePlatformAdmin>
            <PlatformDashboardPage />
          </RequirePlatformAdmin>
        ),
      },
      {
        path: PATHS.PLATFORM.BUSINESSES,
        element: (
          <RequirePlatformAdmin>
            <AllBusinessesPage />
          </RequirePlatformAdmin>
        ),
      },
      {
        path: PATHS.PLATFORM.VERIFICATION,
        element: (
          <RequirePlatformAdmin>
            <BusinessVerificationPage />
          </RequirePlatformAdmin>
        ),
      },
      {
        path: PATHS.PLATFORM.ONBOARDING,
        element: (
          <RequirePlatformAdmin>
            <BusinessOnboardingPage />
          </RequirePlatformAdmin>
        ),
      },
      {
        path: PATHS.PLATFORM.PROVISIONING,
        element: (
          <RequirePlatformAdmin>
            <DatabaseProvisioningPage />
          </RequirePlatformAdmin>
        ),
      },
      {
        path: PATHS.PLATFORM.PLANS,
        element: (
          <RequirePlatformAdmin>
            <SubscriptionPlansPage />
          </RequirePlatformAdmin>
        ),
      },
      {
        path: PATHS.PLATFORM.SUBSCRIPTIONS,
        element: (
          <RequirePlatformAdmin>
            <ActiveSubscriptionsPage />
          </RequirePlatformAdmin>
        ),
      },
      {
        path: PATHS.PLATFORM.PAYMENTS,
        element: (
          <RequirePlatformAdmin>
            <PlatformPaymentsPage />
          </RequirePlatformAdmin>
        ),
      },
      {
        path: PATHS.PLATFORM.FAILED_PAYMENTS,
        element: (
          <RequirePlatformAdmin>
            <FailedPaymentsPage />
          </RequirePlatformAdmin>
        ),
      },
      {
        path: PATHS.PLATFORM.ROLE_TEMPLATES,
        element: (
          <RequirePlatformAdmin>
            <GlobalRoleTemplatesPage />
          </RequirePlatformAdmin>
        ),
      },
      {
        path: PATHS.PLATFORM.FEATURES,
        element: (
          <RequirePlatformAdmin>
            <FeatureManagementPage />
          </RequirePlatformAdmin>
        ),
      },
      {
        path: PATHS.PLATFORM.SETTINGS,
        element: (
          <RequirePlatformAdmin>
            <PlatformSettingsPage />
          </RequirePlatformAdmin>
        ),
      },
      {
        path: PATHS.PLATFORM.SUPPORT,
        element: (
          <RequirePlatformAdmin>
            <SupportRequestsPage />
          </RequirePlatformAdmin>
        ),
      },
      {
        path: PATHS.PLATFORM.AUDIT_LOGS,
        element: (
          <RequirePlatformAdmin>
            <PlatformAuditLogsPage />
          </RequirePlatformAdmin>
        ),
      },
      {
        path: PATHS.PLATFORM.ACTIVITY,
        element: (
          <RequirePlatformAdmin>
            <PlatformActivityPage />
          </RequirePlatformAdmin>
        ),
      },
      {
        path: PATHS.PLATFORM.SYSTEM_HEALTH,
        element: (
          <RequirePlatformAdmin>
            <SystemHealthPage />
          </RequirePlatformAdmin>
        ),
      },

      // --- 3. Super Business Admin Portal (`/business-admin/*`) ---
      {
        path: PATHS.BUSINESS_ADMIN.ROOT,
        element: <Navigate to={PATHS.BUSINESS_ADMIN.OVERVIEW} replace />,
      },
      {
        path: PATHS.BUSINESS_ADMIN.OVERVIEW,
        element: (
          <RequireSuperBusinessAdmin>
            <BusinessOverviewPage />
          </RequireSuperBusinessAdmin>
        ),
      },
      {
        path: PATHS.BUSINESS_ADMIN.PROFILE,
        element: (
          <RequireSuperBusinessAdmin>
            <BusinessProfilePage />
          </RequireSuperBusinessAdmin>
        ),
      },
      {
        path: PATHS.BUSINESS_ADMIN.BRANCHES,
        element: (
          <RequireSuperBusinessAdmin>
            <BranchManagementPage />
          </RequireSuperBusinessAdmin>
        ),
      },
      {
        path: PATHS.BUSINESS_ADMIN.HOURS,
        element: (
          <RequireSuperBusinessAdmin>
            <BusinessHoursPage />
          </RequireSuperBusinessAdmin>
        ),
      },
      {
        path: PATHS.BUSINESS_ADMIN.RECEIPT_SETTINGS,
        element: (
          <RequireSuperBusinessAdmin>
            <BrandingReceiptSettingsPage />
          </RequireSuperBusinessAdmin>
        ),
      },
      {
        path: PATHS.BUSINESS_ADMIN.CURRENCY_TAX,
        element: (
          <RequireSuperBusinessAdmin>
            <CurrencyTaxSettingsPage />
          </RequireSuperBusinessAdmin>
        ),
      },
      {
        path: PATHS.BUSINESS_ADMIN.MODULES,
        element: (
          <RequireSuperBusinessAdmin>
            <ModuleManagementPage />
          </RequireSuperBusinessAdmin>
        ),
      },
      {
        path: PATHS.BUSINESS_ADMIN.CATEGORIES,
        element: (
          <RequireSuperBusinessAdmin>
            <ProductCategoriesConfigPage />
          </RequireSuperBusinessAdmin>
        ),
      },
      {
        path: PATHS.BUSINESS_ADMIN.UNITS,
        element: (
          <RequireSuperBusinessAdmin>
            <UnitsOfMeasureConfigPage />
          </RequireSuperBusinessAdmin>
        ),
      },
      {
        path: PATHS.BUSINESS_ADMIN.INVENTORY_SETTINGS,
        element: (
          <RequireSuperBusinessAdmin>
            <InventorySettingsConfigPage />
          </RequireSuperBusinessAdmin>
        ),
      },
      {
        path: PATHS.BUSINESS_ADMIN.SALES_SETTINGS,
        element: (
          <RequireSuperBusinessAdmin>
            <SalesSettingsConfigPage />
          </RequireSuperBusinessAdmin>
        ),
      },
      {
        path: PATHS.BUSINESS_ADMIN.NOTIFICATION_SETTINGS,
        element: (
          <RequireSuperBusinessAdmin>
            <NotificationSettingsConfigPage />
          </RequireSuperBusinessAdmin>
        ),
      },
      {
        path: PATHS.BUSINESS_ADMIN.EMPLOYEES,
        element: (
          <RequireSuperBusinessAdmin>
            <EmployeesManagementPage />
          </RequireSuperBusinessAdmin>
        ),
      },
      {
        path: PATHS.BUSINESS_ADMIN.ROLES,
        element: (
          <RequireSuperBusinessAdmin>
            <RolesPermissionsMatrixPage />
          </RequireSuperBusinessAdmin>
        ),
      },
      {
        path: PATHS.BUSINESS_ADMIN.ACCESS_HISTORY,
        element: (
          <RequireSuperBusinessAdmin>
            <AccessHistoryPage />
          </RequireSuperBusinessAdmin>
        ),
      },
      {
        path: PATHS.BUSINESS_ADMIN.SUBSCRIPTION,
        element: (
          <RequireSuperBusinessAdmin>
            <SubscriptionPlanViewPage />
          </RequireSuperBusinessAdmin>
        ),
      },
      {
        path: PATHS.BUSINESS_ADMIN.BILLING_HISTORY,
        element: (
          <RequireSuperBusinessAdmin>
            <BillingHistoryPage />
          </RequireSuperBusinessAdmin>
        ),
      },
      {
        path: PATHS.BUSINESS_ADMIN.ACCOUNT_SETTINGS,
        element: (
          <RequireSuperBusinessAdmin>
            <TenantAccountSettingsPage />
          </RequireSuperBusinessAdmin>
        ),
      },

      { path: PATHS.APP.UNAUTHORIZED, element: <NotFoundPage unauthorized /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
