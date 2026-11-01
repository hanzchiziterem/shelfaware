import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useAuthStore } from '@/store/authStore';
import { usePlatformAdminStore } from '@/store/platformAdminStore';
import { useUiStore } from '@/store/uiStore';
import { formatFullDateTime } from '@/utils/dates';
import styles from './PlatformAdmin.module.css';

/**
 * J1. SUPPORT REQUESTS PAGE
 */
export function SupportRequestsPage() {
  const user = useAuthStore((s) => s.user);
  const pushToast = useUiStore((s) => s.pushToast);
  const supportTickets = usePlatformAdminStore((s) => s.supportTickets);
  const updateSupportTicketStatus = usePlatformAdminStore((s) => s.updateSupportTicketStatus);

  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = supportTickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        t.ticketNumber.toLowerCase().includes(q) ||
        t.businessName.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <div>
          <span className={styles.contextBadge}>Platform Admin · Support & Monitoring</span>
          <h1 className={styles.pageTitle}>Tenant Support Requests</h1>
          <p className={styles.pageSubtitle}>
            Manage escalated tenant support tickets across billing, KYB verification, and
            provisioning.
          </p>
        </div>
      </div>

      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          {(['all', 'open', 'in_progress', 'resolved'] as const).map((st) => (
            <Button
              key={st}
              size="sm"
              variant={statusFilter === st ? 'primary' : 'secondary'}
              onClick={() => setStatusFilter(st)}
            >
              {st.replace('_', ' ').toUpperCase()}
            </Button>
          ))}
        </div>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search ticket #, business, subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ticket #</th>
              <th>Business</th>
              <th>Subject</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tkt) => (
              <tr key={tkt.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {tkt.ticketNumber}
                </td>
                <td style={{ fontWeight: 500 }}>{tkt.businessName}</td>
                <td>{tkt.subject}</td>
                <td style={{ textTransform: 'capitalize' }}>{tkt.category.replace('_', ' ')}</td>
                <td>
                  <StatusIndicator
                    tone={
                      tkt.priority === 'urgent' || tkt.priority === 'high'
                        ? 'danger'
                        : tkt.priority === 'medium'
                        ? 'warning'
                        : 'neutral'
                    }
                    label={tkt.priority.toUpperCase()}
                    appearance="tag"
                  />
                </td>
                <td>
                  {tkt.status === 'resolved' ? (
                    <StatusIndicator tone="success" label="Resolved" />
                  ) : tkt.status === 'in_progress' ? (
                    <StatusIndicator tone="warning" label="In progress" />
                  ) : (
                    <StatusIndicator tone="danger" label="Open" />
                  )}
                </td>
                <td>{tkt.assignedTo}</td>
                <td style={{ textAlign: 'right' }}>
                  {tkt.status !== 'resolved' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const next = tkt.status === 'open' ? 'in_progress' : 'resolved';
                        updateSupportTicketStatus(
                          tkt.id,
                          next,
                          user?.fullName || 'Tunde Bakare'
                        );
                        pushToast({
                          title: `${tkt.ticketNumber} marked as ${next.replace('_', ' ')}`,
                          tone: 'success',
                        });
                      }}
                    >
                      {tkt.status === 'open' ? 'Start Review' : 'Mark Resolved'}
                    </Button>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      Closed
                    </span>
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
 * I. AUDIT LOGS PAGE
 */
export function PlatformAuditLogsPage() {
  const auditLogs = usePlatformAdminStore((s) => s.auditLogs);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = auditLogs.filter((log) => {
    if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        log.actorName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.targetResource.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <div>
          <span className={styles.contextBadge}>Platform Admin · Immutable Audit Trail</span>
          <h1 className={styles.pageTitle}>Platform Audit Logs</h1>
          <p className={styles.pageSubtitle}>
            Immutable record of business creation, verification decisions, subscription changes,
            account suspensions/reactivations, feature flags, and provisioning events.
          </p>
        </div>
      </div>

      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <select
            aria-label="Filter by audit category"
            className={styles.selectFilter}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Category: All</option>
            <option value="business_lifecycle">Business Lifecycle / Suspension</option>
            <option value="verification">KYB Verification</option>
            <option value="subscription">Subscription & Plan Changes</option>
            <option value="provisioning">Database Provisioning</option>
            <option value="feature_flag">Feature Flags</option>
            <option value="security">Security & Role Templates</option>
          </select>
        </div>

        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search actor, action, target resource..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Category</th>
              <th>Action</th>
              <th>Affected Resource</th>
              <th>Audit Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id}>
                <td className="tabular-nums" style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                  {formatFullDateTime(log.createdAt)}
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{log.actorName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {log.actorRole}
                  </div>
                </td>
                <td>
                  <span className={styles.codePill}>{log.category}</span>
                </td>
                <td style={{ fontWeight: 600 }}>{log.action}</td>
                <td style={{ fontWeight: 500 }}>{log.targetResource}</td>
                <td style={{ color: 'var(--color-text-secondary)' }}>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * J2. PLATFORM ACTIVITY PAGE
 */
export function PlatformActivityPage() {
  const auditLogs = usePlatformAdminStore((s) => s.auditLogs);
  const payments = usePlatformAdminStore((s) => s.payments);

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <div>
          <span className={styles.contextBadge}>Platform Admin · Operations Stream</span>
          <h1 className={styles.pageTitle}>Platform Activity Stream</h1>
          <p className={styles.pageSubtitle}>
            Chronological feed of administrative actions, tenant onboarding events, and billing
            settlements across ShelfAware.
          </p>
        </div>
      </div>

      <div className={styles.twoColGrid}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Administrative & Provisioning Feed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <strong>{log.action}</strong>
                  <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                    {formatFullDateTime(log.createdAt)}
                  </span>
                </div>
                <div style={{ fontSize: '12.5px' }}>
                  Target: <strong>{log.targetResource}</strong> · Actor: {log.actorName}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  {log.details}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>Gateway Billing Events</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {payments.map((pay) => (
              <div
                key={pay.id}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <strong>{pay.businessName}</strong>
                  <StatusIndicator
                    tone={pay.status === 'succeeded' ? 'success' : 'danger'}
                    label={pay.status}
                    appearance="tag"
                  />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  {pay.planName} · {pay.gateway} ({pay.reference})
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * J3. SYSTEM HEALTH PAGE
 */
export function SystemHealthPage() {
  const systemHealthNodes = usePlatformAdminStore((s) => s.systemHealthNodes);

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <div>
          <span className={styles.contextBadge}>Platform Admin · Infrastructure Status</span>
          <h1 className={styles.pageTitle}>System Health & Backend Dependency Status</h1>
          <p className={styles.pageSubtitle}>
            Transparently reports whether live backend monitoring endpoints are connected. Does not
            invent fake server CPU, memory, or uptime metrics when running in frontend prototype
            mode.
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Service Node Telemetry Status</div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Service Component</th>
                <th>Responsibility Scope</th>
                <th>Telemetry State</th>
                <th>Status Note</th>
              </tr>
            </thead>
            <tbody>
              {systemHealthNodes.map((node) => (
                <tr key={node.id}>
                  <td style={{ fontWeight: 600 }}>{node.serviceName}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{node.scope}</td>
                  <td>
                    <StatusIndicator
                      tone={
                        node.reportedState === 'operational'
                          ? 'success'
                          : node.reportedState === 'degraded'
                          ? 'danger'
                          : 'neutral'
                      }
                      label={
                        node.reportedState === 'telemetry_unconnected'
                          ? 'Mock Mode (Unconnected)'
                          : node.reportedState
                      }
                      appearance="tag"
                    />
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {node.latencyNote}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          Backend API Dependencies Required for Production Deployment
        </div>
        <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
          The following backend endpoints are expected when switching{' '}
          <span className={styles.codePill}>VITE_USE_MOCK_API=false</span>:
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Portal Scope</th>
                <th>REST Endpoint Contract</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Platform Admin</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  GET / POST /api/v1/platform/tenants
                </td>
                <td>List all registered businesses and queue assisted tenant onboarding</td>
              </tr>
              <tr>
                <td>Platform Admin</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  PATCH /api/v1/platform/tenants/:id/status
                </td>
                <td>Suspend or reactivate tenant account with mandatory audit log record</td>
              </tr>
              <tr>
                <td>Platform Admin</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  POST /api/v1/platform/tenants/:id/verification
                </td>
                <td>Approve, reject, or request KYB verification documents</td>
              </tr>
              <tr>
                <td>Platform Admin</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  GET / PUT /api/v1/platform/features & /plans
                </td>
                <td>Manage global feature kill-switches and subscription plan entitlements</td>
              </tr>
              <tr>
                <td>Super Business Admin</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  GET / PUT /api/v1/business-admin/branches & /hours
                </td>
                <td>Manage tenant branch locations, operating hours, and holiday closures</td>
              </tr>
              <tr>
                <td>Super Business Admin</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  GET / PUT /api/v1/business-admin/roles & /employees
                </td>
                <td>Enforce tenant RBAC permission matrix and employee branch assignments</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
