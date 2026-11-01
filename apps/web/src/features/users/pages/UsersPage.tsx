import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { useUserStore } from '@/store/userStore';
import styles from '@/styles/SharedPages.module.css';
import type { UserRole } from '@/types/common';
import { formatFullDateTime } from '@/utils/dates';

export function UsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const pushToast = useUiStore((s) => s.pushToast);
  const users = useUserStore((s) => s.users);
  const fetchUsers = useUserStore((s) => s.fetchUsers);
  const createUser = useUserStore((s) => s.createUser);
  const updateUser = useUserStore((s) => s.updateUser);

  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+234 803 ');
  const [role, setRole] = useState<UserRole>('cashier');

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    const created = await createUser({ fullName, email, phone, role });
    if (created) {
      setModalOpen(false);
      setFullName('');
      setEmail('');
      pushToast({
        title: `Added staff member ${created.fullName} (${created.role})`,
        tone: 'success',
      });
    }
  };

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Team & Users</h1>
          <p className={styles.pageSubtitle}>
            Manage Administrator, Manager, and Cashier staff accounts. In production, role
            permissions are verified server-side on every API request.
          </p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          + Add Staff Member
        </Button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Assigned Role</th>
              <th>Account Status</th>
              <th>Last Active</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = currentUser?.id === u.id;
              return (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>
                    {u.fullName} {isSelf ? '(You)' : ''}
                  </td>
                  <td>{u.email}</td>
                  <td className="tabular-nums">{u.phone}</td>
                  <td>
                    <select
                      aria-label={`Change role for ${u.fullName}`}
                      className={styles.select}
                      style={{ height: '28px', fontSize: '12px' }}
                      value={u.role}
                      disabled={isSelf}
                      onChange={(e) => {
                        void updateUser(u.id, { role: e.target.value as UserRole });
                        pushToast({
                          title: `Updated ${u.fullName} role to ${e.target.value}`,
                          tone: 'info',
                        });
                      }}
                    >
                      <option value="administrator">Administrator</option>
                      <option value="manager">Manager</option>
                      <option value="cashier">Cashier</option>
                    </select>
                  </td>
                  <td>
                    {u.status === 'active' ? (
                      <StatusIndicator tone="success" label="Active" appearance="tag" />
                    ) : (
                      <StatusIndicator tone="neutral" label="Inactive" appearance="tag" />
                    )}
                  </td>
                  <td className="tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                    {formatFullDateTime(u.lastActiveAt)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={isSelf}
                      onClick={() => {
                        const nextStatus = u.status === 'active' ? 'inactive' : 'active';
                        void updateUser(u.id, { status: nextStatus });
                        pushToast({
                          title: `${u.fullName} marked as ${nextStatus}`,
                          tone: 'info',
                        });
                      }}
                    >
                      {u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Store Staff Member"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={(e) => void handleInvite(e)}>
              Create Staff Account
            </Button>
          </>
        }
      >
        <form className={styles.formStack} onSubmit={handleInvite}>
          <div className={styles.fieldGroup}>
            <label htmlFor="usr-name" className={styles.label}>
              Full Name
            </label>
            <input
              id="usr-name"
              className={styles.input}
              placeholder="e.g. Halima Yusuf"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="usr-email" className={styles.label}>
              Staff Email
            </label>
            <input
              id="usr-email"
              type="email"
              className={styles.input}
              placeholder="halima@oluwafoodmart.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="usr-phone" className={styles.label}>
              Phone Number
            </label>
            <input
              id="usr-phone"
              className={styles.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="usr-role" className={styles.label}>
              Role
            </label>
            <select
              id="usr-role"
              className={styles.select}
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="cashier">Cashier (POS & Orders only, no cost price)</option>
              <option value="manager">Manager (Inventory, Purchases, Reports & POS)</option>
              <option value="administrator">Administrator (Full Store & Staff Control)</option>
            </select>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
