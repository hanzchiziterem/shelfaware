import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useAuthStore } from '@/store/authStore';
import { usePlatformAdminStore } from '@/store/platformAdminStore';
import { useUiStore } from '@/store/uiStore';
import type {
  DatabaseTenancyStrategy,
  ProvisioningState,
  TenantBusiness,
  VerificationStatus,
} from '@/types/adminPortals';
import { formatCurrency } from '@/utils/currency';
import { formatFullDateTime, formatShortDate } from '@/utils/dates';
import styles from './PlatformAdmin.module.css';

/**
 * B. ALL BUSINESSES PAGE
 */
export function AllBusinessesPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const pushToast = useUiStore((s) => s.pushToast);

  const businesses = usePlatformAdminStore((s) => s.businesses);
  const plans = usePlatformAdminStore((s) => s.plans);
  const suspendOrReactivateBusiness = usePlatformAdminStore(
    (s) => s.suspendOrReactivateBusiness
  );
  const changeTenantPlan = usePlatformAdminStore((s) => s.changeTenantPlan);

  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [accountStatusFilter, setAccountStatusFilter] = useState<string>('all');
  const [dbStrategyFilter, setDbStrategyFilter] = useState<string>('all');
  const [selectedTenantId, setSelectedTenantId] = useState<string>(businesses[0]?.id || '');

  // Suspension / Reactivation Confirmation Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusReason, setStatusReason] = useState('');

  // Plan review modal
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('plan-growth');

  const selectedTenant = businesses.find((b) => b.id === selectedTenantId) || null;

  const filteredBusinesses = businesses.filter((b) => {
    if (verificationFilter !== 'all' && b.verificationStatus !== verificationFilter) return false;
    if (accountStatusFilter !== 'all' && b.accountStatus !== accountStatusFilter) return false;
    if (dbStrategyFilter !== 'all' && b.databaseStrategy !== dbStrategyFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        b.businessName.toLowerCase().includes(q) ||
        b.tenantSlug.toLowerCase().includes(q) ||
        b.subdomain.toLowerCase().includes(q) ||
        b.primaryContactEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleConfirmAccountAction = () => {
    if (!selectedTenant) return;
    if (!statusReason.trim()) {
      pushToast({ title: 'Provide an administrative reason for the audit log', tone: 'error' });
      return;
    }

    const action = selectedTenant.accountStatus === 'suspended' ? 'reactivate' : 'suspend';
    suspendOrReactivateBusiness(
      selectedTenant.id,
      action,
      statusReason.trim(),
      user?.fullName || 'Tunde Bakare (Platform Admin)'
    );
    setStatusModalOpen(false);
    setStatusReason('');
    pushToast({
      title:
        action === 'suspend'
          ? `Suspended ${selectedTenant.businessName}`
          : `Reactivated ${selectedTenant.businessName}`,
      description: 'Audit record written to Platform Audit Logs.',
      tone: action === 'suspend' ? 'warning' : 'success',
    });
  };

  const handleConfirmPlanChange = () => {
    if (!selectedTenant) return;
    changeTenantPlan(
      selectedTenant.id,
      selectedPlanId,
      user?.fullName || 'Tunde Bakare (Platform Admin)'
    );
    setPlanModalOpen(false);
    pushToast({
      title: `Updated subscription plan for ${selectedTenant.businessName}`,
      tone: 'success',
    });
  };

  return (
    <div className={`${styles.splitWrap} ${!selectedTenant ? styles.splitWrapFull : ''}`}>
      <div className={styles.mainCol}>
        <div className={styles.headerRow}>
          <div>
            <span className={styles.contextBadge}>Platform Admin · Business Management</span>
            <h1 className={styles.pageTitle}>All Registered Businesses</h1>
            <p className={styles.pageSubtitle}>
              Searchable tenant directory with verification status, subscription state, database
              strategy, and auditable account controls.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate(PATHS.PLATFORM.ONBOARDING)}
          >
            + Onboard New Business
          </Button>
        </div>

        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <select
              aria-label="Filter by verification status"
              className={styles.selectFilter}
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
            >
              <option value="all">Verification: All</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              aria-label="Filter by account status"
              className={styles.selectFilter}
              value={accountStatusFilter}
              onChange={(e) => setAccountStatusFilter(e.target.value)}
            >
              <option value="all">Account: All</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="onboarding">Onboarding</option>
            </select>

            <select
              aria-label="Filter by database strategy"
              className={styles.selectFilter}
              value={dbStrategyFilter}
              onChange={(e) => setDbStrategyFilter(e.target.value)}
            >
              <option value="all">DB Strategy: All</option>
              <option value="shared_schema">Shared Schema</option>
              <option value="dedicated_instance">Dedicated DB</option>
            </select>
          </div>

          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search business, tenant slug, subdomain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Business Type</th>
                <th>Tenant ID / Subdomain</th>
                <th>Registered</th>
                <th>Verification</th>
                <th>Subscription</th>
                <th>DB Strategy</th>
                <th>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBusinesses.map((biz) => {
                const isSelected = selectedTenant?.id === biz.id;
                return (
                  <tr
                    key={biz.id}
                    className={isSelected ? styles.activeRow : ''}
                    onClick={() => setSelectedTenantId(biz.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 600 }}>{biz.businessName}</td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{biz.businessType}</td>
                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                        {biz.tenantSlug}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {biz.subdomain}
                      </div>
                    </td>
                    <td className="tabular-nums">{formatShortDate(biz.registeredAt)}</td>
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
                    <td>
                      <div>{biz.subscriptionPlanName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {biz.subscriptionStatus}
                      </div>
                    </td>
                    <td>
                      <span className={styles.codePill}>
                        {biz.databaseStrategy === 'dedicated_instance'
                          ? 'Dedicated DB'
                          : 'Shared Schema'}
                      </span>
                    </td>
                    <td>
                      {biz.accountStatus === 'active' && (
                        <StatusIndicator tone="success" label="Active" />
                      )}
                      {biz.accountStatus === 'suspended' && (
                        <StatusIndicator tone="danger" label="Suspended" />
                      )}
                      {biz.accountStatus === 'onboarding' && (
                        <StatusIndicator tone="warning" label="Onboarding" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Contextual Tenant Inspector */}
      {selectedTenant && (
        <aside className={styles.sideDrawer} aria-label="Tenant Business Details">
          <div className={styles.drawerHeader}>
            <div>
              <div className={styles.drawerTitle}>{selectedTenant.businessName}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {selectedTenant.subdomain}
              </div>
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              aria-label="Close tenant inspector"
              onClick={() => setSelectedTenantId('')}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              variant={selectedTenant.accountStatus === 'suspended' ? 'primary' : 'danger'}
              size="sm"
              onClick={() => {
                setStatusReason('');
                setStatusModalOpen(true);
              }}
            >
              {selectedTenant.accountStatus === 'suspended'
                ? 'Reactivate Business'
                : 'Suspend Business'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedPlanId(selectedTenant.subscriptionPlanId);
                setPlanModalOpen(true);
              }}
            >
              Review Subscription
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(PATHS.PLATFORM.SUPPORT)}
            >
              Support Workflow
            </Button>
          </div>

          <div className={styles.kvGrid}>
            <span className={styles.kvLabel}>Tenant Slug</span>
            <span className={styles.kvValue} style={{ fontFamily: 'var(--font-mono)' }}>
              {selectedTenant.tenantSlug}
            </span>

            <span className={styles.kvLabel}>Business Type</span>
            <span className={styles.kvValue}>{selectedTenant.businessType}</span>

            <span className={styles.kvLabel}>Primary Contact</span>
            <span className={styles.kvValue}>{selectedTenant.primaryContactName}</span>

            <span className={styles.kvLabel}>Contact Email</span>
            <span className={styles.kvValue}>{selectedTenant.primaryContactEmail}</span>

            <span className={styles.kvLabel}>Contact Phone</span>
            <span className={styles.kvValue}>{selectedTenant.primaryContactPhone}</span>

            <span className={styles.kvLabel}>Location</span>
            <span className={styles.kvValue}>{selectedTenant.city}</span>

            <span className={styles.kvLabel}>CAC Number</span>
            <span className={styles.kvValue} style={{ fontFamily: 'var(--font-mono)' }}>
              {selectedTenant.cacRegistrationNumber}
            </span>

            <span className={styles.kvLabel}>Verification</span>
            <span className={styles.kvValue} style={{ textTransform: 'capitalize' }}>
              {selectedTenant.verificationStatus.replace('_', ' ')}
            </span>

            <span className={styles.kvLabel}>Assigned Plan</span>
            <span className={styles.kvValue}>
              {selectedTenant.subscriptionPlanName} (
              {formatCurrency(selectedTenant.mrrContribution, 'NGN', 'en-NG')}/mo)
            </span>

            <span className={styles.kvLabel}>DB Tenancy</span>
            <span className={styles.kvValue}>
              {selectedTenant.databaseStrategy === 'dedicated_instance'
                ? 'Dedicated Database Instance'
                : 'Shared Multi-Tenant Schema'}
            </span>

            <span className={styles.kvLabel}>Provisioning</span>
            <span className={styles.kvValue} style={{ textTransform: 'uppercase' }}>
              {selectedTenant.provisioningStatus}
            </span>

            <span className={styles.kvLabel}>Connection Ref</span>
            <span className={styles.kvValue} style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>
              {selectedTenant.connectionRef}
            </span>

            <span className={styles.kvLabel}>Footprint</span>
            <span className={styles.kvValue}>
              {selectedTenant.branchesCount} branch(es) · {selectedTenant.employeesCount} staff
            </span>
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              Enabled Tenant Modules ({selectedTenant.enabledModules.length})
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {selectedTenant.enabledModules.map((mod) => (
                <span key={mod} className={styles.codePill}>
                  {mod}
                </span>
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* Confirm Suspension / Reactivation Modal */}
      <Dialog
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={
          selectedTenant?.accountStatus === 'suspended'
            ? `Reactivate ${selectedTenant.businessName}?`
            : `Suspend ${selectedTenant?.businessName || ''}?`
        }
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={selectedTenant?.accountStatus === 'suspended' ? 'primary' : 'danger'}
              onClick={handleConfirmAccountAction}
            >
              {selectedTenant?.accountStatus === 'suspended'
                ? 'Confirm Reactivation & Audit'
                : 'Confirm Suspension & Audit'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {selectedTenant?.accountStatus === 'suspended'
              ? 'Reactivating this tenant restores access for all store branches and POS terminals.'
              : 'Suspending this tenant blocks new logins and POS synchronization until resolved. An immutable entry will be recorded in the Platform Audit Logs.'}
          </p>
          <div className={styles.fieldCol}>
            <label htmlFor="susp-reason" className={styles.label}>
              Mandatory Audit Reason
            </label>
            <textarea
              id="susp-reason"
              className={styles.textarea}
              placeholder="e.g. Overdue subscription invoice settled via bank transfer / Compliance hold..."
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
            />
          </div>
        </div>
      </Dialog>

      {/* Review Subscription Plan Modal */}
      <Dialog
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title={`Review Subscription — ${selectedTenant?.businessName || ''}`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPlanModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmPlanChange}>
              Update Assigned Plan
            </Button>
          </>
        }
      >
        <div className={styles.fieldCol}>
          <label htmlFor="rev-plan" className={styles.label}>
            Assigned Subscription Plan
          </label>
          <select
            id="rev-plan"
            className={styles.select}
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {formatCurrency(p.price, 'NGN', 'en-NG')}/{p.billingInterval}
              </option>
            ))}
          </select>
        </div>
      </Dialog>
    </div>
  );
}

/**
 * C. BUSINESS VERIFICATION PAGE
 */
export function BusinessVerificationPage() {
  const user = useAuthStore((s) => s.user);
  const pushToast = useUiStore((s) => s.pushToast);
  const businesses = usePlatformAdminStore((s) => s.businesses);
  const decideBusinessVerification = usePlatformAdminStore(
    (s) => s.decideBusinessVerification
  );

  const [statusFilter, setStatusFilter] = useState<'all' | VerificationStatus>('all');
  const [selectedBiz, setSelectedBiz] = useState<TenantBusiness | null>(businesses[2] || businesses[0] || null);
  const [decisionNotes, setDecisionNotes] = useState('');

  const filtered = businesses.filter((b) =>
    statusFilter === 'all' ? true : b.verificationStatus === statusFilter
  );

  const handleDecision = (nextStatus: VerificationStatus) => {
    if (!selectedBiz) return;
    decideBusinessVerification(
      selectedBiz.id,
      nextStatus,
      decisionNotes.trim() || `KYB status set to ${nextStatus} after document inspection.`,
      user?.fullName || 'Tunde Bakare (Platform Admin)'
    );
    const updated = usePlatformAdminStore
      .getState()
      .businesses.find((b) => b.id === selectedBiz.id);
    if (updated) setSelectedBiz(updated);
    setDecisionNotes('');
    pushToast({
      title: `Marked ${selectedBiz.businessName} as ${nextStatus.replace('_', ' ')}`,
      description: `Recorded decision by ${user?.fullName || 'Platform Admin'}.`,
      tone: nextStatus === 'verified' ? 'success' : nextStatus === 'rejected' ? 'error' : 'info',
    });
  };

  return (
    <div className={`${styles.splitWrap} ${!selectedBiz ? styles.splitWrapFull : ''}`}>
      <div className={styles.mainCol}>
        <div className={styles.headerRow}>
          <div>
            <span className={styles.contextBadge}>Platform Admin · KYB Compliance</span>
            <h1 className={styles.pageTitle}>Business Verification</h1>
            <p className={styles.pageSubtitle}>
              Inspect CAC registration certificates, FIRS tax clearance, and approve or reject
              tenant verification independent of subscription billing status.
            </p>
          </div>
        </div>

        <div className={styles.filterGroup}>
          {(['all', 'pending', 'under_review', 'verified', 'rejected'] as const).map((st) => (
            <Button
              key={st}
              variant={statusFilter === st ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter(st)}
            >
              {st === 'all'
                ? `All (${businesses.length})`
                : `${st.replace('_', ' ').toUpperCase()} (${
                    businesses.filter((b) => b.verificationStatus === st).length
                  })`}
            </Button>
          ))}
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Business</th>
                <th>CAC / Registration No.</th>
                <th>FIRS TIN</th>
                <th>Documents</th>
                <th>Verification Status</th>
                <th>Reviewed By</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((biz) => (
                <tr
                  key={biz.id}
                  className={selectedBiz?.id === biz.id ? styles.activeRow : ''}
                  onClick={() => setSelectedBiz(biz)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ fontWeight: 600 }}>{biz.businessName}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                    {biz.cacRegistrationNumber}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                    {biz.taxIdentificationNumber}
                  </td>
                  <td>{biz.submittedDocuments.length} file(s)</td>
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
                  <td style={{ color: 'var(--color-text-secondary)' }}>
                    {biz.verifiedBy || 'Unassigned'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBiz && (
        <aside className={styles.sideDrawer} aria-label="KYB Document Review Panel">
          <div className={styles.drawerHeader}>
            <div>
              <div className={styles.drawerTitle}>{selectedBiz.businessName}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                CAC: {selectedBiz.cacRegistrationNumber} · TIN: {selectedBiz.taxIdentificationNumber}
              </div>
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setSelectedBiz(null)}
            >
              ✕
            </button>
          </div>

          <div className={styles.kvGrid}>
            <span className={styles.kvLabel}>Current Status</span>
            <span className={styles.kvValue} style={{ textTransform: 'uppercase' }}>
              {selectedBiz.verificationStatus.replace('_', ' ')}
            </span>

            <span className={styles.kvLabel}>Primary Owner</span>
            <span className={styles.kvValue}>{selectedBiz.primaryContactName}</span>

            <span className={styles.kvLabel}>Last Reviewer</span>
            <span className={styles.kvValue}>{selectedBiz.verifiedBy || 'Not yet reviewed'}</span>

            <span className={styles.kvLabel}>Reviewer Notes</span>
            <span className={styles.kvValue}>
              {selectedBiz.verificationNotes || 'No compliance notes recorded yet.'}
            </span>
          </div>

          <div>
            <div style={{ fontSize: '12.5px', fontWeight: 600, marginBottom: '8px' }}>
              Submitted Verification Documents ({selectedBiz.submittedDocuments.length})
            </div>
            {selectedBiz.submittedDocuments.length === 0 ? (
              <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
                No KYB documents uploaded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedBiz.submittedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-control)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface-muted)',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{doc.title}</div>
                    <div style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {doc.fileType} · Uploaded {doc.uploadedAt}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.fieldCol}>
            <label htmlFor="kyb-notes" className={styles.label}>
              Verification Decision Notes / Additional Info Request
            </label>
            <textarea
              id="kyb-notes"
              className={styles.textarea}
              placeholder="Record CAC registry check details or specify missing documents..."
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleDecision('verified')}
            >
              ✓ Approve & Verify
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDecision('under_review')}
            >
              Request Info / Under Review
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDecision('rejected')}
            >
              ✕ Reject
            </Button>
          </div>
        </aside>
      )}
    </div>
  );
}

/**
 * D. BUSINESS ONBOARDING PAGE
 */
export function BusinessOnboardingPage() {
  const user = useAuthStore((s) => s.user);
  const pushToast = useUiStore((s) => s.pushToast);
  const plans = usePlatformAdminStore((s) => s.plans);
  const features = usePlatformAdminStore((s) => s.features);
  const onboardNewBusiness = usePlatformAdminStore((s) => s.onboardNewBusiness);
  const advanceProvisioningState = usePlatformAdminStore((s) => s.advanceProvisioningState);
  const businesses = usePlatformAdminStore((s) => s.businesses);

  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Supermarket & Coldroom Depot');
  const [tenantSlug, setTenantSlug] = useState('');
  const [primaryContactName, setPrimaryContactName] = useState('');
  const [primaryContactEmail, setPrimaryContactEmail] = useState('');
  const [primaryContactPhone, setPrimaryContactPhone] = useState('+234 803 ');
  const [city, setCity] = useState('Ikeja, Lagos');
  const [stateName, setStateName] = useState('Lagos');
  const [cacNumber, setCacNumber] = useState('RC-');
  const [tinNumber, setTinNumber] = useState('TIN-');
  const [subscriptionPlanId, setSubscriptionPlanId] = useState('plan-growth');
  const [databaseStrategy, setDatabaseStrategy] =
    useState<DatabaseTenancyStrategy>('shared_schema');
  const [selectedModules, setSelectedModules] = useState<string[]>([
    'pos',
    'inventory',
    'products',
    'purchases',
    'customers',
    'suppliers',
    'reports',
  ]);

  const [stagedTenantId, setStagedTenantId] = useState<string | null>(null);
  const stagedTenant = businesses.find((b) => b.id === stagedTenantId) || null;

  const handleInitiateOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !tenantSlug.trim() || !primaryContactEmail.trim()) {
      pushToast({
        title: 'Business name, unique tenant slug, and Super Business Admin email are required',
        tone: 'error',
      });
      return;
    }

    const created = onboardNewBusiness(
      {
        businessName,
        businessType,
        tenantSlug,
        primaryContactName: primaryContactName || 'Tenant Owner',
        primaryContactEmail,
        primaryContactPhone,
        city,
        state: stateName,
        cacRegistrationNumber: cacNumber,
        taxIdentificationNumber: tinNumber,
        subscriptionPlanId,
        databaseStrategy,
        enabledModules: selectedModules,
      },
      user?.fullName || 'Tunde Bakare (Platform Admin)'
    );

    setStagedTenantId(created.id);
    pushToast({
      title: `Queued provisioning for ${created.businessName}`,
      description:
        'Form submission only stages the tenant record. Advance or monitor database provisioning below.',
      tone: 'info',
    });
  };

  const handleAdvanceStage = (nextState: ProvisioningState) => {
    if (!stagedTenant) return;
    advanceProvisioningState(
      stagedTenant.id,
      nextState,
      user?.fullName || 'Tunde Bakare (Platform Admin)'
    );
    pushToast({
      title: `Provisioning stage updated to ${nextState.toUpperCase()}`,
      tone: nextState === 'ready' ? 'success' : 'info',
    });
  };

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <div>
          <span className={styles.contextBadge}>Platform Admin · Assisted Onboarding</span>
          <h1 className={styles.pageTitle}>Assisted Business Onboarding</h1>
          <p className={styles.pageSubtitle}>
            Register a new retail tenant, assign its subdomain slug, select its subscription plan
            and database tenancy strategy, and initiate provisioning.
          </p>
        </div>
      </div>

      <div className={styles.twoColGrid}>
        <form className={styles.card} onSubmit={handleInitiateOnboarding}>
          <div className={styles.cardTitle}>1. Tenant Registration & Super Business Admin</div>
          <div className={styles.formGrid}>
            <div className={styles.fieldFull}>
              <label htmlFor="onb-name" className={styles.label}>
                Legal Business Name
              </label>
              <input
                id="onb-name"
                className={styles.input}
                placeholder="e.g. Balogun Market Foodstuff Hub Ltd"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  if (!tenantSlug) {
                    setTenantSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '')
                    );
                  }
                }}
              />
            </div>

            <div className={styles.fieldCol}>
              <label htmlFor="onb-slug" className={styles.label}>
                Unique Tenant Slug
              </label>
              <input
                id="onb-slug"
                className={styles.input}
                placeholder="balogun-foodhub"
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value)}
              />
            </div>

            <div className={styles.fieldCol}>
              <label htmlFor="onb-type" className={styles.label}>
                Business Type
              </label>
              <select
                id="onb-type"
                className={styles.select}
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
              >
                <option value="Supermarket & Coldroom Depot">Supermarket & Coldroom Depot</option>
                <option value="Wholesale Grain & Oil Distributor">
                  Wholesale Grain & Oil Distributor
                </option>
                <option value="Multi-Branch Grocery Chain">Multi-Branch Grocery Chain</option>
                <option value="Neighbourhood Provision Store">Neighbourhood Provision Store</option>
              </select>
            </div>

            <div className={styles.fieldCol}>
              <label htmlFor="onb-admin-name" className={styles.label}>
                Initial Super Business Admin Name
              </label>
              <input
                id="onb-admin-name"
                className={styles.input}
                placeholder="e.g. Alhaji Suleiman Bello"
                value={primaryContactName}
                onChange={(e) => setPrimaryContactName(e.target.value)}
              />
            </div>

            <div className={styles.fieldCol}>
              <label htmlFor="onb-admin-email" className={styles.label}>
                Super Business Admin Email
              </label>
              <input
                id="onb-admin-email"
                type="email"
                className={styles.input}
                placeholder="owner@balogunfoodhub.ng"
                value={primaryContactEmail}
                onChange={(e) => setPrimaryContactEmail(e.target.value)}
              />
            </div>

            <div className={styles.fieldCol}>
              <label htmlFor="onb-phone" className={styles.label}>
                Primary Phone
              </label>
              <input
                id="onb-phone"
                className={styles.input}
                value={primaryContactPhone}
                onChange={(e) => setPrimaryContactPhone(e.target.value)}
              />
            </div>

            <div className={styles.fieldCol}>
              <label htmlFor="onb-city" className={styles.label}>
                City & State
              </label>
              <input
                id="onb-city"
                className={styles.input}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className={styles.fieldCol}>
              <label htmlFor="onb-plan" className={styles.label}>
                Assigned Subscription Plan
              </label>
              <select
                id="onb-plan"
                className={styles.select}
                value={subscriptionPlanId}
                onChange={(e) => setSubscriptionPlanId(e.target.value)}
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatCurrency(p.price, 'NGN', 'en-NG')}/mo)
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldCol}>
              <label htmlFor="onb-db" className={styles.label}>
                Database Tenancy Strategy
              </label>
              <select
                id="onb-db"
                className={styles.select}
                value={databaseStrategy}
                onChange={(e) =>
                  setDatabaseStrategy(e.target.value as DatabaseTenancyStrategy)
                }
              >
                <option value="shared_schema">Shared Database (Isolated PostgreSQL Schema)</option>
                <option value="dedicated_instance">
                  Dedicated Database Instance (Isolated RDS)
                </option>
              </select>
            </div>

            <div className={styles.fieldFull}>
              <span className={styles.label}>Enabled Modules for Tenant</span>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                {features.map((feat) => {
                  const checked = selectedModules.includes(feat.key);
                  return (
                    <label
                      key={feat.key}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12.5px',
                        padding: '5px 10px',
                        borderRadius: 'var(--radius-control)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface-muted)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setSelectedModules((prev) =>
                            e.target.checked
                              ? [...prev, feat.key]
                              : prev.filter((k) => k !== feat.key)
                          )
                        }
                      />
                      <span>{feat.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '8px' }}>
            <Button type="submit" variant="primary">
              Stage Tenant & Queue Provisioning
            </Button>
          </div>
        </form>

        {/* Provisioning Pipeline Tracker */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>2. Tenant Provisioning Pipeline Status</div>
          <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            Submitting the onboarding form stages the tenant record in the <strong>QUEUED</strong>{' '}
            state. A business is not live until database schema creation, migrations, and initial
            Super Business Admin role seeding reach <strong>READY</strong>.
          </p>

          {!stagedTenant ? (
            <div
              style={{
                padding: '24px',
                borderRadius: 'var(--radius-card)',
                backgroundColor: 'var(--color-surface-muted)',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
              }}
            >
              No newly staged tenant in this session. Submit the form on the left to queue a new
              tenant provisioning job.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className={styles.kvGrid}>
                <span className={styles.kvLabel}>Staged Tenant</span>
                <span className={styles.kvValue}>{stagedTenant.businessName}</span>

                <span className={styles.kvLabel}>Subdomain</span>
                <span className={styles.kvValue} style={{ fontFamily: 'var(--font-mono)' }}>
                  {stagedTenant.subdomain}
                </span>

                <span className={styles.kvLabel}>Super Admin</span>
                <span className={styles.kvValue}>{stagedTenant.primaryContactEmail}</span>

                <span className={styles.kvLabel}>Connection Ref</span>
                <span className={styles.kvValue} style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>
                  {stagedTenant.connectionRef}
                </span>

                <span className={styles.kvLabel}>Pipeline State</span>
                <span className={styles.kvValue} style={{ fontWeight: 700 }}>
                  {stagedTenant.provisioningStatus.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(
                  [
                    'queued',
                    'provisioning_db',
                    'applying_migrations',
                    'seeding_defaults',
                    'ready',
                  ] as ProvisioningState[]
                ).map((step) => (
                  <Button
                    key={step}
                    size="sm"
                    variant={stagedTenant.provisioningStatus === step ? 'primary' : 'secondary'}
                    onClick={() => handleAdvanceStage(step)}
                  >
                    {step.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * E. DATABASE & PROVISIONING PAGE
 */
export function DatabaseProvisioningPage() {
  const user = useAuthStore((s) => s.user);
  const pushToast = useUiStore((s) => s.pushToast);
  const businesses = usePlatformAdminStore((s) => s.businesses);
  const advanceProvisioningState = usePlatformAdminStore((s) => s.advanceProvisioningState);

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <div>
          <span className={styles.contextBadge}>Platform Admin · Infrastructure</span>
          <h1 className={styles.pageTitle}>Database & Tenant Provisioning</h1>
          <p className={styles.pageSubtitle}>
            Inspect shared-schema vs dedicated-database tenancy and non-sensitive connection
            references. Passwords, secrets, and raw DSN strings are never exposed to the browser.
          </p>
        </div>
      </div>

      <div className={styles.kpiGrid3}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiValue}>
            {businesses.filter((b) => b.databaseStrategy === 'shared_schema').length}
          </span>
          <span className={styles.kpiLabel}>Shared Database Tenancy</span>
          <span className={styles.kpiSub}>Schema-isolated PostgreSQL pool (Starter & Growth)</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiValue}>
            {businesses.filter((b) => b.databaseStrategy === 'dedicated_instance').length}
          </span>
          <span className={styles.kpiLabel}>Dedicated Database Tenancy</span>
          <span className={styles.kpiSub}>Physically isolated RDS instances (Enterprise)</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiValue}>
            {businesses.filter((b) => b.provisioningStatus === 'ready').length} / {businesses.length}
          </span>
          <span className={styles.kpiLabel}>Provisioned & Ready Tenants</span>
          <span className={styles.kpiSub}>Zero credentials or secret tokens exposed in UI</span>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tenant Name</th>
              <th>Database Strategy</th>
              <th>Provisioning Status</th>
              <th>Connection Configuration Reference (Sanitized)</th>
              <th>Last Provisioning Activity</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((biz) => (
              <tr key={biz.id}>
                <td style={{ fontWeight: 600 }}>{biz.businessName}</td>
                <td>
                  <span className={styles.codePill}>
                    {biz.databaseStrategy === 'dedicated_instance'
                      ? 'Dedicated Database'
                      : 'Shared Database (Schema)'}
                  </span>
                </td>
                <td>
                  {biz.provisioningStatus === 'ready' ? (
                    <StatusIndicator tone="success" label="Ready" appearance="tag" />
                  ) : biz.provisioningStatus === 'failed' ? (
                    <StatusIndicator tone="danger" label="Failed" appearance="tag" />
                  ) : (
                    <StatusIndicator
                      tone="warning"
                      label={biz.provisioningStatus.replace('_', ' ')}
                      appearance="tag"
                    />
                  )}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  {biz.connectionRef}
                </td>
                <td className="tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                  {formatFullDateTime(biz.lastProvisionedAt)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {biz.provisioningStatus !== 'ready' ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        advanceProvisioningState(
                          biz.id,
                          'ready',
                          user?.fullName || 'Tunde Bakare'
                        );
                        pushToast({
                          title: `Provisioning marked READY for ${biz.businessName}`,
                          tone: 'success',
                        });
                      }}
                    >
                      Complete Provisioning
                    </Button>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      Verified Active
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
