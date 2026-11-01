import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { Button } from '@/components/ui/Button';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { usePlatformAdminStore } from '@/store/platformAdminStore';
import { formatCompactCurrency, formatCurrency } from '@/utils/currency';
import { formatShortDate } from '@/utils/dates';
import styles from './PlatformAdmin.module.css';

export function PlatformDashboardPage() {
  const navigate = useNavigate();
  const businesses = usePlatformAdminStore((s) => s.businesses);
  const subscriptions = usePlatformAdminStore((s) => s.subscriptions);
  const payments = usePlatformAdminStore((s) => s.payments);
  const auditLogs = usePlatformAdminStore((s) => s.auditLogs);
  const supportTickets = usePlatformAdminStore((s) => s.supportTickets);

  const totalBusinesses = businesses.length;
  const activeBusinesses = businesses.filter((b) => b.accountStatus === 'active').length;
  const pendingVerifications = businesses.filter(
    (b) => b.verificationStatus === 'pending' || b.verificationStatus === 'under_review'
  ).length;

  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === 'active' || s.status === 'trialing'
  ).length;
  const expiredSubscriptions = subscriptions.filter(
    (s) => s.status === 'expired' || s.status === 'past_due' || s.status === 'cancelled'
  ).length;

  const totalMrr = businesses
    .filter((b) => b.accountStatus === 'active')
    .reduce((acc, b) => acc + b.mrrContribution, 0);

  const totalPaymentsReceived = payments
    .filter((p) => p.status === 'succeeded')
    .reduce((acc, p) => acc + p.amount, 0);

  const failedPaymentsCount = payments.filter((p) => p.status === 'failed').length;

  const registrationTrends = [
    { month: 'Jun', count: 1, mrr: 65000 },
    { month: 'Jul', count: 2, mrr: 90000 },
    { month: 'Aug', count: 3, mrr: 155000 },
    { month: 'Sep', count: 4, mrr: 340000 },
    { month: 'Oct', count: totalBusinesses, mrr: totalMrr },
  ];

  const planDistribution = [
    {
      label: 'Supermarket Growth (₦65k/mo)',
      count: businesses.filter((b) => b.subscriptionPlanId === 'plan-growth').length,
    },
    {
      label: 'Enterprise Chain (₦185k/mo)',
      count: businesses.filter((b) => b.subscriptionPlanId === 'plan-enterprise').length,
    },
    {
      label: 'Retail Starter (₦25k/mo)',
      count: businesses.filter((b) => b.subscriptionPlanId === 'plan-starter').length,
    },
  ];

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <div>
          <span className={styles.contextBadge}>ShelfAware Platform Administration</span>
          <h1 className={styles.pageTitle}>Platform Control Centre</h1>
          <p className={styles.pageSubtitle}>
            SaaS tenant lifecycle, KYB verification queue, subscription MRR, and multi-tenant
            provisioning overview.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            onClick={() => navigate(PATHS.PLATFORM.VERIFICATION)}
          >
            Review Verifications ({pendingVerifications})
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(PATHS.PLATFORM.ONBOARDING)}
          >
            + Onboard New Business
          </Button>
        </div>
      </div>

      {/* 8 Required Platform-Level KPIs */}
      <div className={styles.kpiGrid4}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiValue}>{totalBusinesses}</span>
          <span className={styles.kpiLabel}>Total Registered Businesses</span>
          <span className={styles.kpiSub}>{activeBusinesses} active tenant workspaces</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiValue}>{activeBusinesses}</span>
          <span className={styles.kpiLabel}>Active Businesses</span>
          <span className={styles.kpiSub}>
            {businesses.filter((b) => b.accountStatus === 'suspended').length} suspended
          </span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiValue} style={{ color: 'var(--color-warning)' }}>
            {pendingVerifications}
          </span>
          <span className={styles.kpiLabel}>Pending Business Verifications</span>
          <span className={styles.kpiSub}>Awaiting CAC / TIN compliance sign-off</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiValue}>{activeSubscriptions}</span>
          <span className={styles.kpiLabel}>Active Subscriptions</span>
          <span className={styles.kpiSub}>{expiredSubscriptions} expired or past-due</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiValue}>{expiredSubscriptions}</span>
          <span className={styles.kpiLabel}>Expired / Past-Due Subscriptions</span>
          <span className={styles.kpiSub}>Requires billing follow-up</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiValue} style={{ color: 'var(--color-success)' }}>
            {formatCurrency(totalMrr, 'NGN', 'en-NG')}
          </span>
          <span className={styles.kpiLabel}>Monthly Recurring Revenue (MRR)</span>
          <span className={styles.kpiSub}>ARR Run-rate: {formatCompactCurrency(totalMrr * 12)}</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiValue}>
            {formatCurrency(totalPaymentsReceived, 'NGN', 'en-NG')}
          </span>
          <span className={styles.kpiLabel}>Total Payments Received</span>
          <span className={styles.kpiSub}>Settled via Paystack, Flutterwave & Bank Wire</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiValue} style={{ color: 'var(--color-danger)' }}>
            {failedPaymentsCount}
          </span>
          <span className={styles.kpiLabel}>Failed Subscription Payments</span>
          <span className={styles.kpiSub}>
            {supportTickets.filter((t) => t.status !== 'resolved').length} open support tickets
          </span>
        </div>
      </div>

      {/* Registration Trend + Subscription Distribution & Pending Actions */}
      <div className={styles.twoColGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Tenant Registration & MRR Growth Trend</span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              2026 Cohort
            </span>
          </div>

          <svg
            viewBox="0 0 540 155"
            style={{ width: '100%', height: '155px' }}
            role="img"
            aria-label="Platform MRR growth chart"
          >
            {[30, 75, 120].map((y) => (
              <line
                key={y}
                x1="30"
                y1={y}
                x2="510"
                y2={y}
                stroke="var(--color-border)"
                strokeDasharray="3 3"
              />
            ))}
            <polyline
              fill="none"
              stroke="var(--color-text-primary)"
              strokeWidth="2.2"
              points="45,112 160,102 275,86 390,48 495,34"
            />
            {registrationTrends.map((pt, idx) => {
              const x = 45 + idx * 112;
              const y = [112, 102, 86, 48, 34][idx] || 40;
              return (
                <g key={pt.month}>
                  <circle cx={x} cy={y} r="3.5" fill="var(--color-text-primary)" />
                  <text
                    x={x}
                    y="142"
                    textAnchor="middle"
                    fontSize="11"
                    fill="var(--color-text-muted)"
                  >
                    {pt.month} ({pt.count})
                  </text>
                </g>
              );
            })}
          </svg>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '8px',
              borderTop: '1px solid var(--color-border-subtle)',
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span>Shared Schema Tenants: {businesses.filter((b) => b.databaseStrategy === 'shared_schema').length}</span>
            <span>Dedicated DB Instances: {businesses.filter((b) => b.databaseStrategy === 'dedicated_instance').length}</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Subscription Distribution & Pending Actions</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {planDistribution.map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: 'var(--color-surface-muted)',
                }}
              >
                <span>{item.label}</span>
                <strong className="tabular-nums">{item.count} tenant(s)</strong>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: '1px solid var(--color-border)',
              paddingTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              PENDING PLATFORM ACTIONS REQUIRING ATTENTION
            </span>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12.5px',
              }}
            >
              <span>KYB Verification Queue ({pendingVerifications} businesses)</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(PATHS.PLATFORM.VERIFICATION)}
              >
                Review
              </Button>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12.5px',
              }}
            >
              <span>Failed Subscription Renewals ({failedPaymentsCount} payment)</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(PATHS.PLATFORM.FAILED_PAYMENTS)}
              >
                Inspect
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Business Registrations & Recent Platform Audit Events */}
      <div className={styles.twoColGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Recent Business Registrations</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(PATHS.PLATFORM.BUSINESSES)}
            >
              View All Businesses →
            </Button>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Plan</th>
                  <th>Verification</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {businesses.slice(0, 5).map((biz) => (
                  <tr key={biz.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{biz.businessName}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                        {biz.subdomain}
                      </div>
                    </td>
                    <td>{biz.subscriptionPlanName}</td>
                    <td>
                      {biz.verificationStatus === 'verified' && (
                        <StatusIndicator tone="success" label="Verified" appearance="tag" />
                      )}
                      {biz.verificationStatus === 'pending' && (
                        <StatusIndicator tone="warning" label="Pending" appearance="tag" />
                      )}
                      {biz.verificationStatus === 'under_review' && (
                        <StatusIndicator tone="warning" label="Under review" appearance="tag" />
                      )}
                      {biz.verificationStatus === 'rejected' && (
                        <StatusIndicator tone="danger" label="Rejected" appearance="tag" />
                      )}
                    </td>
                    <td className="tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                      {formatShortDate(biz.registeredAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Recent Platform Activities</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(PATHS.PLATFORM.AUDIT_LOGS)}
            >
              Full Audit Log →
            </Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {auditLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--color-border-subtle)',
                  backgroundColor: 'var(--color-surface-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <strong>{log.action}</strong>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '11.5px' }}>
                    {formatShortDate(log.createdAt)}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  {log.targetResource} — {log.details}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
