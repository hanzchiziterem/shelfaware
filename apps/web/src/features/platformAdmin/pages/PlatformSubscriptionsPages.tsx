import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useAuthStore } from '@/store/authStore';
import { usePlatformAdminStore } from '@/store/platformAdminStore';
import { useUiStore } from '@/store/uiStore';
import type { SubscriptionPlanConfig } from '@/types/adminPortals';
import { formatCurrency } from '@/utils/currency';
import { formatFullDateTime } from '@/utils/dates';
import styles from './PlatformAdmin.module.css';

/**
 * F1. SUBSCRIPTION PLANS PAGE
 */
export function SubscriptionPlansPage() {
  const user = useAuthStore((s) => s.user);
  const pushToast = useUiStore((s) => s.pushToast);
  const plans = usePlatformAdminStore((s) => s.plans);
  const features = usePlatformAdminStore((s) => s.features);
  const saveSubscriptionPlan = usePlatformAdminStore((s) => s.saveSubscriptionPlan);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | undefined>(undefined);
  const [name, setName] = useState('');
  const [code, setCode] = useState<'starter' | 'growth' | 'enterprise'>('growth');
  const [description, setDescription] = useState('');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [price, setPrice] = useState('65000');
  const [maxBranches, setMaxBranches] = useState('4');
  const [maxEmployees, setMaxEmployees] = useState('25');
  const [includedModules, setIncludedModules] = useState<string[]>([]);
  const [planStatus, setPlanStatus] = useState<'active' | 'archived'>('active');

  const openEditPlan = (plan: SubscriptionPlanConfig) => {
    setEditingPlanId(plan.id);
    setName(plan.name);
    setCode(plan.code);
    setDescription(plan.description);
    setBillingInterval(plan.billingInterval);
    setPrice(String(plan.price));
    setMaxBranches(String(plan.maxBranches));
    setMaxEmployees(String(plan.maxEmployees));
    setIncludedModules(plan.includedModules);
    setPlanStatus(plan.status);
    setModalOpen(true);
  };

  const openCreatePlan = () => {
    setEditingPlanId(undefined);
    setName('');
    setCode('growth');
    setDescription('');
    setBillingInterval('monthly');
    setPrice('95000');
    setMaxBranches('6');
    setMaxEmployees('40');
    setIncludedModules(['pos', 'inventory', 'products', 'purchases', 'customers', 'reports']);
    setPlanStatus('active');
    setModalOpen(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    saveSubscriptionPlan(
      {
        id: editingPlanId,
        name: name.trim(),
        code,
        description: description.trim(),
        billingInterval,
        price: Number(price) || 25000,
        maxBranches: Number(maxBranches) || 1,
        maxEmployees: Number(maxEmployees) || 5,
        includedModules,
        allowedDatabaseStrategies:
          code === 'enterprise'
            ? ['dedicated_instance']
            : ['shared_schema', 'dedicated_instance'],
        status: planStatus,
      },
      user?.fullName || 'Tunde Bakare (Platform Admin)'
    );
    setModalOpen(false);
    pushToast({
      title: editingPlanId ? `Updated ${name}` : `Created plan ${name}`,
      tone: 'success',
    });
  };

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <div>
          <span className={styles.contextBadge}>Platform Admin · Subscription Management</span>
          <h1 className={styles.pageTitle}>Subscription Plans</h1>
          <p className={styles.pageSubtitle}>
            Configure SaaS tiers, billing intervals, usage limits, and included retail modules.
          </p>
        </div>
        <Button variant="primary" onClick={openCreatePlan}>
          + Create Subscription Plan
        </Button>
      </div>

      <div className={styles.kpiGrid3}>
        {plans.map((plan) => (
          <div key={plan.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>{plan.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Code: {plan.code}
                </div>
              </div>
              <StatusIndicator
                tone={plan.status === 'active' ? 'success' : 'neutral'}
                label={plan.status === 'active' ? 'Active' : 'Archived'}
                appearance="tag"
              />
            </div>

            <div className={styles.kpiValue}>
              {formatCurrency(plan.price, 'NGN', 'en-NG')}{' '}
              <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-text-muted)' }}>
                / {plan.billingInterval}
              </span>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              {plan.description}
            </p>

            <div className={styles.kvGrid}>
              <span className={styles.kvLabel}>Branch Limit</span>
              <span className={styles.kvValue}>Up to {plan.maxBranches} branch(es)</span>

              <span className={styles.kvLabel}>Staff Limit</span>
              <span className={styles.kvValue}>Up to {plan.maxEmployees} employees</span>

              <span className={styles.kvLabel}>Included Modules</span>
              <span className={styles.kvValue}>{plan.includedModules.length} modules</span>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {plan.includedModules.map((m) => (
                <span key={m} className={styles.codePill}>
                  {m}
                </span>
              ))}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
              <Button variant="secondary" size="sm" onClick={() => openEditPlan(plan)}>
                Configure Plan & Limits
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPlanId ? `Edit Plan — ${name}` : 'Create Subscription Plan'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSavePlan}>
              Save Plan Configuration
            </Button>
          </>
        }
      >
        <form className={styles.formGrid} onSubmit={handleSavePlan}>
          <div className={styles.fieldCol}>
            <label htmlFor="pl-name" className={styles.label}>
              Plan Name
            </label>
            <input
              id="pl-name"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.fieldCol}>
            <label htmlFor="pl-interval" className={styles.label}>
              Billing Interval
            </label>
            <select
              id="pl-interval"
              className={styles.select}
              value={billingInterval}
              onChange={(e) => setBillingInterval(e.target.value as 'monthly' | 'annual')}
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>

          <div className={styles.fieldCol}>
            <label htmlFor="pl-price" className={styles.label}>
              Price (₦)
            </label>
            <input
              id="pl-price"
              type="number"
              className={styles.input}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className={styles.fieldCol}>
            <label htmlFor="pl-status" className={styles.label}>
              Plan Status
            </label>
            <select
              id="pl-status"
              className={styles.select}
              value={planStatus}
              onChange={(e) => setPlanStatus(e.target.value as 'active' | 'archived')}
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className={styles.fieldCol}>
            <label htmlFor="pl-branches" className={styles.label}>
              Max Branches
            </label>
            <input
              id="pl-branches"
              type="number"
              className={styles.input}
              value={maxBranches}
              onChange={(e) => setMaxBranches(e.target.value)}
            />
          </div>

          <div className={styles.fieldCol}>
            <label htmlFor="pl-emps" className={styles.label}>
              Max Employees
            </label>
            <input
              id="pl-emps"
              type="number"
              className={styles.input}
              value={maxEmployees}
              onChange={(e) => setMaxEmployees(e.target.value)}
            />
          </div>

          <div className={styles.fieldFull}>
            <label htmlFor="pl-desc" className={styles.label}>
              Plan Description
            </label>
            <input
              id="pl-desc"
              className={styles.input}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.fieldFull}>
            <span className={styles.label}>Available Modules in Plan</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
              {features.map((f) => (
                <label
                  key={f.key}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12.5px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={includedModules.includes(f.key)}
                    onChange={(e) =>
                      setIncludedModules((prev) =>
                        e.target.checked
                          ? [...prev, f.key]
                          : prev.filter((k) => k !== f.key)
                      )
                    }
                  />
                  <span>{f.name}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

/**
 * F2. ACTIVE SUBSCRIPTIONS PAGE
 */
export function ActiveSubscriptionsPage() {
  const subscriptions = usePlatformAdminStore((s) => s.subscriptions);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = subscriptions.filter((s) =>
    statusFilter === 'all' ? true : s.status === statusFilter
  );

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <div>
          <span className={styles.contextBadge}>Platform Admin · Subscription Management</span>
          <h1 className={styles.pageTitle}>Tenant Subscriptions</h1>
          <p className={styles.pageSubtitle}>
            Track active, trialing, expired, cancelled, and pending tenant subscriptions. Kept
            strictly separate from KYB verification status.
          </p>
        </div>
      </div>

      <div className={styles.filterGroup}>
        {(['all', 'active', 'trialing', 'expired', 'pending', 'cancelled'] as const).map((st) => (
          <Button
            key={st}
            size="sm"
            variant={statusFilter === st ? 'primary' : 'secondary'}
            onClick={() => setStatusFilter(st)}
          >
            {st.toUpperCase()} (
            {st === 'all'
              ? subscriptions.length
              : subscriptions.filter((s) => s.status === st).length}
            )
          </Button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Business</th>
              <th>Plan</th>
              <th>Billing Interval</th>
              <th style={{ textAlign: 'right' }}>Recurring Amount</th>
              <th>Start Date</th>
              <th>Renewal Date</th>
              <th>Subscription Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sub) => (
              <tr key={sub.id}>
                <td style={{ fontWeight: 600 }}>{sub.businessName}</td>
                <td>{sub.planName}</td>
                <td style={{ textTransform: 'capitalize' }}>{sub.billingInterval}</td>
                <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(sub.amount, 'NGN', 'en-NG')}
                </td>
                <td className="tabular-nums">{sub.startDate}</td>
                <td className="tabular-nums">{sub.renewalDate}</td>
                <td>
                  {sub.status === 'active' && (
                    <StatusIndicator tone="success" label="Active" appearance="tag" />
                  )}
                  {sub.status === 'trialing' && (
                    <StatusIndicator tone="warning" label="Trialing" appearance="tag" />
                  )}
                  {(sub.status === 'expired' || sub.status === 'past_due') && (
                    <StatusIndicator tone="danger" label="Expired" appearance="tag" />
                  )}
                  {sub.status === 'pending' && (
                    <StatusIndicator tone="neutral" label="Pending" appearance="tag" />
                  )}
                  {sub.status === 'cancelled' && (
                    <StatusIndicator tone="neutral" label="Cancelled" appearance="tag" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * F3. PAYMENTS & TRANSACTIONS PAGE
 */
export function PlatformPaymentsPage() {
  const payments = usePlatformAdminStore((s) => s.payments);

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <div>
          <span className={styles.contextBadge}>Platform Admin · Billing Ledger</span>
          <h1 className={styles.pageTitle}>Subscription Payments & Transactions</h1>
          <p className={styles.pageSubtitle}>
            SaaS subscription settlements processed across Paystack, Flutterwave, and corporate
            bank wire.
          </p>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Business</th>
              <th>Subscription Plan</th>
              <th>Gateway</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th>Timestamp</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((pay) => (
              <tr key={pay.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  {pay.reference}
                </td>
                <td style={{ fontWeight: 600 }}>{pay.businessName}</td>
                <td>{pay.planName}</td>
                <td>{pay.gateway}</td>
                <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(pay.amount, 'NGN', 'en-NG')}
                </td>
                <td className="tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                  {formatFullDateTime(pay.createdAt)}
                </td>
                <td>
                  {pay.status === 'succeeded' ? (
                    <StatusIndicator tone="success" label="Succeeded" appearance="tag" />
                  ) : pay.status === 'failed' ? (
                    <StatusIndicator tone="danger" label="Failed" appearance="tag" />
                  ) : (
                    <StatusIndicator tone="warning" label="Pending" appearance="tag" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * F4. FAILED PAYMENTS PAGE
 */
export function FailedPaymentsPage() {
  const payments = usePlatformAdminStore((s) => s.payments);
  const failedPayments = payments.filter((p) => p.status === 'failed');

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <div>
          <span className={styles.contextBadge}>Platform Admin · Revenue Recovery</span>
          <h1 className={styles.pageTitle}>Failed Subscription Payments</h1>
          <p className={styles.pageSubtitle}>
            Inspect gateway decline codes and retry history for overdue tenant renewals.
          </p>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Business</th>
              <th>Plan</th>
              <th>Gateway</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th>Failure Reason</th>
              <th>Retries</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {failedPayments.map((pay) => (
              <tr key={pay.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  {pay.reference}
                </td>
                <td style={{ fontWeight: 600 }}>{pay.businessName}</td>
                <td>{pay.planName}</td>
                <td>{pay.gateway}</td>
                <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(pay.amount, 'NGN', 'en-NG')}
                </td>
                <td style={{ color: 'var(--color-danger)' }}>
                  {pay.failureReason || 'Gateway charge declined'}
                </td>
                <td className="tabular-nums">{pay.retryCount || 1}</td>
                <td className="tabular-nums">{formatFullDateTime(pay.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
