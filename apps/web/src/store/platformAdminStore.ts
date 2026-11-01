import { create } from 'zustand';
import {
  INITIAL_GLOBAL_ROLE_TEMPLATES,
  INITIAL_PLATFORM_AUDIT_LOGS,
  INITIAL_PLATFORM_FEATURES,
  INITIAL_PLATFORM_PAYMENTS,
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_SYSTEM_HEALTH_NODES,
  INITIAL_TENANT_BUSINESSES,
  INITIAL_TENANT_SUBSCRIPTIONS,
} from '@/mocks/adminPortalsMockData';
import type {
  DatabaseTenancyStrategy,
  GlobalRoleTemplate,
  PlatformAuditLog,
  PlatformFeatureFlag,
  PlatformPaymentRecord,
  PlatformSupportTicket,
  ProvisioningState,
  SubscriptionPlanConfig,
  SystemServiceNode,
  TenantBusiness,
  TenantSubscriptionRecord,
  VerificationStatus,
} from '@/types/adminPortals';

export interface OnboardTenantPayload {
  businessName: string;
  businessType: string;
  tenantSlug: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  city: string;
  state: string;
  cacRegistrationNumber: string;
  taxIdentificationNumber: string;
  subscriptionPlanId: string;
  databaseStrategy: DatabaseTenancyStrategy;
  enabledModules: string[];
}

export interface PlatformSettingsConfig {
  platformSupportEmail: string;
  platformSupportPhone: string;
  defaultTrialDays: number;
  requireKybBeforeLivePos: boolean;
  allowSelfServiceRegistration: boolean;
  defaultSharedClusterRegion: string;
  maintenanceBannerMessage: string;
}

interface PlatformAdminState {
  businesses: TenantBusiness[];
  plans: SubscriptionPlanConfig[];
  subscriptions: TenantSubscriptionRecord[];
  payments: PlatformPaymentRecord[];
  roleTemplates: GlobalRoleTemplate[];
  features: PlatformFeatureFlag[];
  auditLogs: PlatformAuditLog[];
  supportTickets: PlatformSupportTicket[];
  systemHealthNodes: SystemServiceNode[];
  platformSettings: PlatformSettingsConfig;

  suspendOrReactivateBusiness: (
    tenantId: string,
    action: 'suspend' | 'reactivate',
    reason: string,
    actorName: string
  ) => void;
  decideBusinessVerification: (
    tenantId: string,
    nextStatus: VerificationStatus,
    notes: string,
    actorName: string
  ) => void;
  onboardNewBusiness: (payload: OnboardTenantPayload, actorName: string) => TenantBusiness;
  advanceProvisioningState: (tenantId: string, nextState: ProvisioningState, actorName: string) => void;
  saveSubscriptionPlan: (
    plan: Omit<SubscriptionPlanConfig, 'id'> & { id?: string },
    actorName: string
  ) => void;
  changeTenantPlan: (tenantId: string, newPlanId: string, actorName: string) => void;
  toggleGlobalFeature: (featureId: string, globallyEnabled: boolean, actorName: string) => void;
  updateFeatureEligiblePlans: (
    featureId: string,
    eligiblePlanCodes: Array<'starter' | 'growth' | 'enterprise'>,
    actorName: string
  ) => void;
  updateRoleTemplatePermissions: (
    templateId: string,
    permissions: string[],
    actorName: string
  ) => void;
  createGlobalRoleTemplate: (
    payload: { name: string; code: string; description: string; permissions: string[] },
    actorName: string
  ) => void;
  updateSupportTicketStatus: (
    ticketId: string,
    status: PlatformSupportTicket['status'],
    actorName: string
  ) => void;
  updatePlatformSettings: (
    partial: Partial<PlatformSettingsConfig>,
    actorName: string
  ) => void;
}

export const usePlatformAdminStore = create<PlatformAdminState>((set, get) => ({
  businesses: INITIAL_TENANT_BUSINESSES,
  plans: INITIAL_SUBSCRIPTION_PLANS,
  subscriptions: INITIAL_TENANT_SUBSCRIPTIONS,
  payments: INITIAL_PLATFORM_PAYMENTS,
  roleTemplates: INITIAL_GLOBAL_ROLE_TEMPLATES,
  features: INITIAL_PLATFORM_FEATURES,
  auditLogs: INITIAL_PLATFORM_AUDIT_LOGS,
  supportTickets: INITIAL_SUPPORT_TICKETS,
  systemHealthNodes: INITIAL_SYSTEM_HEALTH_NODES,
  platformSettings: {
    platformSupportEmail: 'platform-ops@shelfaware.ng',
    platformSupportPhone: '+234 700 SHELFAWARE',
    defaultTrialDays: 14,
    requireKybBeforeLivePos: false,
    allowSelfServiceRegistration: true,
    defaultSharedClusterRegion: 'af-south-1 (West Africa Primary Pool)',
    maintenanceBannerMessage: '',
  },

  suspendOrReactivateBusiness: (tenantId, action, reason, actorName) => {
    const nowIso = new Date().toISOString();
    const target = get().businesses.find((b) => b.id === tenantId);
    if (!target) return;

    const nextStatus = action === 'suspend' ? 'suspended' : 'active';
    const logEntry: PlatformAuditLog = {
      id: `aud-${Date.now().toString().slice(-5)}`,
      actorName,
      actorRole: 'Platform Admin',
      action: action === 'suspend' ? 'Suspended Tenant Account' : 'Reactivated Tenant Account',
      category: 'business_lifecycle',
      targetResource: `${target.businessName} (${target.id})`,
      details: reason || `Tenant account status set to ${nextStatus}.`,
      createdAt: nowIso,
    };

    set((state) => ({
      businesses: state.businesses.map((b) =>
        b.id === tenantId ? { ...b, accountStatus: nextStatus } : b
      ),
      auditLogs: [logEntry, ...state.auditLogs],
    }));
  },

  decideBusinessVerification: (tenantId, nextStatus, notes, actorName) => {
    const nowIso = new Date().toISOString();
    const target = get().businesses.find((b) => b.id === tenantId);
    if (!target) return;

    const logEntry: PlatformAuditLog = {
      id: `aud-${Date.now().toString().slice(-5)}`,
      actorName,
      actorRole: 'Platform Admin',
      action: `Verification Status → ${nextStatus.toUpperCase()}`,
      category: 'verification',
      targetResource: `${target.businessName} (${target.id})`,
      details: notes || `Updated KYB verification decision to ${nextStatus}.`,
      createdAt: nowIso,
    };

    set((state) => ({
      businesses: state.businesses.map((b) =>
        b.id === tenantId
          ? {
              ...b,
              verificationStatus: nextStatus,
              verifiedBy: actorName,
              verificationNotes: notes || b.verificationNotes,
            }
          : b
      ),
      auditLogs: [logEntry, ...state.auditLogs],
    }));
  },

  onboardNewBusiness: (payload, actorName) => {
    const nowIso = new Date().toISOString();
    const plan =
      get().plans.find((p) => p.id === payload.subscriptionPlanId) || get().plans[1];
    const cleanSlug = payload.tenantSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    const newTenant: TenantBusiness = {
      id: `biz-0${get().businesses.length + 1}`,
      businessName: payload.businessName.trim(),
      businessType: payload.businessType,
      tenantSlug: cleanSlug,
      subdomain: `${cleanSlug}.shelfaware.ng`,
      primaryContactName: payload.primaryContactName.trim(),
      primaryContactEmail: payload.primaryContactEmail.trim().toLowerCase(),
      primaryContactPhone: payload.primaryContactPhone.trim(),
      city: payload.city.trim(),
      state: payload.state.trim(),
      registeredAt: nowIso,
      verificationStatus: 'pending',
      cacRegistrationNumber: payload.cacRegistrationNumber || 'Pending Submission',
      taxIdentificationNumber: payload.taxIdentificationNumber || 'Pending Submission',
      submittedDocuments: [],
      subscriptionPlanId: plan.id,
      subscriptionPlanName: plan.name,
      subscriptionStatus: 'pending',
      mrrContribution: 0,
      databaseStrategy: payload.databaseStrategy,
      provisioningStatus: 'queued',
      connectionRef:
        payload.databaseStrategy === 'dedicated_instance'
          ? `rds-dedicated-pending :: db[shelfaware_${cleanSlug.replace(/-/g, '_')}]`
          : `pg-pool-west-africa-01 :: schema[tenant_${cleanSlug.replace(/-/g, '_')}]`,
      lastProvisionedAt: nowIso,
      accountStatus: 'onboarding',
      branchesCount: 1,
      employeesCount: 1,
      enabledModules: payload.enabledModules,
    };

    const newSub: TenantSubscriptionRecord = {
      id: `sub-0${get().subscriptions.length + 1}`,
      tenantId: newTenant.id,
      businessName: newTenant.businessName,
      planId: plan.id,
      planName: plan.name,
      billingInterval: plan.billingInterval,
      amount: plan.price,
      status: 'pending',
      startDate: nowIso.slice(0, 10),
      renewalDate: '2026-11-30',
      autoRenew: true,
    };

    const logEntry: PlatformAuditLog = {
      id: `aud-${Date.now().toString().slice(-5)}`,
      actorName,
      actorRole: 'Platform Admin',
      action: 'Initiated Assisted Tenant Onboarding',
      category: 'provisioning',
      targetResource: `${newTenant.businessName} (${newTenant.tenantSlug})`,
      details: `Queued ${payload.databaseStrategy} provisioning on ${plan.name} plan; initial Super Business Admin (${newTenant.primaryContactEmail}) staged.`,
      createdAt: nowIso,
    };

    set((state) => ({
      businesses: [newTenant, ...state.businesses],
      subscriptions: [newSub, ...state.subscriptions],
      auditLogs: [logEntry, ...state.auditLogs],
    }));

    return newTenant;
  },

  advanceProvisioningState: (tenantId, nextState, actorName) => {
    const nowIso = new Date().toISOString();
    const target = get().businesses.find((b) => b.id === tenantId);
    if (!target) return;

    const plan = get().plans.find((p) => p.id === target.subscriptionPlanId);
    const isNowReady = nextState === 'ready';

    const logEntry: PlatformAuditLog = {
      id: `aud-${Date.now().toString().slice(-5)}`,
      actorName,
      actorRole: 'Platform Admin',
      action: `Provisioning Step → ${nextState.toUpperCase()}`,
      category: 'provisioning',
      targetResource: `${target.businessName} (${target.connectionRef})`,
      details: isNowReady
        ? 'Database schema migrations and initial Super Business Admin role seed completed.'
        : `Updated tenant provisioning pipeline stage to ${nextState}.`,
      createdAt: nowIso,
    };

    set((state) => ({
      businesses: state.businesses.map((b) =>
        b.id === tenantId
          ? {
              ...b,
              provisioningStatus: nextState,
              lastProvisionedAt: nowIso,
              accountStatus: isNowReady ? 'active' : b.accountStatus,
              subscriptionStatus:
                isNowReady && b.subscriptionStatus === 'pending'
                  ? 'trialing'
                  : b.subscriptionStatus,
              mrrContribution: isNowReady && plan ? plan.price : b.mrrContribution,
            }
          : b
      ),
      subscriptions: state.subscriptions.map((s) =>
        s.tenantId === tenantId && isNowReady && s.status === 'pending'
          ? { ...s, status: 'trialing' }
          : s
      ),
      auditLogs: [logEntry, ...state.auditLogs],
    }));
  },

  saveSubscriptionPlan: (planPayload, actorName) => {
    const nowIso = new Date().toISOString();
    const isExisting = Boolean(planPayload.id);
    const planId = planPayload.id || `plan-${Date.now().toString().slice(-4)}`;
    const fullPlan: SubscriptionPlanConfig = {
      ...planPayload,
      id: planId,
    };

    const logEntry: PlatformAuditLog = {
      id: `aud-${Date.now().toString().slice(-5)}`,
      actorName,
      actorRole: 'Platform Admin',
      action: isExisting ? 'Updated Subscription Plan' : 'Created Subscription Plan',
      category: 'subscription',
      targetResource: `${fullPlan.name} (₦${fullPlan.price.toLocaleString()}/${fullPlan.billingInterval})`,
      details: `Max branches: ${fullPlan.maxBranches}, Max employees: ${fullPlan.maxEmployees}, Modules: ${fullPlan.includedModules.length}.`,
      createdAt: nowIso,
    };

    set((state) => ({
      plans: isExisting
        ? state.plans.map((p) => (p.id === planId ? fullPlan : p))
        : [...state.plans, fullPlan],
      auditLogs: [logEntry, ...state.auditLogs],
    }));
  },

  changeTenantPlan: (tenantId, newPlanId, actorName) => {
    const nowIso = new Date().toISOString();
    const target = get().businesses.find((b) => b.id === tenantId);
    const newPlan = get().plans.find((p) => p.id === newPlanId);
    if (!target || !newPlan) return;

    const logEntry: PlatformAuditLog = {
      id: `aud-${Date.now().toString().slice(-5)}`,
      actorName,
      actorRole: 'Platform Admin',
      action: 'Changed Tenant Subscription Plan',
      category: 'subscription',
      targetResource: `${target.businessName} (${target.id})`,
      details: `Reassigned plan from ${target.subscriptionPlanName} to ${newPlan.name}.`,
      createdAt: nowIso,
    };

    set((state) => ({
      businesses: state.businesses.map((b) =>
        b.id === tenantId
          ? {
              ...b,
              subscriptionPlanId: newPlan.id,
              subscriptionPlanName: newPlan.name,
              mrrContribution: newPlan.price,
            }
          : b
      ),
      subscriptions: state.subscriptions.map((s) =>
        s.tenantId === tenantId
          ? {
              ...s,
              planId: newPlan.id,
              planName: newPlan.name,
              amount: newPlan.price,
            }
          : s
      ),
      auditLogs: [logEntry, ...state.auditLogs],
    }));
  },

  toggleGlobalFeature: (featureId, globallyEnabled, actorName) => {
    const nowIso = new Date().toISOString();
    const target = get().features.find((f) => f.id === featureId);
    if (!target) return;

    const logEntry: PlatformAuditLog = {
      id: `aud-${Date.now().toString().slice(-5)}`,
      actorName,
      actorRole: 'Platform Admin',
      action: globallyEnabled ? 'Enabled Global Feature Flag' : 'Disabled Global Feature Flag',
      category: 'feature_flag',
      targetResource: `${target.name} (${target.key})`,
      details: `Global availability set to ${globallyEnabled ? 'ENABLED' : 'DISABLED'} across all ShelfAware tenants.`,
      createdAt: nowIso,
    };

    set((state) => ({
      features: state.features.map((f) =>
        f.id === featureId
          ? { ...f, globallyEnabled, updatedBy: actorName, updatedAt: nowIso }
          : f
      ),
      auditLogs: [logEntry, ...state.auditLogs],
    }));
  },

  updateFeatureEligiblePlans: (featureId, eligiblePlanCodes, actorName) => {
    const nowIso = new Date().toISOString();
    const target = get().features.find((f) => f.id === featureId);
    if (!target) return;

    const logEntry: PlatformAuditLog = {
      id: `aud-${Date.now().toString().slice(-5)}`,
      actorName,
      actorRole: 'Platform Admin',
      action: 'Updated Feature Plan Entitlements',
      category: 'feature_flag',
      targetResource: `${target.name} (${target.key})`,
      details: `Eligible plans updated to: ${eligiblePlanCodes.join(', ')}.`,
      createdAt: nowIso,
    };

    set((state) => ({
      features: state.features.map((f) =>
        f.id === featureId
          ? { ...f, eligiblePlanCodes, updatedBy: actorName, updatedAt: nowIso }
          : f
      ),
      auditLogs: [logEntry, ...state.auditLogs],
    }));
  },

  updateRoleTemplatePermissions: (templateId, permissions, actorName) => {
    const nowIso = new Date().toISOString();
    const tpl = get().roleTemplates.find((r) => r.id === templateId);
    if (!tpl) return;

    const logEntry: PlatformAuditLog = {
      id: `aud-${Date.now().toString().slice(-5)}`,
      actorName,
      actorRole: 'Platform Admin',
      action: 'Updated Global Role Template',
      category: 'security',
      targetResource: `Template: ${tpl.name}`,
      details: `Configured ${permissions.length} standard permission keys for new tenant provisioning.`,
      createdAt: nowIso,
    };

    set((state) => ({
      roleTemplates: state.roleTemplates.map((r) =>
        r.id === templateId ? { ...r, permissions, updatedAt: nowIso } : r
      ),
      auditLogs: [logEntry, ...state.auditLogs],
    }));
  },

  createGlobalRoleTemplate: (payload, actorName) => {
    const nowIso = new Date().toISOString();
    const newTpl: GlobalRoleTemplate = {
      id: `tpl-${Date.now().toString().slice(-4)}`,
      name: payload.name.trim(),
      code: payload.code.trim().toLowerCase().replace(/\s+/g, '_'),
      description: payload.description.trim(),
      isSystemDefault: false,
      permissions: payload.permissions,
      updatedAt: nowIso,
    };

    const logEntry: PlatformAuditLog = {
      id: `aud-${Date.now().toString().slice(-5)}`,
      actorName,
      actorRole: 'Platform Admin',
      action: 'Created Global Role Template',
      category: 'security',
      targetResource: `Template: ${newTpl.name}`,
      details: `Added platform-level starting role template with ${newTpl.permissions.length} permissions.`,
      createdAt: nowIso,
    };

    set((state) => ({
      roleTemplates: [...state.roleTemplates, newTpl],
      auditLogs: [logEntry, ...state.auditLogs],
    }));
  },

  updateSupportTicketStatus: (ticketId, status, actorName) => {
    const nowIso = new Date().toISOString();
    const ticket = get().supportTickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const logEntry: PlatformAuditLog = {
      id: `aud-${Date.now().toString().slice(-5)}`,
      actorName,
      actorRole: 'Platform Admin',
      action: `Support Ticket Status → ${status.toUpperCase()}`,
      category: 'security',
      targetResource: `${ticket.ticketNumber} (${ticket.businessName})`,
      details: ticket.subject,
      createdAt: nowIso,
    };

    set((state) => ({
      supportTickets: state.supportTickets.map((t) =>
        t.id === ticketId ? { ...t, status, lastUpdatedAt: nowIso } : t
      ),
      auditLogs: [logEntry, ...state.auditLogs],
    }));
  },

  updatePlatformSettings: (partial, actorName) => {
    const nowIso = new Date().toISOString();
    const logEntry: PlatformAuditLog = {
      id: `aud-${Date.now().toString().slice(-5)}`,
      actorName,
      actorRole: 'Platform Admin',
      action: 'Updated Global Platform Settings',
      category: 'security',
      targetResource: 'ShelfAware Global Control Plane',
      details: `Modified keys: ${Object.keys(partial).join(', ')}.`,
      createdAt: nowIso,
    };

    set((state) => ({
      platformSettings: { ...state.platformSettings, ...partial },
      auditLogs: [logEntry, ...state.auditLogs],
    }));
  },
}));
