import { create } from 'zustand';
import {
  INITIAL_ACCESS_HISTORY,
  INITIAL_BUSINESS_BRANCHES,
  INITIAL_HOLIDAY_CLOSURES,
  INITIAL_OPERATING_HOURS,
  INITIAL_TENANT_EMPLOYEES,
  INITIAL_TENANT_ROLES,
  INITIAL_TENANT_UNITS,
} from '@/mocks/adminPortalsMockData';
import type {
  AccessHistoryEntry,
  BusinessBranch,
  HolidayClosure,
  OperatingDaySchedule,
  TenantEmployeeRecord,
  TenantRoleDefinition,
  TenantUnitConfig,
} from '@/types/adminPortals';

export interface TenantSalesConfiguration {
  allowedPaymentMethods: Array<'cash' | 'bank_transfer' | 'card' | 'split'>;
  defaultPaymentMethod: 'cash' | 'bank_transfer' | 'card';
  autoPrintReceiptOnCheckout: boolean;
  requireCustomerForWholesale: boolean;
  cashierMaxDiscountPercent: number;
  cashierMaxDiscountNaira: number;
  requireManagerApprovalForVoid: boolean;
  requireConfirmationBeforeCompleteSale: boolean;
}

export interface TenantInventoryConfiguration {
  defaultLowStockThreshold: number;
  enableLowStockInAppAlerts: boolean;
  enableLowStockEmailDigest: boolean;
  enableExpiryTracking: boolean;
  expiryWarningDays: number;
  blockPosSaleOfExpiredBatch: boolean;
  requireReasonOnManualAdjustment: boolean;
  stocktakeApprovalPolicy: 'immediate' | 'require_super_admin_signoff';
}

export interface TenantNotificationPreferences {
  lowStockAlertChannel: 'in_app' | 'in_app_and_email';
  expiryAlertChannel: 'in_app' | 'in_app_and_email';
  largeVoidAlertThresholdNaira: number;
  dailyClosingSummaryTime: string;
  recipientEmails: string;
}

export interface TenantAccountSecuritySettings {
  enforceTwoFactorForAdmins: boolean;
  sessionIdleTimeoutMinutes: number;
  allowConcurrentPosSessions: boolean;
  billingContactEmail: string;
}

interface SuperBusinessAdminState {
  /**
   * Trusted tenant context resolved from the authenticated session (`biz-01`).
   * Never read from arbitrary query params.
   */
  activeTenantId: string;
  businessDescription: string;
  registrationNumber: string;
  taxIdNumber: string;
  taxInclusivePricing: boolean;
  branches: BusinessBranch[];
  operatingHours: OperatingDaySchedule[];
  holidays: HolidayClosure[];
  units: TenantUnitConfig[];
  roles: TenantRoleDefinition[];
  employees: TenantEmployeeRecord[];
  accessHistory: AccessHistoryEntry[];
  enabledModuleKeys: string[];
  salesConfig: TenantSalesConfiguration;
  inventoryConfig: TenantInventoryConfiguration;
  notificationPrefs: TenantNotificationPreferences;
  accountSecurity: TenantAccountSecuritySettings;

  logAdminActivity: (actorName: string, activity: string, resource: string) => void;
  updateBusinessExtendedProfile: (
    partial: {
      businessDescription?: string;
      registrationNumber?: string;
      taxIdNumber?: string;
      taxInclusivePricing?: boolean;
    },
    actorName: string
  ) => void;
  saveBranch: (
    branch: Omit<BusinessBranch, 'id' | 'assignedEmployeesCount'> & { id?: string },
    actorName: string
  ) => void;
  setBranchStatus: (
    branchId: string,
    status: BusinessBranch['status'],
    actorName: string
  ) => void;
  updateOperatingDay: (
    day: OperatingDaySchedule['day'],
    partial: Partial<OperatingDaySchedule>,
    actorName: string
  ) => void;
  addHolidayClosure: (payload: Omit<HolidayClosure, 'id'>, actorName: string) => void;
  removeHolidayClosure: (id: string, actorName: string) => void;
  toggleTenantModule: (moduleKey: string, enabled: boolean, actorName: string) => void;
  saveUnitConfig: (
    unit: Omit<TenantUnitConfig, 'id'> & { id?: string },
    actorName: string
  ) => void;
  toggleUnitActive: (unitId: string, actorName: string) => void;
  updateSalesConfig: (partial: Partial<TenantSalesConfiguration>, actorName: string) => void;
  updateInventoryConfig: (
    partial: Partial<TenantInventoryConfiguration>,
    actorName: string
  ) => void;
  updateNotificationPrefs: (
    partial: Partial<TenantNotificationPreferences>,
    actorName: string
  ) => void;
  updateAccountSecurity: (
    partial: Partial<TenantAccountSecuritySettings>,
    actorName: string
  ) => void;
  createCustomRole: (
    payload: { name: string; description: string; permissions: string[] },
    actorName: string
  ) => TenantRoleDefinition;
  updateRolePermissions: (
    roleId: string,
    permissions: string[],
    actorName: string
  ) => { ok: boolean; error?: string };
  inviteOrCreateEmployee: (
    payload: {
      fullName: string;
      email: string;
      phone: string;
      roleId: string;
      branchIds: string[];
      status: 'active' | 'invited';
    },
    actorName: string
  ) => void;
  updateEmployeeAssignment: (
    employeeId: string,
    payload: { roleId?: string; branchIds?: string[]; status?: TenantEmployeeRecord['status'] },
    actorName: string
  ) => { ok: boolean; error?: string };
}

export const useSuperBusinessAdminStore = create<SuperBusinessAdminState>((set, get) => ({
  activeTenantId: 'biz-01',
  businessDescription:
    'Retail and wholesale Nigerian foodstuff supermarket and coldroom depot supplying parboiled rice, grains, cooking oils, frozen fish, and seasoning cartons across Lagos.',
  registrationNumber: 'RC-1849201',
  taxIdNumber: 'TIN-20948102-0001',
  taxInclusivePricing: false,
  branches: INITIAL_BUSINESS_BRANCHES,
  operatingHours: INITIAL_OPERATING_HOURS,
  holidays: INITIAL_HOLIDAY_CLOSURES,
  units: INITIAL_TENANT_UNITS,
  roles: INITIAL_TENANT_ROLES,
  employees: INITIAL_TENANT_EMPLOYEES,
  accessHistory: INITIAL_ACCESS_HISTORY,
  enabledModuleKeys: [
    'pos',
    'inventory',
    'products',
    'purchases',
    'customers',
    'suppliers',
    'reports',
    'team_management',
  ],
  salesConfig: {
    allowedPaymentMethods: ['cash', 'bank_transfer', 'card', 'split'],
    defaultPaymentMethod: 'bank_transfer',
    autoPrintReceiptOnCheckout: false,
    requireCustomerForWholesale: true,
    cashierMaxDiscountPercent: 5,
    cashierMaxDiscountNaira: 2000,
    requireManagerApprovalForVoid: true,
    requireConfirmationBeforeCompleteSale: false,
  },
  inventoryConfig: {
    defaultLowStockThreshold: 10,
    enableLowStockInAppAlerts: true,
    enableLowStockEmailDigest: true,
    enableExpiryTracking: true,
    expiryWarningDays: 30,
    blockPosSaleOfExpiredBatch: true,
    requireReasonOnManualAdjustment: true,
    stocktakeApprovalPolicy: 'require_super_admin_signoff',
  },
  notificationPrefs: {
    lowStockAlertChannel: 'in_app_and_email',
    expiryAlertChannel: 'in_app_and_email',
    largeVoidAlertThresholdNaira: 50000,
    dailyClosingSummaryTime: '20:30',
    recipientEmails: 'adebayo@oluwafoodmart.ng, ngozi@oluwafoodmart.ng',
  },
  accountSecurity: {
    enforceTwoFactorForAdmins: true,
    sessionIdleTimeoutMinutes: 30,
    allowConcurrentPosSessions: true,
    billingContactEmail: 'adebayo@oluwafoodmart.ng',
  },

  logAdminActivity: (actorName, activity, resource) => {
    const entry: AccessHistoryEntry = {
      id: `acc-${Date.now().toString().slice(-5)}`,
      userName: actorName,
      userRole: 'Super Business Admin',
      branchName: 'Mushin Main Depot',
      activity,
      resource,
      ipReference: '102.89.42.18 (Lagos)',
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      accessHistory: [entry, ...state.accessHistory],
    }));
  },

  updateBusinessExtendedProfile: (partial, actorName) => {
    set((state) => ({
      ...state,
      ...partial,
    }));
    get().logAdminActivity(
      actorName,
      'Updated Business Profile & Tax Identifiers',
      'Business Profile'
    );
  },

  saveBranch: (branchPayload, actorName) => {
    const isEdit = Boolean(branchPayload.id);
    const branchId = branchPayload.id || `br-0${get().branches.length + 1}`;
    set((state) => {
      const existing = state.branches.find((b) => b.id === branchId);
      const nextBranch: BusinessBranch = {
        ...branchPayload,
        id: branchId,
        assignedEmployeesCount: existing ? existing.assignedEmployeesCount : 1,
      };
      return {
        branches: isEdit
          ? state.branches.map((b) => (b.id === branchId ? nextBranch : b))
          : [...state.branches, nextBranch],
      };
    });
    get().logAdminActivity(
      actorName,
      isEdit ? 'Updated Branch Configuration' : 'Created Store Branch',
      `Branch: ${branchPayload.name} (${branchPayload.code})`
    );
  },

  setBranchStatus: (branchId, status, actorName) => {
    const target = get().branches.find((b) => b.id === branchId);
    if (!target) return;
    set((state) => ({
      branches: state.branches.map((b) => (b.id === branchId ? { ...b, status } : b)),
    }));
    get().logAdminActivity(
      actorName,
      `Branch Status → ${status}`,
      `Branch: ${target.name}`
    );
  },

  updateOperatingDay: (day, partial, actorName) => {
    set((state) => ({
      operatingHours: state.operatingHours.map((d) =>
        d.day === day ? { ...d, ...partial } : d
      ),
    }));
    get().logAdminActivity(
      actorName,
      'Updated Business Operating Hours',
      `Schedule: ${day}`
    );
  },

  addHolidayClosure: (payload, actorName) => {
    const newHol: HolidayClosure = {
      ...payload,
      id: `hol-${Date.now().toString().slice(-4)}`,
    };
    set((state) => ({
      holidays: [...state.holidays, newHol],
    }));
    get().logAdminActivity(
      actorName,
      'Scheduled Holiday / Temporary Closure',
      `${payload.title} (${payload.date})`
    );
  },

  removeHolidayClosure: (id, actorName) => {
    const target = get().holidays.find((h) => h.id === id);
    set((state) => ({
      holidays: state.holidays.filter((h) => h.id !== id),
    }));
    if (target) {
      get().logAdminActivity(
        actorName,
        'Removed Scheduled Closure',
        `${target.title} (${target.date})`
      );
    }
  },

  toggleTenantModule: (moduleKey, enabled, actorName) => {
    set((state) => {
      const next = enabled
        ? Array.from(new Set([...state.enabledModuleKeys, moduleKey]))
        : state.enabledModuleKeys.filter((k) => k !== moduleKey);
      return { enabledModuleKeys: next };
    });
    get().logAdminActivity(
      actorName,
      enabled ? 'Enabled Business Module' : 'Disabled Business Module',
      `Module: ${moduleKey}`
    );
  },

  saveUnitConfig: (unitPayload, actorName) => {
    const isEdit = Boolean(unitPayload.id);
    const id = unitPayload.id || `unt-${Date.now().toString().slice(-4)}`;
    const fullUnit: TenantUnitConfig = { ...unitPayload, id };
    set((state) => ({
      units: isEdit
        ? state.units.map((u) => (u.id === id ? fullUnit : u))
        : [...state.units, fullUnit],
    }));
    get().logAdminActivity(
      actorName,
      isEdit ? 'Updated Unit of Measurement' : 'Added Unit of Measurement',
      `${fullUnit.name} (${fullUnit.symbol})`
    );
  },

  toggleUnitActive: (unitId, actorName) => {
    const target = get().units.find((u) => u.id === unitId);
    if (!target) return;
    set((state) => ({
      units: state.units.map((u) =>
        u.id === unitId ? { ...u, isActive: !u.isActive } : u
      ),
    }));
    get().logAdminActivity(
      actorName,
      target.isActive ? 'Deactivated Unit of Measure' : 'Activated Unit of Measure',
      `${target.name} (${target.symbol})`
    );
  },

  updateSalesConfig: (partial, actorName) => {
    set((state) => ({
      salesConfig: { ...state.salesConfig, ...partial },
    }));
    get().logAdminActivity(
      actorName,
      'Updated Tenant Sales & POS Settings',
      `Modified: ${Object.keys(partial).join(', ')}`
    );
  },

  updateInventoryConfig: (partial, actorName) => {
    set((state) => ({
      inventoryConfig: { ...state.inventoryConfig, ...partial },
    }));
    get().logAdminActivity(
      actorName,
      'Updated Tenant Inventory & Expiry Rules',
      `Modified: ${Object.keys(partial).join(', ')}`
    );
  },

  updateNotificationPrefs: (partial, actorName) => {
    set((state) => ({
      notificationPrefs: { ...state.notificationPrefs, ...partial },
    }));
    get().logAdminActivity(
      actorName,
      'Updated Notification Preferences',
      `Modified: ${Object.keys(partial).join(', ')}`
    );
  },

  updateAccountSecurity: (partial, actorName) => {
    set((state) => ({
      accountSecurity: { ...state.accountSecurity, ...partial },
    }));
    get().logAdminActivity(
      actorName,
      'Updated Tenant Security Policy',
      `Modified: ${Object.keys(partial).join(', ')}`
    );
  },

  createCustomRole: (payload, actorName) => {
    const newRole: TenantRoleDefinition = {
      id: `role-${Date.now().toString().slice(-4)}`,
      name: payload.name.trim(),
      description: payload.description.trim(),
      isSystemTemplate: false,
      assignedEmployeesCount: 0,
      permissions: payload.permissions,
    };
    set((state) => ({
      roles: [...state.roles, newRole],
    }));
    get().logAdminActivity(
      actorName,
      'Created Custom Tenant Role',
      `Role: ${newRole.name} (${newRole.permissions.length} permissions)`
    );
    return newRole;
  },

  updateRolePermissions: (roleId, permissions, actorName) => {
    const target = get().roles.find((r) => r.id === roleId);
    if (!target) return { ok: false, error: 'Role not found.' };

    // Safeguard: Never allow Super Business Admin to strip their own role-management permission
    if (target.isSuperAdminRole && !permissions.includes('employees.roles')) {
      return {
        ok: false,
        error:
          'Cannot remove "Manage Roles & Permissions" from the Super Business Admin role — this would lock out tenant administration.',
      };
    }

    set((state) => ({
      roles: state.roles.map((r) =>
        r.id === roleId ? { ...r, permissions } : r
      ),
    }));
    get().logAdminActivity(
      actorName,
      'Updated Role Permission Matrix',
      `Role: ${target.name} (${permissions.length} permissions enabled)`
    );
    return { ok: true };
  },

  inviteOrCreateEmployee: (payload, actorName) => {
    const roleObj = get().roles.find((r) => r.id === payload.roleId) || get().roles[3];
    const branchObjs = get().branches.filter((b) => payload.branchIds.includes(b.id));
    const newEmp: TenantEmployeeRecord = {
      id: `emp-0${get().employees.length + 1}`,
      fullName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      roleId: roleObj.id,
      roleName: roleObj.name,
      branchIds: payload.branchIds,
      branchNames:
        branchObjs.length === get().branches.length
          ? ['All Branches']
          : branchObjs.map((b) => b.name),
      status: payload.status,
      lastLoginAt: payload.status === 'invited' ? 'Invitation Pending' : new Date().toISOString(),
      mfaEnabled: false,
    };

    set((state) => ({
      employees: [newEmp, ...state.employees],
      roles: state.roles.map((r) =>
        r.id === roleObj.id
          ? { ...r, assignedEmployeesCount: r.assignedEmployeesCount + 1 }
          : r
      ),
    }));
    get().logAdminActivity(
      actorName,
      payload.status === 'invited' ? 'Invited Employee' : 'Created Employee Account',
      `${newEmp.fullName} (${newEmp.roleName})`
    );
  },

  updateEmployeeAssignment: (employeeId, payload, actorName) => {
    const target = get().employees.find((e) => e.id === employeeId);
    if (!target) return { ok: false, error: 'Employee not found.' };

    // Prevent removing or deactivating the last active Super Business Admin
    const activeSuperAdmins = get().employees.filter(
      (e) => e.roleId === 'role-super-admin' && e.status === 'active'
    );
    const isTargetLastSuperAdmin =
      target.roleId === 'role-super-admin' &&
      target.status === 'active' &&
      activeSuperAdmins.length <= 1;

    if (
      isTargetLastSuperAdmin &&
      ((payload.roleId && payload.roleId !== 'role-super-admin') ||
        (payload.status && payload.status !== 'active'))
    ) {
      return {
        ok: false,
        error:
          'Cannot demote or deactivate the last active Super Business Admin for this business.',
      };
    }

    const nextRole = payload.roleId
      ? get().roles.find((r) => r.id === payload.roleId)
      : undefined;
    const nextBranchIds = payload.branchIds ?? target.branchIds;
    const branchObjs = get().branches.filter((b) => nextBranchIds.includes(b.id));

    set((state) => ({
      employees: state.employees.map((e) =>
        e.id === employeeId
          ? {
              ...e,
              roleId: nextRole ? nextRole.id : e.roleId,
              roleName: nextRole ? nextRole.name : e.roleName,
              branchIds: nextBranchIds,
              branchNames:
                branchObjs.length === state.branches.length
                  ? ['All Branches']
                  : branchObjs.map((b) => b.name),
              status: payload.status ?? e.status,
            }
          : e
      ),
    }));

    get().logAdminActivity(
      actorName,
      'Updated Employee Access / Role',
      `${target.fullName}`
    );
    return { ok: true };
  },
}));
