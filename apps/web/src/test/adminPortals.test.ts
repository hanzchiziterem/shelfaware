import { describe, expect, it } from 'vitest';
import { usePlatformAdminStore } from '@/store/platformAdminStore';
import { useSuperBusinessAdminStore } from '@/store/superBusinessAdminStore';

describe('ShelfAware Administrative Portals — Governance & Safeguards', () => {
  it('logs an immutable audit entry when Platform Admin verifies or suspends a tenant business', () => {
    const store = usePlatformAdminStore.getState();
    const initialAuditCount = store.auditLogs.length;

    store.decideBusinessVerification(
      'biz-02',
      'verified',
      'CAC RC-2049182 and FIRS TIN verified against registry.',
      'Tunde Bakare'
    );

    const updated = usePlatformAdminStore.getState();
    const targetBiz = updated.businesses.find((b) => b.id === 'biz-02');
    expect(targetBiz?.verificationStatus).toBe('verified');
    expect(updated.auditLogs.length).toBeGreaterThan(initialAuditCount);
    expect(updated.auditLogs[0].category).toBe('verification');
  });

  it('prevents Super Business Admin from removing the "employees.roles" permission from the owner role', () => {
    const sba = useSuperBusinessAdminStore.getState();
    const ownerRole = sba.roles.find((r) => r.isSuperAdminRole);
    expect(ownerRole).toBeDefined();

    const result = sba.updateRolePermissions(
      ownerRole!.id,
      ['inventory.view', 'sales.pos'], // missing 'employees.roles'
      'Adebayo Ogunlesi'
    );

    expect(result.ok).toBe(false);
    expect(result.error).toContain('Cannot remove "Manage Roles & Permissions"');
  });

  it('prevents deactivating or demoting the last active Super Business Admin for the tenant', () => {
    const sba = useSuperBusinessAdminStore.getState();
    const lastSuperAdminEmp = sba.employees.find((e) => e.roleId === 'role-super-admin');
    expect(lastSuperAdminEmp).toBeDefined();

    const deactivateAttempt = sba.updateEmployeeAssignment(
      lastSuperAdminEmp!.id,
      { status: 'inactive' },
      'Adebayo Ogunlesi'
    );
    expect(deactivateAttempt.ok).toBe(false);

    const demoteAttempt = sba.updateEmployeeAssignment(
      lastSuperAdminEmp!.id,
      { roleId: 'role-cashier' },
      'Adebayo Ogunlesi'
    );
    expect(demoteAttempt.ok).toBe(false);
  });

  it('allows creating a custom tenant role and logs the change in tenant access history', () => {
    const sba = useSuperBusinessAdminStore.getState();
    const prevHistoryCount = sba.accessHistory.length;

    const customRole = sba.createCustomRole(
      {
        name: 'Coldroom Supervisor',
        description: 'Manages frozen fish cartons, batch expiry checks, and PO receiving.',
        permissions: ['inventory.view', 'inventory.batches', 'purchases.receive'],
      },
      'Adebayo Ogunlesi'
    );

    const nextState = useSuperBusinessAdminStore.getState();
    expect(nextState.roles.some((r) => r.id === customRole.id)).toBe(true);
    expect(nextState.accessHistory.length).toBe(prevHistoryCount + 1);
  });
});
