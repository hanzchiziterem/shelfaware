import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useAuthStore } from '@/store/authStore';
import { usePlatformAdminStore } from '@/store/platformAdminStore';
import { useProductStore } from '@/store/productStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSuperBusinessAdminStore } from '@/store/superBusinessAdminStore';
import { useUiStore } from '@/store/uiStore';
import styles from '@/features/platformAdmin/pages/PlatformAdmin.module.css';

/**
 * 1. Module Management (`/business-admin/modules`)
 * Enforces both Platform Admin global feature flags and the tenant's subscription plan entitlements.
 */
export function ModuleManagementPage() {
  const user = useAuthStore((s) => s.user);
  const activeTenantId = useSuperBusinessAdminStore((s) => s.activeTenantId);
  const enabledModuleKeys = useSuperBusinessAdminStore((s) => s.enabledModuleKeys);
  const toggleTenantModule = useSuperBusinessAdminStore((s) => s.toggleTenantModule);

  const platformFeatures = usePlatformAdminStore((s) => s.features);
  const subscriptions = usePlatformAdminStore((s) => s.subscriptions);
  const plans = usePlatformAdminStore((s) => s.plans);
  const pushToast = useUiStore((s) => s.pushToast);

  const tenantSub = subscriptions.find((s) => s.tenantId === activeTenantId);
  const currentPlan =
    plans.find((p) => p.id === (tenantSub?.planId || 'plan-growth')) || plans[1];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>Super Business Admin • Operations Configuration</div>
          <h1 className={styles.title}>Module Management</h1>
          <p className={styles.subtitle}>
            Enable or disable operational modules for your store. Modules are governed by your{' '}
            <strong>{currentPlan.name}</strong> subscription plan.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link to={PATHS.BUSINESS_ADMIN.SUBSCRIPTION}>
            <Button variant="secondary" size="sm">
              View Subscription Plan ({currentPlan.name})
            </Button>
          </Link>
        </div>
      </header>

      <div className={styles.bannerInfo}>
        <strong>Plan Entitlement Enforcement:</strong> Your business is subscribed to{' '}
        <strong>{currentPlan.name}</strong>. Modules not included in your plan or disabled globally by
        ShelfAware cannot be turned on without upgrading.
      </div>

      <section className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Module Name</th>
                <th>Category</th>
                <th>Plan Entitlement</th>
                <th>Tenant Status</th>
                <th>Toggle</th>
              </tr>
            </thead>
            <tbody>
              {platformFeatures.map((mod) => {
                const includedInPlan = mod.eligiblePlanCodes.includes(currentPlan.code);
                const globallyAvailable = mod.globallyEnabled;
                const canToggle = includedInPlan && globallyAvailable;
                const isEnabledForTenant = canToggle && enabledModuleKeys.includes(mod.key);

                return (
                  <tr key={mod.id}>
                    <td>
                      <div className={styles.primaryText}>{mod.name}</div>
                      <div className={styles.secondaryText}>{mod.description}</div>
                    </td>
                    <td>
                      <span className={styles.tag}>{mod.category}</span>
                    </td>
                    <td>
                      {!globallyAvailable ? (
                        <StatusIndicator
                          tone="danger"
                          label="Disabled Globally by Platform"
                        />
                      ) : includedInPlan ? (
                        <StatusIndicator
                          tone="success"
                          label={`Included in ${currentPlan.name}`}
                        />
                      ) : (
                        <StatusIndicator
                          tone="warning"
                          label="Requires Enterprise Chain Plan"
                        />
                      )}
                    </td>
                    <td>
                      <StatusIndicator
                        tone={isEnabledForTenant ? 'success' : 'neutral'}
                        label={isEnabledForTenant ? 'Active in Workspace' : 'Disabled'}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        disabled={!canToggle}
                        className={`${styles.switchBtn} ${
                          isEnabledForTenant ? styles.switchBtnOn : ''
                        } ${!canToggle ? styles.switchBtnDisabled : ''}`}
                        onClick={() => {
                          if (!canToggle) return;
                          if (mod.key === 'pos' && isEnabledForTenant) {
                            pushToast({
                              title: 'Point of Sale is a core module',
                              description: 'POS checkout remains active for store operations.',
                              tone: 'info',
                            });
                            return;
                          }
                          toggleTenantModule(
                            mod.key,
                            !isEnabledForTenant,
                            user?.fullName || 'Adebayo Ogunlesi'
                          );
                          pushToast({
                            title: `${mod.name} ${!isEnabledForTenant ? 'enabled' : 'disabled'}`,
                            tone: 'info',
                          });
                        }}
                        aria-label={`Toggle ${mod.name}`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/**
 * 2. Product Categories (`/business-admin/categories`)
 */
export function ProductCategoriesConfigPage() {
  const user = useAuthStore((s) => s.user);
  const categories = useProductStore((s) => s.categories);
  const products = useProductStore((s) => s.products);
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const logAdminActivity = useSuperBusinessAdminStore((s) => s.logAdminActivity);
  const pushToast = useUiStore((s) => s.pushToast);

  const [customCategories, setCustomCategories] = useState<
    Array<{ id: string; name: string; description: string }>
  >([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  useEffect(() => {
    if (categories.length === 0) {
      void fetchProducts();
    }
  }, [categories.length, fetchProducts]);

  const allCategories = [
    ...categories.map((c) => ({
      ...c,
      liveCount: products.filter((p) => p.categoryId === c.id).length || c.productCount,
    })),
    ...customCategories.map((c) => ({ ...c, productCount: 0, liveCount: 0 })),
  ];

  const handleAddCategory = () => {
    if (!catName.trim()) return;
    setCustomCategories((prev) => [
      ...prev,
      {
        id: `cat-${Date.now().toString().slice(-4)}`,
        name: catName.trim(),
        description: catDesc.trim() || 'Tenant product classification',
      },
    ]);
    logAdminActivity(
      user?.fullName || 'Adebayo Ogunlesi',
      'Created Product Category',
      catName.trim()
    );
    pushToast({
      title: 'Product category added',
      description: `${catName.trim()} is now available for SKU classification.`,
      tone: 'success',
    });
    setCatName('');
    setCatDesc('');
    setModalOpen(false);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>Super Business Admin • Operations Configuration</div>
          <h1 className={styles.title}>Product Categories</h1>
          <p className={styles.subtitle}>
            Standardize aisle classifications and reporting groups across your supermarket branches.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
            + Add Category
          </Button>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Category ID</th>
                <th>Description</th>
                <th>Active SKUs</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allCategories.map((cat) => (
                <tr key={cat.id}>
                  <td className={styles.primaryText}>{cat.name}</td>
                  <td>
                    <span className={styles.codePill}>{cat.id}</span>
                  </td>
                  <td>{cat.description}</td>
                  <td className={styles.mono}>{cat.liveCount} SKUs</td>
                  <td>
                    <StatusIndicator tone="success" label="Active" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Tenant Product Category"
        size="sm"
      >
        <div className={styles.formGrid}>
          <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
            <label className={styles.label}>Category Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Spices & Dry Condiments"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
            />
          </div>
          <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              placeholder="Used for POS quick filters and category margin reports"
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleAddCategory}>
            Create Category
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

/**
 * 3. Units of Measurement (`/business-admin/units`)
 */
export function UnitsOfMeasureConfigPage() {
  const user = useAuthStore((s) => s.user);
  const units = useSuperBusinessAdminStore((s) => s.units);
  const saveUnitConfig = useSuperBusinessAdminStore((s) => s.saveUnitConfig);
  const toggleUnitActive = useSuperBusinessAdminStore((s) => s.toggleUnitActive);
  const pushToast = useUiStore((s) => s.pushToast);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [allowDecimals, setAllowDecimals] = useState(false);

  const handleSave = () => {
    if (!name.trim() || !symbol.trim()) return;
    saveUnitConfig(
      {
        name: name.trim(),
        symbol: symbol.trim().toLowerCase(),
        allowDecimals,
        usageExample: `Sold by ${name.trim().toLowerCase()}`,
        isActive: true,
      },
      user?.fullName || 'Adebayo Ogunlesi'
    );
    pushToast({
      title: 'Unit of measurement saved',
      description: `${name.trim()} (${symbol.trim()}) added to tenant catalog.`,
      tone: 'success',
    });
    setName('');
    setSymbol('');
    setAllowDecimals(false);
    setModalOpen(false);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>Super Business Admin • Operations Configuration</div>
          <h1 className={styles.title}>Units of Measurement</h1>
          <p className={styles.subtitle}>
            Configure wholesale and retail packaging units (bags, cartons, kg, bottles, crates) and fractional quantity rules.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
            + Add Unit of Measure
          </Button>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Unit Name</th>
                <th>Symbol</th>
                <th>Fractional / Decimal Support</th>
                <th>Usage Example</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u) => (
                <tr key={u.id}>
                  <td className={styles.primaryText}>{u.name}</td>
                  <td>
                    <span className={styles.codePill}>{u.symbol}</span>
                  </td>
                  <td>
                    {u.allowDecimals ? (
                      <span className={styles.tag}>Allows Decimal (e.g. 1.5 {u.symbol})</span>
                    ) : (
                      <span className={styles.secondaryText}>Whole units only</span>
                    )}
                  </td>
                  <td className={styles.secondaryText}>{u.usageExample}</td>
                  <td>
                    <StatusIndicator
                      tone={u.isActive ? 'success' : 'neutral'}
                      label={u.isActive ? 'Active' : 'Inactive'}
                    />
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        toggleUnitActive(u.id, user?.fullName || 'Adebayo Ogunlesi')
                      }
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Unit of Measurement"
        size="sm"
      >
        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Unit Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Paint Bucket / Mudu"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Short Symbol</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. bucket"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.toggleRow} style={{ marginTop: '12px' }}>
          <div className={styles.toggleMeta}>
            <span className={styles.toggleTitle}>Allow Fractional / Decimal Quantities</span>
            <span className={styles.toggleDesc}>
              Enable for weighed or measured commodities (e.g. 0.5 kg, 2.5 litres).
            </span>
          </div>
          <button
            type="button"
            className={`${styles.switchBtn} ${allowDecimals ? styles.switchBtnOn : ''}`}
            onClick={() => setAllowDecimals((v) => !v)}
          />
        </div>
        <div className={styles.modalFooter}>
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save Unit
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

/**
 * 4. Inventory Settings (`/business-admin/inventory-settings`)
 */
export function InventorySettingsConfigPage() {
  const user = useAuthStore((s) => s.user);
  const inventoryConfig = useSuperBusinessAdminStore((s) => s.inventoryConfig);
  const updateInventoryConfig = useSuperBusinessAdminStore((s) => s.updateInventoryConfig);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const pushToast = useUiStore((s) => s.pushToast);

  const [threshold, setThreshold] = useState(String(inventoryConfig.defaultLowStockThreshold));
  const [expiryDays, setExpiryDays] = useState(String(inventoryConfig.expiryWarningDays));
  const [enableExpiry, setEnableExpiry] = useState(inventoryConfig.enableExpiryTracking);
  const [blockExpiredPos, setBlockExpiredPos] = useState(
    inventoryConfig.blockPosSaleOfExpiredBatch
  );
  const [requireReason, setRequireReason] = useState(
    inventoryConfig.requireReasonOnManualAdjustment
  );
  const [approvalPolicy, setApprovalPolicy] = useState(inventoryConfig.stocktakeApprovalPolicy);

  const handleSave = async () => {
    const parsedThreshold = Math.max(1, Number(threshold) || 10);
    const parsedExpiryDays = Math.max(1, Number(expiryDays) || 30);

    updateInventoryConfig(
      {
        defaultLowStockThreshold: parsedThreshold,
        expiryWarningDays: parsedExpiryDays,
        enableExpiryTracking: enableExpiry,
        blockPosSaleOfExpiredBatch: blockExpiredPos,
        requireReasonOnManualAdjustment: requireReason,
        stocktakeApprovalPolicy: approvalPolicy,
      },
      user?.fullName || 'Adebayo Ogunlesi'
    );
    await updateSettings({
      defaultLowStockThreshold: parsedThreshold,
      enableExpiryAlerts: enableExpiry,
      expiryWarningDays: parsedExpiryDays,
    });
    pushToast({
      title: 'Inventory governance rules saved',
      description: 'Low-stock thresholds, expiry blocks, and adjustment rules updated.',
      tone: 'success',
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>Super Business Admin • Operations Configuration</div>
          <h1 className={styles.title}>Inventory & Expiry Settings</h1>
          <p className={styles.subtitle}>
            Configure default low-stock thresholds, batch expiry warnings, and stock adjustment audit rules.
          </p>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Stock Thresholds & Coldroom Batch Controls</h2>
            <p className={styles.cardSubtitle}>
              Applies across all store branches and warehouse receiving workflows
            </p>
          </div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Default Low-Stock Alert Threshold (Units)</label>
              <input
                type="number"
                className={styles.input}
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Batch Expiry Early Warning Window (Days)</label>
              <input
                type="number"
                className={styles.input}
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
              <label className={styles.label}>Physical Stocktake Reconciliation Policy</label>
              <select
                className={styles.select}
                value={approvalPolicy}
                onChange={(e) =>
                  setApprovalPolicy(
                    e.target.value as 'immediate' | 'require_super_admin_signoff'
                  )
                }
              >
                <option value="require_super_admin_signoff">
                  Require Super Business Admin Sign-off on Stock Variances
                </option>
                <option value="immediate">
                  Apply Stocktake Count Immediately Upon Manager Submission
                </option>
              </select>
            </div>
          </div>

          <div className={styles.toggleRow} style={{ marginTop: '14px' }}>
            <div className={styles.toggleMeta}>
              <span className={styles.toggleTitle}>Enable Batch & Expiry Tracking</span>
              <span className={styles.toggleDesc}>
                Track lot numbers and expiration dates on coldroom cartons, dairy, and packaged foods.
              </span>
            </div>
            <button
              type="button"
              className={`${styles.switchBtn} ${enableExpiry ? styles.switchBtnOn : ''}`}
              onClick={() => setEnableExpiry((v) => !v)}
            />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleMeta}>
              <span className={styles.toggleTitle}>Block POS Checkout of Expired Stock Batches</span>
              <span className={styles.toggleDesc}>
                Prevents cashiers from ringing up batches past their expiration date.
              </span>
            </div>
            <button
              type="button"
              className={`${styles.switchBtn} ${blockExpiredPos ? styles.switchBtnOn : ''}`}
              onClick={() => setBlockExpiredPos((v) => !v)}
            />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleMeta}>
              <span className={styles.toggleTitle}>Require Mandatory Reason Code on Manual Stock Adjustments</span>
              <span className={styles.toggleDesc}>
                Forces staff to record a reason (e.g. Damaged Bag, Shrinkage, Supplier Bonus) on every stock adjustment.
              </span>
            </div>
            <button
              type="button"
              className={`${styles.switchBtn} ${requireReason ? styles.switchBtnOn : ''}`}
              onClick={() => setRequireReason((v) => !v)}
            />
          </div>

          <div className={styles.modalFooter}>
            <Button variant="primary" size="md" onClick={() => void handleSave()}>
              Save Inventory Configuration
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * 5. Sales / POS Settings (`/business-admin/sales-settings`)
 */
export function SalesSettingsConfigPage() {
  const user = useAuthStore((s) => s.user);
  const salesConfig = useSuperBusinessAdminStore((s) => s.salesConfig);
  const updateSalesConfig = useSuperBusinessAdminStore((s) => s.updateSalesConfig);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const pushToast = useUiStore((s) => s.pushToast);

  const [defaultMethod, setDefaultMethod] = useState(salesConfig.defaultPaymentMethod);
  const [maxDiscountPct, setMaxDiscountPct] = useState(String(salesConfig.cashierMaxDiscountPercent));
  const [maxDiscountNaira, setMaxDiscountNaira] = useState(
    String(salesConfig.cashierMaxDiscountNaira)
  );
  const [autoPrint, setAutoPrint] = useState(salesConfig.autoPrintReceiptOnCheckout);
  const [requireVoidApproval, setRequireVoidApproval] = useState(
    salesConfig.requireManagerApprovalForVoid
  );
  const [confirmBeforeSale, setConfirmBeforeSale] = useState(
    salesConfig.requireConfirmationBeforeCompleteSale
  );

  const handleSave = async () => {
    updateSalesConfig(
      {
        defaultPaymentMethod: defaultMethod,
        cashierMaxDiscountPercent: Math.max(0, Number(maxDiscountPct) || 0),
        cashierMaxDiscountNaira: Math.max(0, Number(maxDiscountNaira) || 0),
        autoPrintReceiptOnCheckout: autoPrint,
        requireManagerApprovalForVoid: requireVoidApproval,
        requireConfirmationBeforeCompleteSale: confirmBeforeSale,
      },
      user?.fullName || 'Adebayo Ogunlesi'
    );
    await updateSettings({ defaultPaymentMethod: defaultMethod });
    pushToast({
      title: 'Sales & POS guardrails updated',
      description: 'Cashier discount limits and payment defaults applied.',
      tone: 'success',
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>Super Business Admin • Operations Configuration</div>
          <h1 className={styles.title}>Sales & POS Settings</h1>
          <p className={styles.subtitle}>
            Configure default payment methods, cashier discount caps, receipt auto-printing, and void authorization rules.
          </p>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Checkout Guardrails & Cashier Limits</h2>
            <p className={styles.cardSubtitle}>
              Protects margins during high-volume retail and wholesale checkout shifts
            </p>
          </div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Default POS Payment Method</label>
              <select
                className={styles.select}
                value={defaultMethod}
                onChange={(e) =>
                  setDefaultMethod(e.target.value as 'cash' | 'bank_transfer' | 'card')
                }
              >
                <option value="bank_transfer">Bank Transfer (NIP Instant Transfer)</option>
                <option value="cash">Cash (Naira Notes)</option>
                <option value="card">POS Terminal Card (Moniepoint / OPay / Paystack)</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Cashier Max Discount Limit (%)</label>
              <input
                type="number"
                className={styles.input}
                value={maxDiscountPct}
                onChange={(e) => setMaxDiscountPct(e.target.value)}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Cashier Max Discount Cap (₦ Naira)</label>
              <input
                type="number"
                className={styles.input}
                value={maxDiscountNaira}
                onChange={(e) => setMaxDiscountNaira(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.toggleRow} style={{ marginTop: '14px' }}>
            <div className={styles.toggleMeta}>
              <span className={styles.toggleTitle}>Automatically Trigger Thermal Receipt Print on Sale Completion</span>
              <span className={styles.toggleDesc}>
                Opens the browser thermal print dialog immediately when a sale is completed.
              </span>
            </div>
            <button
              type="button"
              className={`${styles.switchBtn} ${autoPrint ? styles.switchBtnOn : ''}`}
              onClick={() => setAutoPrint((v) => !v)}
            />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleMeta}>
              <span className={styles.toggleTitle}>Require Manager / Admin Approval to Void or Refund Completed Sales</span>
              <span className={styles.toggleDesc}>
                Prevents cashiers from reversing completed transactions without supervisor authorization.
              </span>
            </div>
            <button
              type="button"
              className={`${styles.switchBtn} ${requireVoidApproval ? styles.switchBtnOn : ''}`}
              onClick={() => setRequireVoidApproval((v) => !v)}
            />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleMeta}>
              <span className={styles.toggleTitle}>Require Confirmation Prompt Before Completing High-Value Sales</span>
              <span className={styles.toggleDesc}>
                Displays a final verification step before posting wholesale orders.
              </span>
            </div>
            <button
              type="button"
              className={`${styles.switchBtn} ${confirmBeforeSale ? styles.switchBtnOn : ''}`}
              onClick={() => setConfirmBeforeSale((v) => !v)}
            />
          </div>

          <div className={styles.modalFooter}>
            <Button variant="primary" size="md" onClick={() => void handleSave()}>
              Save Sales & POS Settings
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * 6. Notification Settings (`/business-admin/notification-settings`)
 */
export function NotificationSettingsConfigPage() {
  const user = useAuthStore((s) => s.user);
  const notificationPrefs = useSuperBusinessAdminStore((s) => s.notificationPrefs);
  const updateNotificationPrefs = useSuperBusinessAdminStore((s) => s.updateNotificationPrefs);
  const pushToast = useUiStore((s) => s.pushToast);

  const [lowStockChannel, setLowStockChannel] = useState(notificationPrefs.lowStockAlertChannel);
  const [expiryChannel, setExpiryChannel] = useState(notificationPrefs.expiryAlertChannel);
  const [voidThreshold, setVoidThreshold] = useState(
    String(notificationPrefs.largeVoidAlertThresholdNaira)
  );
  const [closingTime, setClosingTime] = useState(notificationPrefs.dailyClosingSummaryTime);
  const [recipients, setRecipients] = useState(notificationPrefs.recipientEmails);

  const handleSave = () => {
    updateNotificationPrefs(
      {
        lowStockAlertChannel: lowStockChannel,
        expiryAlertChannel: expiryChannel,
        largeVoidAlertThresholdNaira: Number(voidThreshold) || 50000,
        dailyClosingSummaryTime: closingTime,
        recipientEmails: recipients.trim(),
      },
      user?.fullName || 'Adebayo Ogunlesi'
    );
    pushToast({
      title: 'Notification preferences saved',
      tone: 'success',
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>Super Business Admin • Operations Configuration</div>
          <h1 className={styles.title}>Notification Settings</h1>
          <p className={styles.subtitle}>
            Configure how low-stock warnings, batch expiry alerts, and large void notifications are delivered to management.
          </p>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Low-Stock Alert Delivery</label>
              <select
                className={styles.select}
                value={lowStockChannel}
                onChange={(e) =>
                  setLowStockChannel(e.target.value as 'in_app' | 'in_app_and_email')
                }
              >
                <option value="in_app_and_email">In-App Bell + Daily Email Digest</option>
                <option value="in_app">In-App Workspace Bell Only</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Coldroom / Batch Expiry Alert Delivery</label>
              <select
                className={styles.select}
                value={expiryChannel}
                onChange={(e) =>
                  setExpiryChannel(e.target.value as 'in_app' | 'in_app_and_email')
                }
              >
                <option value="in_app_and_email">In-App Bell + Email Alert</option>
                <option value="in_app">In-App Workspace Bell Only</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Instant Alert Threshold for Voided Sales (₦)</label>
              <input
                type="number"
                className={styles.input}
                value={voidThreshold}
                onChange={(e) => setVoidThreshold(e.target.value)}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Daily Closing Summary Dispatch Time</label>
              <input
                type="time"
                className={styles.input}
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
              <label className={styles.label}>Management Alert Recipient Emails (Comma-separated)</label>
              <input
                type="text"
                className={styles.input}
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <Button variant="primary" size="md" onClick={handleSave}>
              Save Notification Preferences
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
