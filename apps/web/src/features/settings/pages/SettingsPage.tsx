import { useState } from 'react';
import { PRODUCT_BRAND_NAME } from '@/app/config/branding';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { API_CONFIG } from '@/services/api/apiConfig';
import { useDashboardStore } from '@/store/dashboardStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useProductStore } from '@/store/productStore';
import { useSalesStore } from '@/store/salesStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';
import styles from '@/styles/SharedPages.module.css';
import type { BusinessSettings } from '@/types/common';

export function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const resetDemoEnvironment = useSettingsStore((s) => s.resetDemoEnvironment);
  const pushToast = useUiStore((s) => s.pushToast);

  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const fetchInventory = useInventoryStore((s) => s.fetchInventory);
  const fetchSales = useSalesStore((s) => s.fetchSales);
  const fetchDashboard = useDashboardStore((s) => s.fetchDashboard);

  const [activeSection, setActiveSection] = useState<
    'profile' | 'appearance' | 'receipts' | 'inventory'
  >('profile');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleFieldChange = async (partial: Partial<BusinessSettings>, label: string) => {
    const ok = await updateSettings(partial);
    if (ok) {
      pushToast({
        title: `Updated ${label}`,
        description: 'Applied across the workspace immediately.',
        tone: 'success',
      });
    }
  };

  const handleFullReset = async () => {
    await resetDemoEnvironment();
    await Promise.all([fetchProducts(), fetchInventory(), fetchSales(), fetchDashboard()]);
    setConfirmResetOpen(false);
    pushToast({
      title: 'Demo store data and settings reset to factory defaults',
      tone: 'info',
    });
  };

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>
            Configure your store profile, receipt rules, inventory thresholds, and workspace
            appearance on {PRODUCT_BRAND_NAME}.
          </p>
        </div>
      </div>

      <div className={styles.settingsLayout}>
        <nav className={styles.settingsNav} aria-label="Settings Sections">
          {(
            [
              { id: 'profile', label: 'Business Profile' },
              { id: 'receipts', label: 'POS & Receipts' },
              { id: 'inventory', label: 'Inventory & Expiry' },
              { id: 'appearance', label: 'Appearance & Display' },
            ] as const
          ).map((sec) => (
            <button
              key={sec.id}
              type="button"
              className={`${styles.settingsNavBtn} ${
                activeSection === sec.id ? styles.settingsNavBtnActive : ''
              }`}
              onClick={() => setActiveSection(sec.id)}
            >
              {sec.label}
            </button>
          ))}
        </nav>

        <div className={styles.settingsPanel}>
          {activeSection === 'profile' && (
            <>
              <div className={styles.cardBox}>
                <h2 className={styles.sectionHeading}>Store & Business Identity</h2>
                <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
                  Your customer-facing business details appear on printed receipts, invoices, and
                  reports. The platform identity remains <strong>{PRODUCT_BRAND_NAME}</strong>.
                </p>

                <div className={styles.fieldGroup}>
                  <label htmlFor="set-biz-name" className={styles.label}>
                    Store / Business Name
                  </label>
                  <input
                    id="set-biz-name"
                    className={styles.input}
                    value={settings.businessName}
                    onChange={(e) =>
                      void handleFieldChange({ businessName: e.target.value }, 'store name')
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="set-biz-phone" className={styles.label}>
                    Store Phone Number
                  </label>
                  <input
                    id="set-biz-phone"
                    className={styles.input}
                    value={settings.phone}
                    onChange={(e) =>
                      void handleFieldChange({ phone: e.target.value }, 'store phone')
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="set-biz-email" className={styles.label}>
                    Store Contact Email
                  </label>
                  <input
                    id="set-biz-email"
                    className={styles.input}
                    value={settings.email}
                    onChange={(e) =>
                      void handleFieldChange({ email: e.target.value }, 'store email')
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="set-biz-addr" className={styles.label}>
                    Store Physical Address
                  </label>
                  <input
                    id="set-biz-addr"
                    className={styles.input}
                    value={settings.address}
                    onChange={(e) =>
                      void handleFieldChange({ address: e.target.value }, 'store address')
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="set-curr" className={styles.label}>
                    Currency & Locale
                  </label>
                  <select
                    id="set-curr"
                    className={styles.select}
                    value={settings.currency}
                    onChange={(e) =>
                      void handleFieldChange({ currency: e.target.value }, 'currency')
                    }
                  >
                    <option value="NGN">Nigerian Naira — NGN (₦)</option>
                    <option value="USD">US Dollar — USD ($)</option>
                    <option value="GBP">British Pound — GBP (£)</option>
                  </select>
                </div>
              </div>

              {API_CONFIG.useMockApi && (
                <div
                  className={styles.cardBox}
                  style={{ borderColor: 'var(--color-border-strong)' }}
                >
                  <h2 className={styles.sectionHeading}>Development / Demo Environment Controls</h2>
                  <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
                    Resetting demo data restores all sample foodstuff inventory, sales, purchase
                    orders, and store settings to their initial seed state. This action is only
                    available in Demo Mode.
                  </p>
                  <div>
                    <Button variant="danger" size="sm" onClick={() => setConfirmResetOpen(true)}>
                      Reset Demo Data...
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeSection === 'appearance' && (
            <div className={styles.cardBox}>
              <h2 className={styles.sectionHeading}>Workspace Appearance & Display Density</h2>
              <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
                Adjust typography, table row height, and theme mode for your counter terminal.
              </p>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Platform Product Name</label>
                <input
                  className={styles.input}
                  value={PRODUCT_BRAND_NAME}
                  disabled
                  aria-label="Platform product name"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="set-font" className={styles.label}>
                  Application Font Family
                </label>
                <select
                  id="set-font"
                  className={styles.select}
                  value={settings.fontFamily}
                  onChange={(e) =>
                    void handleFieldChange(
                      { fontFamily: e.target.value as BusinessSettings['fontFamily'] },
                      'typography'
                    )
                  }
                >
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Enterprise Default)</option>
                  <option value="DM Sans">DM Sans (Compact Retail)</option>
                  <option value="System Sans">System Native UI Sans</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="set-density" className={styles.label}>
                  Data Table Row Density
                </label>
                <select
                  id="set-density"
                  className={styles.select}
                  value={settings.tableDensity}
                  onChange={(e) =>
                    void handleFieldChange(
                      { tableDensity: e.target.value as BusinessSettings['tableDensity'] },
                      'table density'
                    )
                  }
                >
                  <option value="compact">Compact (36px rows — high density)</option>
                  <option value="comfortable">Comfortable (42px rows — default)</option>
                  <option value="spacious">Spacious (50px rows — touchscreen friendly)</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="set-radius" className={styles.label}>
                  Control & Card Border Radius
                </label>
                <select
                  id="set-radius"
                  className={styles.select}
                  value={settings.borderRadius}
                  onChange={(e) =>
                    void handleFieldChange(
                      { borderRadius: e.target.value as BusinessSettings['borderRadius'] },
                      'border radius'
                    )
                  }
                >
                  <option value="sharp">Sharp (3px)</option>
                  <option value="standard">Standard (6px — default)</option>
                  <option value="rounded">Rounded (9px)</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="set-theme" className={styles.label}>
                  Workspace Appearance Mode
                </label>
                <select
                  id="set-theme"
                  className={styles.select}
                  value={settings.themeMode}
                  onChange={(e) =>
                    void handleFieldChange(
                      { themeMode: e.target.value as 'light' | 'dark' },
                      'theme mode'
                    )
                  }
                >
                  <option value="light">Light Workspace + Dark Navy Sidebar (Default)</option>
                  <option value="dark">Full Dark Mode</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Primary Action Color Preset</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'ShelfAware Dark Navy (#12161f)', color: '#12161f' },
                    { label: 'Emerald Retail (#0f5132)', color: '#0f5132' },
                    { label: 'Cobalt Indigo (#1e3a8a)', color: '#1e3a8a' },
                  ].map((preset) => (
                    <Button
                      key={preset.color}
                      variant={settings.primaryColor === preset.color ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() =>
                        void handleFieldChange(
                          { primaryColor: preset.color },
                          `primary color (${preset.label})`
                        )
                      }
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'receipts' && (
            <div className={styles.cardBox}>
              <h2 className={styles.sectionHeading}>POS Checkout & Receipt Configuration</h2>

              <div className={styles.fieldGroup}>
                <label htmlFor="set-rcp-header" className={styles.label}>
                  Receipt Header Line
                </label>
                <input
                  id="set-rcp-header"
                  className={styles.input}
                  value={settings.receiptHeader}
                  onChange={(e) =>
                    void handleFieldChange({ receiptHeader: e.target.value }, 'receipt header')
                  }
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="set-rcp-footer" className={styles.label}>
                  Receipt Footer Message
                </label>
                <input
                  id="set-rcp-footer"
                  className={styles.input}
                  value={settings.receiptFooter}
                  onChange={(e) =>
                    void handleFieldChange({ receiptFooter: e.target.value }, 'receipt footer')
                  }
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="set-paper" className={styles.label}>
                  Thermal Printer Width
                </label>
                <select
                  id="set-paper"
                  className={styles.select}
                  value={settings.receiptPaperWidth}
                  onChange={(e) =>
                    void handleFieldChange(
                      { receiptPaperWidth: e.target.value as '58mm' | '80mm' },
                      'paper width'
                    )
                  }
                >
                  <option value="80mm">80mm Standard Counter Thermal Printer</option>
                  <option value="58mm">58mm Handheld Mobile POS Printer</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={settings.enableTax}
                    onChange={(e) =>
                      void handleFieldChange(
                        { enableTax: e.target.checked, taxPercentage: e.target.checked ? 7.5 : 0 },
                        'VAT calculation'
                      )
                    }
                  />
                  <span>Enable 7.5% Nigerian VAT on POS sales</span>
                </label>
              </div>
            </div>
          )}

          {activeSection === 'inventory' && (
            <div className={styles.cardBox}>
              <h2 className={styles.sectionHeading}>Inventory & Perishable Expiry Rules</h2>

              <div className={styles.fieldGroup}>
                <label htmlFor="set-low-thresh" className={styles.label}>
                  Default Low-Stock Threshold (Units)
                </label>
                <input
                  id="set-low-thresh"
                  type="number"
                  min="1"
                  className={styles.input}
                  value={settings.defaultLowStockThreshold}
                  onChange={(e) =>
                    void handleFieldChange(
                      { defaultLowStockThreshold: Number(e.target.value) || 10 },
                      'low-stock threshold'
                    )
                  }
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="set-exp-days" className={styles.label}>
                  Perishable Expiry Warning Window (Days before expiry)
                </label>
                <input
                  id="set-exp-days"
                  type="number"
                  min="7"
                  className={styles.input}
                  value={settings.expiryWarningDays}
                  onChange={(e) =>
                    void handleFieldChange(
                      { expiryWarningDays: Number(e.target.value) || 30 },
                      'expiry warning window'
                    )
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Resetting Demo Data */}
      <Dialog
        open={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        title="Reset Demo Store Data?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmResetOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => void handleFullReset()}>
              Confirm Reset
            </Button>
          </>
        }
      >
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
          This will discard any custom products, POS sales, stock adjustments, or purchase orders
          created in this browser session and restore the original demo dataset.
        </p>
      </Dialog>
    </div>
  );
}
