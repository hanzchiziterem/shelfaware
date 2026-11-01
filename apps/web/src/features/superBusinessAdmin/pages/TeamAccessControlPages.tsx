import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { TENANT_PERMISSION_CATALOG } from '@/mocks/adminPortalsMockData';
import { useAuthStore } from '@/store/authStore';
import { useSuperBusinessAdminStore } from '@/store/superBusinessAdminStore';
import { useUiStore } from '@/store/uiStore';
import type { TenantEmployeeRecord, TenantPermissionDefinition } from '@/types/adminPortals';
import { formatFullDateTime } from '@/utils/dates';
import styles from '@/features/platformAdmin/pages/PlatformAdmin.module.css';

const PERMISSION_MODULES: Array<TenantPermissionDefinition['module']> = [
  'Inventory',
  'Sales & POS',
  'Products',
  'Purchases & Suppliers',
  'Employees & Access',
  'Finance & Reports',
];

/**
 * 1. Employees (`/business-admin/employees`)
 */
export function EmployeesManagementPage() {
  const user = useAuthStore((s) => s.user);
  const employees = useSuperBusinessAdminStore((s) => s.employees);
  const roles = useSuperBusinessAdminStore((s) => s.roles);
  const branches = useSuperBusinessAdminStore((s) => s.branches);
  const inviteOrCreateEmployee = useSuperBusinessAdminStore((s) => s.inviteOrCreateEmployee);
  const updateEmployeeAssignment = useSuperBusinessAdminStore((s) => s.updateEmployeeAssignment);
  const pushToast = useUiStore((s) => s.pushToast);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<TenantEmployeeRecord | null>(null);

  // Invite form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+234 80');
  const [selectedRoleId, setSelectedRoleId] = useState(roles[1]?.id || 'role-business-admin');
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>(['br-01']);
  const [inviteMode, setInviteMode] = useState<'active' | 'invited'>('invited');

  // Edit assignment state
  const [editRoleId, setEditRoleId] = useState('');
  const [editBranchIds, setEditBranchIds] = useState<string[]>([]);
  const [editStatus, setEditStatus] = useState<TenantEmployeeRecord['status']>('active');

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((emp) => {
      if (roleFilter !== 'all' && emp.roleId !== roleFilter) return false;
      if (!q) return true;
      return (
        emp.fullName.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.roleName.toLowerCase().includes(q)
      );
    });
  }, [employees, search, roleFilter]);

  const handleInviteSubmit = () => {
    if (!fullName.trim() || !email.trim() || selectedBranchIds.length === 0) return;
    inviteOrCreateEmployee(
      {
        fullName,
        email,
        phone,
        roleId: selectedRoleId,
        branchIds: selectedBranchIds,
        status: inviteMode,
      },
      user?.fullName || 'Adebayo Ogunlesi'
    );
    pushToast({
      title: inviteMode === 'invited' ? 'Employee invitation sent' : 'Employee account created',
      description: `${fullName.trim()} assigned to ${selectedBranchIds.length} branch(es).`,
      tone: 'success',
    });
    setFullName('');
    setEmail('');
    setInviteOpen(false);
  };

  const openEditModal = (emp: TenantEmployeeRecord) => {
    setEditingEmployee(emp);
    setEditRoleId(emp.roleId);
    setEditBranchIds(emp.branchIds);
    setEditStatus(emp.status);
  };

  const handleSaveEdit = () => {
    if (!editingEmployee) return;
    const result = updateEmployeeAssignment(
      editingEmployee.id,
      {
        roleId: editRoleId,
        branchIds: editBranchIds,
        status: editStatus,
      },
      user?.fullName || 'Adebayo Ogunlesi'
    );
    if (!result.ok) {
      pushToast({
        title: 'Action blocked by safety policy',
        description: result.error,
        tone: 'error',
      });
      return;
    }
    pushToast({
      title: 'Employee access updated',
      description: `Updated role and branch permissions for ${editingEmployee.fullName}.`,
      tone: 'success',
    });
    setEditingEmployee(null);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>Super Business Admin • Team & Access Control</div>
          <h1 className={styles.title}>Employees & Branch Assignments</h1>
          <p className={styles.subtitle}>
            Invite employees, assign custom or system roles, scope branch access, and manage account status.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" size="md" onClick={() => setInviteOpen(true)}>
            + Invite / Add Employee
          </Button>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.filterBar}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search employee name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className={styles.select}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Assigned Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Assigned Role</th>
                <th>Branch Scope</th>
                <th>2FA / MFA</th>
                <th>Status</th>
                <th>Last Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div className={styles.primaryText}>{emp.fullName}</div>
                    <div className={styles.secondaryText}>
                      {emp.email} • {emp.phone}
                    </div>
                  </td>
                  <td>
                    <span className={styles.tag}>{emp.roleName}</span>
                  </td>
                  <td>
                    <div className={styles.tagList}>
                      {emp.branchNames.map((b) => (
                        <span key={b} className={styles.codePill}>
                          {b}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <StatusIndicator
                      tone={emp.mfaEnabled ? 'success' : 'neutral'}
                      label={emp.mfaEnabled ? 'Enabled' : 'Standard'}
                    />
                  </td>
                  <td>
                    <StatusIndicator
                      tone={
                        emp.status === 'active'
                          ? 'success'
                          : emp.status === 'invited'
                            ? 'warning'
                            : 'danger'
                      }
                      label={emp.status}
                    />
                  </td>
                  <td className={styles.mono}>
                    {emp.lastLoginAt === 'Invitation Pending'
                      ? 'Invitation Pending'
                      : formatFullDateTime(emp.lastLoginAt)}
                  </td>
                  <td>
                    <Button variant="secondary" size="sm" onClick={() => openEditModal(emp)}>
                      Manage Access
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite or Create Employee Account"
        size="md"
      >
        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Full Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Halima Abdullahi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Work Email Address</label>
            <input
              type="email"
              className={styles.input}
              placeholder="halima@oluwafoodmart.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Phone Number</label>
            <input
              type="text"
              className={styles.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Assign Business Role</label>
            <select
              className={styles.select}
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.permissions.length} permissions)
                </option>
              ))}
            </select>
          </div>
          <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
            <label className={styles.label}>Onboarding Mode</label>
            <select
              className={styles.select}
              value={inviteMode}
              onChange={(e) => setInviteMode(e.target.value as 'active' | 'invited')}
            >
              <option value="invited">Send Email Invitation Link</option>
              <option value="active">Activate Immediately (In-Store Terminal Setup)</option>
            </select>
          </div>
          <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
            <label className={styles.label}>Permitted Store Branches</label>
            <div className={styles.permGrid}>
              {branches.map((b) => {
                const checked = selectedBranchIds.includes(b.id);
                return (
                  <label key={b.id} className={styles.permItem}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setSelectedBranchIds((prev) =>
                          checked ? prev.filter((id) => id !== b.id) : [...prev, b.id]
                        );
                      }}
                    />
                    <div>
                      <span className={styles.permLabel}>{b.name}</span>
                      <span className={styles.permCategory}>{b.code}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <Button variant="secondary" size="sm" onClick={() => setInviteOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleInviteSubmit}>
            {inviteMode === 'invited' ? 'Send Invitation' : 'Create Active Account'}
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(editingEmployee)}
        onClose={() => setEditingEmployee(null)}
        title={editingEmployee ? `Manage Access — ${editingEmployee.fullName}` : 'Manage Employee'}
        size="md"
      >
        {editingEmployee && (
          <>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Assigned Role</label>
                <select
                  className={styles.select}
                  value={editRoleId}
                  onChange={(e) => setEditRoleId(e.target.value)}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Account Status</label>
                <select
                  className={styles.select}
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as TenantEmployeeRecord['status'])
                  }
                >
                  <option value="active">Active</option>
                  <option value="invited">Invited (Pending)</option>
                  <option value="inactive">Deactivated / Suspended</option>
                </select>
              </div>
              <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                <label className={styles.label}>Assigned Store Branches</label>
                <div className={styles.permGrid}>
                  {branches.map((b) => {
                    const checked = editBranchIds.includes(b.id);
                    return (
                      <label key={b.id} className={styles.permItem}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setEditBranchIds((prev) =>
                              checked ? prev.filter((id) => id !== b.id) : [...prev, b.id]
                            );
                          }}
                        />
                        <div>
                          <span className={styles.permLabel}>{b.name}</span>
                          <span className={styles.permCategory}>{b.code}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button variant="secondary" size="sm" onClick={() => setEditingEmployee(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                Save Employee Access
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
}

/**
 * 2. Roles & Permissions (`/business-admin/roles`)
 * Interactive permission matrix organized by module + custom role creation.
 */
export function RolesPermissionsMatrixPage() {
  const user = useAuthStore((s) => s.user);
  const roles = useSuperBusinessAdminStore((s) => s.roles);
  const createCustomRole = useSuperBusinessAdminStore((s) => s.createCustomRole);
  const updateRolePermissions = useSuperBusinessAdminStore((s) => s.updateRolePermissions);
  const pushToast = useUiStore((s) => s.pushToast);

  const [selectedRoleId, setSelectedRoleId] = useState(roles[1]?.id || roles[0].id);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRolePerms, setNewRolePerms] = useState<string[]>([
    'inventory.view',
    'products.view',
  ]);

  const activeRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  const handleTogglePermission = (permKey: string) => {
    const hasPerm = activeRole.permissions.includes(permKey);
    const nextPerms = hasPerm
      ? activeRole.permissions.filter((p) => p !== permKey)
      : [...activeRole.permissions, permKey];

    const res = updateRolePermissions(
      activeRole.id,
      nextPerms,
      user?.fullName || 'Adebayo Ogunlesi'
    );
    if (!res.ok) {
      pushToast({
        title: 'Permission safeguard triggered',
        description: res.error,
        tone: 'error',
      });
      return;
    }
    pushToast({
      title: `Updated ${activeRole.name}`,
      description: `${hasPerm ? 'Removed' : 'Granted'} "${permKey}" permission.`,
      tone: 'info',
    });
  };

  const handleCreateCustomRole = () => {
    if (!newRoleName.trim()) return;
    const created = createCustomRole(
      {
        name: newRoleName,
        description:
          newRoleDesc || 'Custom business role scoped to Oluwa & Sons Foodstuff Mart',
        permissions: newRolePerms,
      },
      user?.fullName || 'Adebayo Ogunlesi'
    );
    setSelectedRoleId(created.id);
    setNewRoleName('');
    setNewRoleDesc('');
    setCreateModalOpen(false);
    pushToast({
      title: 'Custom role created',
      description: `${created.name} is now available for employee assignment.`,
      tone: 'success',
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>Super Business Admin • Team & Access Control</div>
          <h1 className={styles.title}>Roles & Permission Matrix</h1>
          <p className={styles.subtitle}>
            Configure granular module permissions for default and custom roles within your business.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" size="md" onClick={() => setCreateModalOpen(true)}>
            + Create Custom Role
          </Button>
        </div>
      </header>

      <div className={styles.bannerInfo}>
        <strong>Tenant Privilege Boundary:</strong> Roles created or modified here apply only to your
        business and can only grant permissions within your enabled subscription modules. Platform-level
        administrative permissions cannot be assigned.
      </div>

      {/* Role Selector Cards */}
      <section className={styles.kpiGrid}>
        {roles.map((role) => {
          const isSelected = role.id === activeRole.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRoleId(role.id)}
              className={styles.kpiCard}
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--color-accent)' : undefined,
                boxShadow: isSelected ? '0 0 0 2px rgba(20, 30, 56, 0.12)' : undefined,
              }}
            >
              <div className={styles.rowActions} style={{ justifyContent: 'space-between' }}>
                <span className={styles.kpiLabel}>
                  {role.isSystemTemplate ? 'System Template' : 'Custom Role'}
                </span>
                <span className={styles.codePill}>{role.assignedEmployeesCount} staff</span>
              </div>
              <span className={styles.kpiValue} style={{ fontSize: '16px' }}>
                {role.name}
              </span>
              <span className={styles.kpiSub}>
                {role.permissions.length} of {TENANT_PERMISSION_CATALOG.length} permissions enabled
              </span>
            </button>
          );
        })}
      </section>

      {/* Active Role Permission Matrix by Module */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>
              Permission Matrix — {activeRole.name}{' '}
              {activeRole.isSuperAdminRole ? '(Tenant Owner Role)' : ''}
            </h2>
            <p className={styles.cardSubtitle}>{activeRole.description}</p>
          </div>
          <div className={styles.rowActions}>
            <span className={styles.tag}>
              {activeRole.permissions.length} / {TENANT_PERMISSION_CATALOG.length} Active
            </span>
          </div>
        </div>
        <div className={styles.cardBody}>
          {PERMISSION_MODULES.map((modName) => {
            const categoryPerms = TENANT_PERMISSION_CATALOG.filter(
              (p) => p.module === modName
            );
            return (
              <div key={modName} className={styles.matrixSection}>
                <div className={styles.matrixHeader}>
                  <span>{modName}</span>
                  <span>
                    {
                      categoryPerms.filter((p) => activeRole.permissions.includes(p.key))
                        .length
                    }{' '}
                    / {categoryPerms.length} enabled
                  </span>
                </div>
                <div className={styles.permGrid}>
                  {categoryPerms.map((perm) => {
                    const checked = activeRole.permissions.includes(perm.key);
                    const lockedForSuperAdmin =
                      activeRole.isSuperAdminRole && perm.key === 'employees.roles';

                    return (
                      <label
                        key={perm.key}
                        className={styles.permItem}
                        style={{
                          opacity: lockedForSuperAdmin ? 0.85 : 1,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={lockedForSuperAdmin}
                          onChange={() => handleTogglePermission(perm.key)}
                        />
                        <div>
                          <span className={styles.permLabel}>
                            {perm.label}{' '}
                            {lockedForSuperAdmin ? '(Locked for Owner Safety)' : ''}
                          </span>
                          <span className={styles.permCategory}>{perm.description}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Dialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Custom Business Role"
        size="lg"
      >
        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Custom Role Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Shift Supervisor / Procurement Clerk"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Role Responsibility Summary</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Describe what staff in this role can perform"
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
            />
          </div>
          <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
            <label className={styles.label}>
              Select Initial Permissions ({newRolePerms.length} selected)
            </label>
            <div className={styles.permGrid}>
              {TENANT_PERMISSION_CATALOG.map((perm) => {
                const checked = newRolePerms.includes(perm.key);
                return (
                  <label key={perm.key} className={styles.permItem}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setNewRolePerms((prev) =>
                          checked
                            ? prev.filter((k) => k !== perm.key)
                            : [...prev, perm.key]
                        );
                      }}
                    />
                    <div>
                      <span className={styles.permLabel}>{perm.label}</span>
                      <span className={styles.permCategory}>{perm.module}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <Button variant="secondary" size="sm" onClick={() => setCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleCreateCustomRole}>
            Create Custom Role
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

/**
 * 3. Access History (`/business-admin/access-history`)
 */
export function AccessHistoryPage() {
  const accessHistory = useSuperBusinessAdminStore((s) => s.accessHistory);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return accessHistory;
    return accessHistory.filter(
      (a) =>
        a.userName.toLowerCase().includes(q) ||
        a.userRole.toLowerCase().includes(q) ||
        a.activity.toLowerCase().includes(q) ||
        a.resource.toLowerCase().includes(q) ||
        a.branchName.toLowerCase().includes(q)
    );
  }, [accessHistory, search]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>Super Business Admin • Team & Access Control</div>
          <h1 className={styles.title}>Access & Configuration History</h1>
          <p className={styles.subtitle}>
            Audit trail of employee logins, role permission updates, and sensitive business configuration changes.
          </p>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.filterBar}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search user, role, branch, or activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>User</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Activity</th>
                <th>Target Resource</th>
                <th>IP Reference</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id}>
                  <td className={styles.mono}>{formatFullDateTime(entry.timestamp)}</td>
                  <td className={styles.primaryText}>{entry.userName}</td>
                  <td>
                    <span className={styles.tag}>{entry.userRole}</span>
                  </td>
                  <td>{entry.branchName}</td>
                  <td className={styles.primaryText}>{entry.activity}</td>
                  <td>
                    <span className={styles.codePill}>{entry.resource}</span>
                  </td>
                  <td className={styles.mono}>{entry.ipReference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
