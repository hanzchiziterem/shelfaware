import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useAuthStore } from '@/store/authStore';
import { usePlatformAdminStore } from '@/store/platformAdminStore';
import { useSuperBusinessAdminStore } from '@/store/superBusinessAdminStore';
import { useUiStore } from '@/store/uiStore';
import { formatCurrency } from '@/utils/currency';
import { formatFullDateTime, formatShortDate } from '@/utils/dates';
import styles from '@/features/platformAdmin/pages/PlatformAdmin.module.css';

/**
 * 1. Subscription & Plan (`/business-admin/subscription`)
 */
export function SubscriptionPlanViewPage() {
  const activeTenantId = useSuperBusinessAdminStore((s) => s.activeTenantId);
  const branches = useSuperBusinessAdminStore((s) => s.branches);
  const employees = useSuperBusinessAdminStore((s) => s.employees);

  const subscriptions = usePlatformAdminStore((s) => s.subscriptions);
  const plans = usePlatformAdminStore((s) => s.plans);
  const pushToast = useUiStore((s) => s.pushToast);

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const tenantSub = subscriptions.find((s) => s.tenantId === activeTenantId);
  const currentPlan =
    plans.find((p) => p.id === (tenantSub?.planId || 'plan-growth')) || plans[1];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>Super Business Admin • Account & Billing</div>
          <h1 className={styles.title}>Subscription & Plan Entitlements</h1>
          <p className={styles.subtitle}>
            Review your active ShelfAware subscription tier, renewal schedule, and resource limits.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" size="md" onClick={() => setUpgradeModalOpen(true)}>
            Compare / Upgrade Plan
          </Button>
        </div>
      </header>

      <section className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Current Tier</span>
          <span className={styles.kpiValue} style={{ fontSize: '20px' }}>
            {currentPlan.name}
          </span>
          <span className={styles.kpiSub}>
            Status: <strong>{tenantSub?.status.toUpperCase() || 'ACTIVE'}</strong>
          </span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Billing Rate</span>
          <span className={styles.kpiValue}>{formatCurrency(currentPlan.price)}</span>
          <span className={styles.kpiSub}>Per month • Auto-renew enabled</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Next Renewal Date</span>
          <span className={styles.kpiValue} style={{ fontSize: '20px' }}>
            {tenantSub ? formatShortDate(tenantSub.renewalDate) : '12 Nov 2026'}
          </span>
          <span className={styles.kpiSub}>Paid via Paystack Direct Debit</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Branch Usage</span>
          <span className={styles.kpiValue}>
            {branches.length} / {currentPlan.maxBranches}
          </span>
          <span className={styles.kpiSub}>Physical store locations</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Employee Seats</span>
          <span className={styles.kpiValue}>
            {employees.length} / {currentPlan.maxEmployees}
          </span>
          <span className={styles.kpiSub}>Staff & cashier accounts</span>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Included Modules in {currentPlan.name}</h2>
            <p className={styles.cardSubtitle}>{currentPlan.description}</p>
          </div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.tagList}>
            {currentPlan.includedModules.map((mod) => (
              <span key={mod} className={styles.tag}>
                ✓ {mod}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Dialog
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Compare ShelfAware Subscription Plans"
        size="lg"
      >
        <div className={styles.planGrid}>
          {plans.map((p) => {
            const isCurrent = p.id === currentPlan.id;
            return (
              <div key={p.id} className={styles.planCard}>
                <div>
                  <div className={styles.planName}>{p.name}</div>
                  <div className={styles.secondaryText}>{p.description}</div>
                </div>
                <div>
                  <span className={styles.planPrice}>{formatCurrency(p.price)}</span>
                  <span className={styles.planPeriod}> / month</span>
                </div>
                <div className={styles.secondaryText}>
                  Up to <strong>{p.maxBranches}</strong> branches •{' '}
                  <strong>{p.maxEmployees}</strong> employees
                </div>
                <div className={styles.tagList}>
                  {p.includedModules.map((m) => (
                    <span key={m} className={styles.tag}>
                      {m}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                  <Button
                    variant={isCurrent ? 'secondary' : 'primary'}
                    size="sm"
                    disabled={isCurrent}
                    onClick={() => {
                      pushToast({
                        title: `Upgrade request submitted for ${p.name}`,
                        description:
                          'ShelfAware billing team has queued your plan change request.',
                        tone: 'success',
                      });
                      setUpgradeModalOpen(false);
                    }}
                  >
                    {isCurrent ? 'Current Active Plan' : `Request Switch to ${p.name}`}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Dialog>
    </div>
  );
}

/**
 * 2. Billing History (`/business-admin/billing-history`)
 */
export function BillingHistoryPage() {
  const activeTenantId = useSuperBusinessAdminStore((s) => s.activeTenantId);
  const payments = usePlatformAdminStore((s) => s.payments);
  const pushToast = useUiStore((s) => s.pushToast);

  const tenantPayments = payments.filter((p) => p.tenantId === activeTenantId);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>Super Business Admin • Account & Billing</div>
          <h1 className={styles.title}>Billing & Invoice History</h1>
          <p className={styles.subtitle}>
            Subscription payment receipts and settlement records for your business account.
          </p>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Invoice / Reference</th>
                <th>Plan</th>
                <th>Payment Gateway</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {tenantPayments.map((pay) => (
                <tr key={pay.id}>
                  <td>
                    <span className={styles.codePill}>{pay.reference}</span>
                  </td>
                  <td className={styles.primaryText}>{pay.planName}</td>
                  <td>{pay.gateway}</td>
                  <td className={styles.mono}>{formatCurrency(pay.amount)}</td>
                  <td>
                    <StatusIndicator
                      tone={
                        pay.status === 'succeeded'
                          ? 'success'
                          : pay.status === 'pending'
                            ? 'warning'
                            : 'danger'
                      }
                      label={pay.status}
                    />
                  </td>
                  <td className={styles.mono}>{formatFullDateTime(pay.createdAt)}</td>
                  <td>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        pushToast({
                          title: `Invoice ${pay.reference}`,
                          description: 'VAT invoice summary downloaded.',
                          tone: 'info',
                        })
                      }
                    >
                      Download Receipt
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/**
 * 3. Account Settings (`/business-admin/account-settings`)
 */
export function TenantAccountSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const accountSecurity = useSuperBusinessAdminStore((s) => s.accountSecurity);
  const updateAccountSecurity = useSuperBusinessAdminStore((s) => s.updateAccountSecurity);
  const pushToast = useUiStore((s) => s.pushToast);

  const [enforce2FA, setEnforce2FA] = useState(accountSecurity.enforceTwoFactorForAdmins);
  const [idleMinutes, setIdleMinutes] = useState(
    String(accountSecurity.sessionIdleTimeoutMinutes)
  );
  const [concurrentPos, setConcurrentPos] = useState(
    accountSecurity.allowConcurrentPosSessions
  );
  const [billingEmail, setBillingEmail] = useState(accountSecurity.billingContactEmail);

  const handleSave = () => {
    updateAccountSecurity(
      {
        enforceTwoFactorForAdmins: enforce2FA,
        sessionIdleTimeoutMinutes: Math.max(5, Number(idleMinutes) || 30),
        allowConcurrentPosSessions: concurrentPos,
        billingContactEmail: billingEmail.trim(),
      },
      user?.fullName || 'Adebayo Ogunlesi'
    );
    pushToast({
      title: 'Tenant security settings saved',
      description: 'Updated session idle policies and billing contact.',
      tone: 'success',
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>Super Business Admin • Account & Billing</div>
          <h1 className={styles.title}>Account Security & Session Policies</h1>
          <p className={styles.subtitle}>
            Configure two-factor authentication requirements, terminal idle timeouts, and billing contacts.
          </p>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Terminal Idle Session Lock Timeout (Minutes)</label>
              <input
                type="number"
                className={styles.input}
                value={idleMinutes}
                onChange={(e) => setIdleMinutes(e.target.value)}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Primary Billing & Invoice Contact Email</label>
              <input
                type="email"
                className={styles.input}
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.toggleRow} style={{ marginTop: '14px' }}>
            <div className={styles.toggleMeta}>
              <span className={styles.toggleTitle}>
                Enforce Two-Factor Authentication (2FA) for Admin & Accountant Roles
              </span>
              <span className={styles.toggleDesc}>
                Requires OTP verification when signing into Super Business Admin or viewing financial reports.
              </span>
            </div>
            <button
              type="button"
              className={`${styles.switchBtn} ${enforce2FA ? styles.switchBtnOn : ''}`}
              onClick={() => setEnforce2FA((v) => !v)}
            />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleMeta}>
              <span className={styles.toggleTitle}>Allow Multi-Terminal POS Sessions Across Branches</span>
              <span className={styles.toggleDesc}>
                Permits multiple cashier terminals across branches to operate concurrently.
              </span>
            </div>
            <button
              type="button"
              className={`${styles.switchBtn} ${concurrentPos ? styles.switchBtnOn : ''}`}
              onClick={() => setConcurrentPos((v) => !v)}
            />
          </div>

          <div className={styles.modalFooter}>
            <Button variant="primary" size="md" onClick={handleSave}>
              Save Account Security Settings
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
