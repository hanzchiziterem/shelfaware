import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { TENANT_PERMISSION_CATALOG } from '@/mocks/adminPortalsMockData';
import { useAuthStore } from '@/store/authStore';
import { usePlatformAdminStore } from '@/store/platformAdminStore';
import { useUiStore } from '@/store/uiStore';
import { formatShortDate } from '@/utils/dates';
import styles from './PlatformAdmin.module.css';

/**
 * G. GLOBAL ROLE TEMPLATES PAGE
 */
export function GlobalRoleTemplatesPage() {
  const user = useAuthStore((s) => s.user);
  const pushToast = useUiStore((s) => s.pushToast);
  const roleTemplates = usePlatformAdminStore((s) => s.roleTemplates);
  const updateRoleTemplatePermissions = usePlatformAdminStore(
    (s) => s.updateRoleTemplatePermissions
  );
  const createGlobalRoleTemplate = usePlatformAdminStore((s) => s.createGlobalRoleTemplate);

  const [selectedTplId, setSelectedTplId] = useState(roleTemplates[0]?.id || '');
  const [createOpen, setCreateOpen] = useState(false);
  const [tplName, setTplName] = useState('');
  const [tplCode, setTplCode] = useState('');
  const [tplDesc, setTplDesc] = useState('');

  const selectedTemplate =
    roleTemplates.find((r) => r.id === selectedTplId) || roleTemplates[0];

  const handleTogglePermission = (permKey: string, checked: boolean) => {
    if (!selectedTemplate) return;
    const next = checked
      ? Array.from(new Set([...selectedTemplate.permissions, permKey]))
      : selectedTemplate.permissions.filter((k) => k !== permKey);

    updateRoleTemplatePermissions(
      selectedTemplate.id,
      next,
      user?.fullName || 'Tunde Bakare (Platform Admin)'
    );
    pushToast({
      title: `Updated global role template "${selectedTemplate.name}"`,
      description: 'New tenants will inherit this baseline template.',
      tone: 'info',
    });
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplName.trim() || !tplCode.trim()) return;
    createGlobalRoleTemplate(
      {
        name: tplName,
        code: tplCode,
        description: tplDesc || 'Standard platform role template for retail tenants.',
        permissions: ['sales.view', 'products.view', 'inventory.view'],
      },
      user?.fullName || 'Tunde Bakare (Platform Admin)'
    );
    setCreateOpen(false);
    setTplName('');
    setTplCode('');
    setTplDesc('');
    pushToast({ title: `Created global role template "${tplName}"`, tone: 'success' });
  };

  const groupedModules = Array.from(
    new Set(TENANT_PERMISSION_CATALOG.map((p) => p.module))
  );

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <div>
          <span className={styles.contextBadge}>Platform Admin · Platform Configuration</span>
          <h1 className={styles.pageTitle}>Global Role Templates</h1>
          <p className={styles.pageSubtitle}>
            Define baseline role templates provisioned into new tenant workspaces. Routine
            employee and custom role management inside individual stores belongs to each tenant's
            Super Business Admin.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          + New Global Role Template
        </Button>
      </div>

      <div className={styles.filterGroup}>
        {roleTemplates.map((tpl) => (
          <Button
            key={tpl.id}
            size="sm"
            variant={selectedTemplate?.id === tpl.id ? 'primary' : 'secondary'}
            onClick={() => setSelectedTplId(tpl.id)}
          >
            {tpl.name} ({tpl.permissions.length})
          </Button>
        ))}
      </div>

      {selectedTemplate && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardTitle}>
                Template: {selectedTemplate.name}{' '}
                <span className={styles.codePill}>{selectedTemplate.code}</span>
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                {selectedTemplate.description}
              </div>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Updated {formatShortDate(selectedTemplate.updatedAt)}
            </span>
          </div>

          <div className={styles.matrixGrid}>
            {groupedModules.map((modName) => (
              <div key={modName} className={styles.card}>
                <div className={styles.cardTitle}>{modName}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {TENANT_PERMISSION_CATALOG.filter((p) => p.module === modName).map((perm) => {
                    const isChecked = selectedTemplate.permissions.includes(perm.key);
                    return (
                      <label key={perm.key} className={styles.permissionRow}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            handleTogglePermission(perm.key, e.target.checked)
                          }
                        />
                        <div>
                          <div style={{ fontWeight: 600 }}>{perm.label}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                            {perm.description}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Global Role Template"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateTemplate}>
              Save Template
            </Button>
          </>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} onSubmit={handleCreateTemplate}>
          <div className={styles.fieldCol}>
            <label htmlFor="gt-name" className={styles.label}>
              Template Name
            </label>
            <input
              id="gt-name"
              className={styles.input}
              placeholder="e.g. Coldroom Inventory Supervisor"
              value={tplName}
              onChange={(e) => setTplName(e.target.value)}
            />
          </div>
          <div className={styles.fieldCol}>
            <label htmlFor="gt-code" className={styles.label}>
              Template Code
            </label>
            <input
              id="gt-code"
              className={styles.input}
              placeholder="coldroom_supervisor"
              value={tplCode}
              onChange={(e) => setTplCode(e.target.value)}
            />
          </div>
          <div className={styles.fieldCol}>
            <label htmlFor="gt-desc" className={styles.label}>
              Description
            </label>
            <input
              id="gt-desc"
              className={styles.input}
              placeholder="Manages perishable stock batches and supplier receiving."
              value={tplDesc}
              onChange={(e) => setTplDesc(e.target.value)}
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
}

/**
 * H. FEATURE MANAGEMENT PAGE
 */
export function FeatureManagementPage() {
  const user = useAuthStore((s) => s.user);
  const pushToast = useUiStore((s) => s.pushToast);
  const features = usePlatformAdminStore((s) => s.features);
  const toggleGlobalFeature = usePlatformAdminStore((s) => s.toggleGlobalFeature);
  const updateFeatureEligiblePlans = usePlatformAdminStore(
    (s) => s.updateFeatureEligiblePlans
  );

  const handleToggleGlobal = (featId: string, name: string, nextVal: boolean) => {
    toggleGlobalFeature(featId, nextVal, user?.fullName || 'Tunde Bakare (Platform Admin)');
    pushToast({
      title: `${nextVal ? 'Enabled' : 'Disabled'} ${name} globally`,
      description: nextVal
        ? 'Eligible tenant plans can now activate this module.'
        : 'Disabled across all tenants regardless of plan tier.',
      tone: nextVal ? 'success' : 'warning',
    });
  };

  const handlePlanCheckbox = (
    featId: string,
    currentPlans: Array<'starter' | 'growth' | 'enterprise'>,
    planCode: 'starter' | 'growth' | 'enterprise',
    checked: boolean
  ) => {
    const next = checked
      ? Array.from(new Set([...currentPlans, planCode]))
      : currentPlans.filter((c) => c !== planCode);
    updateFeatureEligiblePlans(
      featId,
      next,
      user?.fullName || 'Tunde Bakare (Platform Admin)'
    );
  };

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <div>
          <span className={styles.contextBadge}>Platform Admin · Platform Configuration</span>
          <h1 className={styles.pageTitle}>Feature Management & Plan Entitlements</h1>
          <p className={styles.pageSubtitle}>
            Control platform-wide feature availability (kill-switches) and subscription plan
            entitlements. Individual businesses can only enable modules that are globally active
            AND included in their plan.
          </p>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Feature / Module</th>
              <th>Module Key</th>
              <th>Global Availability</th>
              <th>Eligible Subscription Plans</th>
              <th>Last Updated</th>
              <th style={{ textAlign: 'right' }}>Global Control</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feat) => (
              <tr key={feat.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{feat.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {feat.description}
                  </div>
                </td>
                <td>
                  <span className={styles.codePill}>{feat.key}</span>
                </td>
                <td>
                  {feat.globallyEnabled ? (
                    <StatusIndicator tone="success" label="Globally Enabled" appearance="tag" />
                  ) : (
                    <StatusIndicator tone="danger" label="Globally Disabled" appearance="tag" />
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {(['starter', 'growth', 'enterprise'] as const).map((pCode) => (
                      <label
                        key={pCode}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          textTransform: 'capitalize',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={feat.eligiblePlanCodes.includes(pCode)}
                          onChange={(e) =>
                            handlePlanCheckbox(
                              feat.id,
                              feat.eligiblePlanCodes,
                              pCode,
                              e.target.checked
                            )
                          }
                        />
                        <span>{pCode}</span>
                      </label>
                    ))}
                  </div>
                </td>
                <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {formatShortDate(feat.updatedAt)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Button
                    size="sm"
                    variant={feat.globallyEnabled ? 'secondary' : 'primary'}
                    onClick={() =>
                      handleToggleGlobal(feat.id, feat.name, !feat.globallyEnabled)
                    }
                  >
                    {feat.globallyEnabled ? 'Disable Globally' : 'Enable Globally'}
                  </Button>
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
 * PLATFORM SETTINGS PAGE
 */
export function PlatformSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const pushToast = useUiStore((s) => s.pushToast);
  const platformSettings = usePlatformAdminStore((s) => s.platformSettings);
  const updatePlatformSettings = usePlatformAdminStore((s) => s.updatePlatformSettings);

  const handleSave = (partial: Partial<typeof platformSettings>, label: string) => {
    updatePlatformSettings(partial, user?.fullName || 'Tunde Bakare (Platform Admin)');
    pushToast({
      title: `Updated platform ${label}`,
      description: 'Logged to Platform Audit Logs.',
      tone: 'success',
    });
  };

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <div>
          <span className={styles.contextBadge}>Platform Admin · Global Control Plane</span>
          <h1 className={styles.pageTitle}>Platform Settings</h1>
          <p className={styles.pageSubtitle}>
            Configure ShelfAware SaaS registration policies, default trial periods, and KYB
            enforcement rules.
          </p>
        </div>
      </div>

      <div className={styles.card} style={{ maxWidth: '680px' }}>
        <div className={styles.cardTitle}>SaaS Onboarding & Compliance Policies</div>

        <div className={styles.fieldCol}>
          <label htmlFor="ps-email" className={styles.label}>
            Platform Operations Support Email
          </label>
          <input
            id="ps-email"
            className={styles.input}
            value={platformSettings.platformSupportEmail}
            onChange={(e) =>
              handleSave({ platformSupportEmail: e.target.value }, 'support email')
            }
          />
        </div>

        <div className={styles.fieldCol}>
          <label htmlFor="ps-trial" className={styles.label}>
            Default Tenant Trial Window (Days)
          </label>
          <input
            id="ps-trial"
            type="number"
            className={styles.input}
            value={platformSettings.defaultTrialDays}
            onChange={(e) =>
              handleSave({ defaultTrialDays: Number(e.target.value) || 14 }, 'trial window')
            }
          />
        </div>

        <div className={styles.fieldCol}>
          <label htmlFor="ps-region" className={styles.label}>
            Default Shared Multi-Tenant Cluster Pool
          </label>
          <input
            id="ps-region"
            className={styles.input}
            value={platformSettings.defaultSharedClusterRegion}
            onChange={(e) =>
              handleSave(
                { defaultSharedClusterRegion: e.target.value },
                'default cluster region'
              )
            }
          />
        </div>

        <label className={styles.permissionRow}>
          <input
            type="checkbox"
            checked={platformSettings.allowSelfServiceRegistration}
            onChange={(e) =>
              handleSave(
                { allowSelfServiceRegistration: e.target.checked },
                'self-service registration policy'
              )
            }
          />
          <div>
            <div style={{ fontWeight: 600 }}>Allow Self-Service Business Registration</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              When disabled, new businesses can only be registered via Assisted Business
              Onboarding.
            </div>
          </div>
        </label>

        <label className={styles.permissionRow}>
          <input
            type="checkbox"
            checked={platformSettings.requireKybBeforeLivePos}
            onChange={(e) =>
              handleSave(
                { requireKybBeforeLivePos: e.target.checked },
                'KYB verification requirement'
              )
            }
          />
          <div>
            <div style={{ fontWeight: 600 }}>
              Require Approved KYB Verification Before Live Payment Settlement
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Enforces CAC and TIN verification approval before a tenant's live gateway webhooks
              are activated.
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}
