import type { UnitOfMeasure } from './common';

export type AdminPortalMode = 'operations' | 'business_admin' | 'platform_admin';

export type VerificationStatus = 'pending' | 'under_review' | 'verified' | 'rejected';

export type SubscriptionLifecycleStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'expired'
  | 'cancelled'
  | 'pending';

export type DatabaseTenancyStrategy = 'shared_schema' | 'dedicated_instance';

export type ProvisioningState =
  | 'queued'
  | 'provisioning_db'
  | 'applying_migrations'
  | 'seeding_defaults'
  | 'ready'
  | 'failed';

export type TenantAccountStatus = 'active' | 'suspended' | 'onboarding' | 'deactivated';

export interface TenantBusiness {
  id: string;
  businessName: string;
  businessType: string;
  tenantSlug: string;
  subdomain: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  city: string;
  state: string;
  registeredAt: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verificationNotes?: string;
  cacRegistrationNumber: string;
  taxIdentificationNumber: string;
  submittedDocuments: Array<{
    id: string;
    title: string;
    fileType: string;
    uploadedAt: string;
  }>;
  subscriptionPlanId: string;
  subscriptionPlanName: string;
  subscriptionStatus: SubscriptionLifecycleStatus;
  mrrContribution: number;
  databaseStrategy: DatabaseTenancyStrategy;
  provisioningStatus: ProvisioningState;
  connectionRef: string;
  lastProvisionedAt: string;
  accountStatus: TenantAccountStatus;
  branchesCount: number;
  employeesCount: number;
  enabledModules: string[];
}

export interface SubscriptionPlanConfig {
  id: string;
  name: string;
  code: 'starter' | 'growth' | 'enterprise';
  description: string;
  billingInterval: 'monthly' | 'annual';
  price: number;
  includedModules: string[];
  maxBranches: number;
  maxEmployees: number;
  allowedDatabaseStrategies: DatabaseTenancyStrategy[];
  status: 'active' | 'archived';
}

export interface TenantSubscriptionRecord {
  id: string;
  tenantId: string;
  businessName: string;
  planId: string;
  planName: string;
  billingInterval: 'monthly' | 'annual';
  amount: number;
  status: SubscriptionLifecycleStatus;
  startDate: string;
  renewalDate: string;
  autoRenew: boolean;
}

export interface PlatformPaymentRecord {
  id: string;
  reference: string;
  tenantId: string;
  businessName: string;
  planName: string;
  amount: number;
  gateway: 'Paystack' | 'Flutterwave' | 'Bank Wire';
  status: 'succeeded' | 'failed' | 'pending';
  failureReason?: string;
  retryCount?: number;
  createdAt: string;
}

export interface GlobalRoleTemplate {
  id: string;
  name: string;
  code: string;
  description: string;
  isSystemDefault: boolean;
  permissions: string[];
  updatedAt: string;
}

export interface PlatformFeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  category: 'core_retail' | 'inventory_supply' | 'finance_analytics' | 'multi_branch';
  globallyEnabled: boolean;
  eligiblePlanCodes: Array<'starter' | 'growth' | 'enterprise'>;
  updatedBy: string;
  updatedAt: string;
}

export interface PlatformAuditLog {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  category:
    | 'business_lifecycle'
    | 'verification'
    | 'subscription'
    | 'provisioning'
    | 'security'
    | 'feature_flag';
  targetResource: string;
  details: string;
  createdAt: string;
}

export interface PlatformSupportTicket {
  id: string;
  ticketNumber: string;
  tenantId: string;
  businessName: string;
  subject: string;
  category: 'billing' | 'provisioning' | 'pos_sync' | 'verification' | 'permissions';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  assignedTo: string;
  createdAt: string;
  lastUpdatedAt: string;
}

export interface SystemServiceNode {
  id: string;
  serviceName: string;
  scope: string;
  reportedState: 'operational' | 'degraded' | 'telemetry_unconnected';
  latencyNote: string;
  lastCheckedAt: string;
}

/**
 * Super Business Admin (Single-Tenant Administration) Types
 */
export interface BusinessBranch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  managerName: string;
  assignedEmployeesCount: number;
  status: 'active' | 'inactive' | 'temporary_closure';
  isPrimary: boolean;
}

export interface OperatingDaySchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface HolidayClosure {
  id: string;
  title: string;
  date: string;
  branchScope: string;
  notes?: string;
}

export interface TenantUnitConfig {
  id: string;
  name: string;
  symbol: UnitOfMeasure | string;
  allowDecimals: boolean;
  usageExample: string;
  isActive: boolean;
}

export interface TenantPermissionDefinition {
  key: string;
  label: string;
  module: 'Inventory' | 'Sales & POS' | 'Products' | 'Purchases & Suppliers' | 'Employees & Access' | 'Finance & Reports';
  description: string;
}

export interface TenantRoleDefinition {
  id: string;
  name: string;
  description: string;
  isSystemTemplate: boolean;
  isSuperAdminRole?: boolean;
  assignedEmployeesCount: number;
  permissions: string[];
}

export interface TenantEmployeeRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  roleId: string;
  roleName: string;
  branchIds: string[];
  branchNames: string[];
  status: 'active' | 'invited' | 'inactive';
  lastLoginAt: string;
  mfaEnabled: boolean;
}

export interface AccessHistoryEntry {
  id: string;
  userName: string;
  userRole: string;
  branchName: string;
  activity: string;
  resource: string;
  ipReference: string;
  timestamp: string;
}
