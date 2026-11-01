import { useEffect, useState } from 'react';
import { hasPermission } from '@/app/config/permissions';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useAuthStore } from '@/store/authStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';
import type { Product } from '@/types/common';
import { formatCompactCurrency, formatCurrency } from '@/utils/currency';
import { formatFullDateTime, getDaysUntilExpiry } from '@/utils/dates';
import { getStockStatus } from '@/utils/formatters';
import styles from './InventoryPage.module.css';

export function InventoryPage() {
  const user = useAuthStore((s) => s.user);
  const settings = useSettingsStore((s) => s.settings);
  const pushToast = useUiStore((s) => s.pushToast);

  const products = useInventoryStore((s) => s.products);
  const movements = useInventoryStore((s) => s.movements);
  const batches = useInventoryStore((s) => s.batches);
  const stocktakes = useInventoryStore((s) => s.stocktakes);
  const fetchInventory = useInventoryStore((s) => s.fetchInventory);
  const adjustStock = useInventoryStore((s) => s.adjustStock);
  const registerBatch = useInventoryStore((s) => s.registerBatch);
  const recordStocktake = useInventoryStore((s) => s.recordStocktake);

  const canAdjustInventory = hasPermission(user?.role, 'adjust_inventory');
  const canViewCost = hasPermission(user?.role, 'view_cost_price');

  const [activeTab, setActiveTab] = useState<
    'all' | 'low_stock' | 'batches' | 'movements' | 'stocktake'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [comparePrior, setComparePrior] = useState(true);

  // Stock adjustment modal state
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<'add' | 'remove'>('add');
  const [adjustQty, setAdjustQty] = useState('5');
  const [adjustReason, setAdjustReason] = useState('Supplier bonus bags / physical recount');
  const [adjustNotes, setAdjustNotes] = useState('');

  // Batch registration modal state
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchProductId, setBatchProductId] = useState('prod-112');
  const [batchNum, setBatchNum] = useState('BATCH-FRZ-2611');
  const [batchExpiry, setBatchExpiry] = useState('2027-02-15');
  const [batchQty, setBatchQty] = useState('10');

  useEffect(() => {
    void fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0]);
    } else if (selectedProduct) {
      const updated = products.find((p) => p.id === selectedProduct.id);
      if (updated) setSelectedProduct(updated);
    }
  }, [products, selectedProduct]);

  const activeProducts = products.filter((p) => p.status === 'active');
  const inStockSkuCount = activeProducts.filter((p) => p.stockQuantity > 0).length;
  const distinctUnitsCount = new Set(activeProducts.map((p) => p.unit)).size;

  const totalValuation = activeProducts.reduce(
    (acc, p) => acc + (canViewCost ? p.costPrice : p.sellingPrice) * p.stockQuantity,
    0
  );

  const lowStockCount = activeProducts.filter(
    (p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockThreshold
  ).length;
  const outOfStockCount = activeProducts.filter((p) => p.stockQuantity <= 0).length;
  const lowAndOutCount = lowStockCount + outOfStockCount;

  const expiringBatchCount = batches.filter(
    (b) => getDaysUntilExpiry(b.expiryDate) <= settings.expiryWarningDays
  ).length;

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'low_stock' && p.stockQuantity > p.minStockThreshold) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleConfirmAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const qtyNum = parseFloat(adjustQty);
    if (Number.isNaN(qtyNum) || qtyNum <= 0) {
      pushToast({ title: 'Enter a valid positive quantity', tone: 'error' });
      return;
    }

    const ok = await adjustStock({
      productId: selectedProduct.id,
      adjustmentType: adjustType,
      quantity: qtyNum,
      reason: adjustReason,
      notes: adjustNotes || undefined,
      performedBy: user?.fullName || 'Store Manager',
    });

    if (ok) {
      setAdjustModalOpen(false);
      pushToast({
        title: `Stock updated for ${selectedProduct.name}`,
        description: 'Auditable stock movement logged.',
        tone: 'success',
      });
    }
  };

  const handleConfirmBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === batchProductId);
    if (!prod) return;

    const ok = await registerBatch({
      productId: prod.id,
      batchNumber: batchNum,
      expiryDate: batchExpiry,
      quantity: Number(batchQty) || 1,
      unitCost: prod.costPrice,
      performedBy: user?.fullName || 'Store Manager',
    });

    if (ok) {
      setBatchModalOpen(false);
      pushToast({
        title: `Batch ${batchNum} registered for ${prod.name}`,
        tone: 'success',
      });
    }
  };

  const handleQuickStocktake = async () => {
    const ok = await recordStocktake({
      countedBy: user?.fullName || 'Store Manager',
      notes: 'Verified physical store shelf & coldroom balances.',
      counts: products.map((p) => ({
        productId: p.id,
        countedQuantity: p.stockQuantity,
      })),
    });
    if (ok) {
      pushToast({
        title: 'Stocktake reconciliation completed',
        description: `Verified ${products.length} foodstuff SKUs.`,
        tone: 'success',
      });
    }
  };

  const selectedProductMovements = selectedProduct
    ? movements.filter((m) => m.productId === selectedProduct.id).slice(0, 4)
    : [];

  return (
    <div
      className={`${styles.inventoryLayout} ${
        !selectedProduct ? styles.inventoryLayoutFull : ''
      }`}
    >
      <div className={styles.mainWorkspace}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Inventory</h1>
            <p className={styles.pageSubtitle}>
              Stock on hand by unit, stock movements, manual adjustments, stocktakes, and batch expiry tracking
            </p>
          </div>
          {canAdjustInventory && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button variant="secondary" onClick={() => setBatchModalOpen(true)}>
                + Register Expiry Batch
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (!selectedProduct && products[0]) setSelectedProduct(products[0]);
                  setAdjustModalOpen(true);
                }}
              >
                Adjust Stock
              </Button>
            </div>
          )}
        </div>

        {/* 3 meaningful inventory summary stat blocks (no meaningless cross-unit sum) */}
        <div className={styles.statBlocksGrid}>
          <div className={styles.statBlock}>
            <span className={styles.statBigNumber}>
              {inStockSkuCount} / {activeProducts.length} SKUs
            </span>
            <span className={styles.statCaption}>
              Active SKUs in stock across {distinctUnitsCount} unit types (bags, cartons, tins, kg)
            </span>
          </div>
          <div className={styles.statBlock}>
            <span className={styles.statBigNumber}>{formatCompactCurrency(totalValuation)}</span>
            <span className={styles.statCaption}>
              {canViewCost
                ? `Inventory cost valuation (${formatCurrency(totalValuation, settings.currency, settings.locale)})`
                : `Inventory retail valuation (${formatCurrency(totalValuation, settings.currency, settings.locale)})`}
            </span>
          </div>
          <div className={styles.statBlock}>
            <span className={styles.statBigNumber}>
              {lowAndOutCount} Alerts · {expiringBatchCount} Expiring
            </span>
            <span className={styles.statCaption}>
              {lowStockCount} low stock · {outOfStockCount} out of stock · {expiringBatchCount} batch(es) within {settings.expiryWarningDays}d
            </span>
          </div>
        </div>

        {/* Clean underline tabs */}
        <div className={styles.tabsAndSearchRow}>
          <div className={styles.underlineTabs} role="tablist">
            {(
              [
                { id: 'all', label: `All Stock (${products.length})` },
                { id: 'low_stock', label: `Low & Out of Stock (${lowAndOutCount})` },
                { id: 'batches', label: `Perishable Batches (${batches.length})` },
                { id: 'movements', label: `Stock Movements (${movements.length})` },
                { id: 'stocktake', label: `Stocktakes (${stocktakes.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className={styles.filterRight}>
            <input
              type="search"
              className={styles.searchField}
              placeholder="Filter product, SKU, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tab 1 & 2: Product Inventory Balances Table */}
        {(activeTab === 'all' || activeTab === 'low_stock') && (
          <div className={styles.tableWrap}>
            <table className={styles.invTable}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>SKU</th>
                  <th style={{ textAlign: 'right' }}>Available Stock</th>
                  <th style={{ textAlign: 'right' }}>Reorder Level</th>
                  {canViewCost && <th style={{ textAlign: 'right' }}>Stock Cost Value</th>}
                  <th>Stock Health</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product.stockQuantity, product.minStockThreshold);
                  const isSelected = selectedProduct?.id === product.id;

                  return (
                    <tr
                      key={product.id}
                      className={isSelected ? styles.activeRow : ''}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <td>
                        <div className={styles.productCell}>
                          <span className={styles.itemSquare}>
                            {product.name.slice(0, 2).toUpperCase()}
                          </span>
                          <span>{product.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>
                        {product.categoryName}
                      </td>
                      <td
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {product.sku}
                      </td>
                      <td
                        className="tabular-nums"
                        style={{ textAlign: 'right', fontWeight: 600 }}
                      >
                        {product.stockQuantity} {product.unit}
                      </td>
                      <td
                        className="tabular-nums"
                        style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}
                      >
                        {product.minStockThreshold} {product.unit}
                      </td>
                      {canViewCost && (
                        <td
                          className="tabular-nums"
                          style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}
                        >
                          {formatCurrency(
                            product.costPrice * product.stockQuantity,
                            settings.currency,
                            settings.locale
                          )}
                        </td>
                      )}
                      <td>
                        {status === 'in_stock' && (
                          <StatusIndicator tone="success" label="Healthy" />
                        )}
                        {status === 'low_stock' && (
                          <StatusIndicator tone="warning" label="Low stock" />
                        )}
                        {status === 'out_of_stock' && (
                          <StatusIndicator tone="danger" label="Out of stock" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Expiry & Perishable Stock Batches */}
        {activeTab === 'batches' && (
          <div className={styles.tableWrap}>
            <table className={styles.invTable}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Batch / Lot</th>
                  <th>Expiry Date</th>
                  <th style={{ textAlign: 'right' }}>Remaining Qty</th>
                  {canViewCost && <th style={{ textAlign: 'right' }}>Value at Risk</th>}
                  <th>Window Status</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => {
                  const days = getDaysUntilExpiry(batch.expiryDate);
                  const valueAtRisk = batch.remainingQuantity * batch.unitCost;
                  return (
                    <tr key={batch.id}>
                      <td style={{ fontWeight: 500 }}>{batch.productName}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                        {batch.batchNumber}
                      </td>
                      <td className="tabular-nums">{batch.expiryDate}</td>
                      <td
                        className="tabular-nums"
                        style={{ textAlign: 'right', fontWeight: 600 }}
                      >
                        {batch.remainingQuantity} {batch.unit}
                      </td>
                      {canViewCost && (
                        <td className="tabular-nums" style={{ textAlign: 'right' }}>
                          {formatCurrency(valueAtRisk, settings.currency, settings.locale)}
                        </td>
                      )}
                      <td>
                        {days <= 0 ? (
                          <StatusIndicator
                            tone="danger"
                            label={`Expired (${Math.abs(days)}d ago)`}
                            appearance="tag"
                          />
                        ) : days <= settings.expiryWarningDays ? (
                          <StatusIndicator
                            tone="warning"
                            label={`Expiring in ${days}d`}
                            appearance="tag"
                          />
                        ) : (
                          <StatusIndicator
                            tone="success"
                            label={`${days}d remaining`}
                            appearance="tag"
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Immutable Stock Movement Ledger */}
        {activeTab === 'movements' && (
          <div className={styles.tableWrap}>
            <table className={styles.invTable}>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Product</th>
                  <th>Reason / Reference</th>
                  <th style={{ textAlign: 'right' }}>Change</th>
                  <th style={{ textAlign: 'right' }}>New Balance</th>
                  <th>Staff</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((mov) => (
                  <tr key={mov.id}>
                    <td
                      className="tabular-nums"
                      style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}
                    >
                      {formatFullDateTime(mov.createdAt)}
                    </td>
                    <td style={{ fontWeight: 500 }}>{mov.productName}</td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{mov.reason}</td>
                    <td
                      className="tabular-nums"
                      style={{
                        textAlign: 'right',
                        fontWeight: 600,
                        color:
                          mov.quantityChange >= 0
                            ? 'var(--color-success)'
                            : 'var(--color-danger)',
                      }}
                    >
                      {mov.quantityChange >= 0 ? `+${mov.quantityChange}` : mov.quantityChange}{' '}
                      {mov.unit}
                    </td>
                    <td
                      className="tabular-nums"
                      style={{ textAlign: 'right', fontWeight: 600 }}
                    >
                      {mov.newBalance} {mov.unit}
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{mov.performedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Stocktake Sessions */}
        {activeTab === 'stocktake' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                Record physical store counts to reconcile discrepancies with system balances.
              </span>
              {canAdjustInventory && (
                <Button variant="secondary" size="sm" onClick={() => void handleQuickStocktake()}>
                  + Record Full Store Stocktake
                </Button>
              )}
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.invTable}>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Date</th>
                    <th>Counted By</th>
                    <th style={{ textAlign: 'right' }}>SKUs Counted</th>
                    <th style={{ textAlign: 'right' }}>Discrepancies</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stocktakes.map((stk) => (
                    <tr key={stk.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {stk.reference}
                      </td>
                      <td className="tabular-nums">{formatFullDateTime(stk.createdAt)}</td>
                      <td>{stk.countedBy}</td>
                      <td className="tabular-nums" style={{ textAlign: 'right' }}>
                        {stk.itemsCounted}
                      </td>
                      <td className="tabular-nums" style={{ textAlign: 'right' }}>
                        {stk.discrepanciesFound}
                      </td>
                      <td>
                        <StatusIndicator tone="success" label="Completed" appearance="tag" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Right Contextual Product Inventory Detail Drawer */}
      {selectedProduct && (
        <aside className={styles.detailDrawer} aria-label="Selected Product Inventory Details">
          <div className={styles.drawerHeaderRow}>
            <div className={styles.drawerTitle}>{selectedProduct.name}</div>
            <button
              type="button"
              className={styles.closeDrawerBtn}
              aria-label="Close inventory details"
              onClick={() => setSelectedProduct(null)}
            >
              ✕
            </button>
          </div>

          <div className={styles.drawerActionStrip}>
            {canAdjustInventory && (
              <Button variant="primary" size="sm" onClick={() => setAdjustModalOpen(true)}>
                Adjust Stock
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                window.print();
                pushToast({
                  title: `Printed shelf label for ${selectedProduct.sku}`,
                  tone: 'info',
                });
              }}
            >
              Print Shelf Label
            </Button>
          </div>

          <div>
            <div className={styles.infoSectionTitle}>Stock & valuation summary</div>
            <div className={styles.infoGridWithThumb}>
              <div className={styles.kvList}>
                <span className={styles.kvKey}>SKU</span>
                <span className={styles.kvVal} style={{ fontFamily: 'var(--font-mono)' }}>
                  {selectedProduct.sku}
                </span>

                <span className={styles.kvKey}>On Hand</span>
                <span className={`${styles.kvVal} tabular-nums`}>
                  {selectedProduct.stockQuantity} {selectedProduct.unit}
                </span>

                <span className={styles.kvKey}>Reorder At</span>
                <span className={`${styles.kvVal} tabular-nums`}>
                  {selectedProduct.minStockThreshold} {selectedProduct.unit}
                </span>

                <span className={styles.kvKey}>Sold (30d)</span>
                <span className={`${styles.kvVal} tabular-nums`}>
                  {selectedProduct.processedCount} {selectedProduct.unit}
                </span>

                {canViewCost && (
                  <>
                    <span className={styles.kvKey}>Unit Cost</span>
                    <span className={`${styles.kvVal} tabular-nums`}>
                      {formatCurrency(
                        selectedProduct.costPrice,
                        settings.currency,
                        settings.locale
                      )}
                    </span>

                    <span className={styles.kvKey}>Stock Value</span>
                    <span className={`${styles.kvVal} tabular-nums`}>
                      {formatCurrency(
                        selectedProduct.costPrice * selectedProduct.stockQuantity,
                        settings.currency,
                        settings.locale
                      )}
                    </span>
                  </>
                )}

                <span className={styles.kvKey}>Health</span>
                <span>
                  <StatusIndicator
                    tone={
                      selectedProduct.stockQuantity <= 0
                        ? 'danger'
                        : selectedProduct.stockQuantity <= selectedProduct.minStockThreshold
                        ? 'warning'
                        : 'success'
                    }
                    label={
                      selectedProduct.stockQuantity <= 0
                        ? 'Out of stock'
                        : selectedProduct.stockQuantity <= selectedProduct.minStockThreshold
                        ? 'Low stock'
                        : 'Healthy'
                    }
                    appearance="tag"
                  />
                </span>
              </div>

              <div className={styles.productBadgeBox}>
                <span style={{ fontSize: '18px', fontWeight: 700 }}>
                  {selectedProduct.name.slice(0, 2).toUpperCase()}
                </span>
                <span style={{ fontSize: '10.5px', color: 'var(--color-text-muted)' }}>
                  {selectedProduct.unit.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {selectedProductMovements.length > 0 && (
            <div>
              <div className={styles.infoSectionTitle}>Recent stock movements</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedProductMovements.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-control)',
                      backgroundColor: 'var(--color-surface-muted)',
                    }}
                  >
                    <span style={{ color: 'var(--color-text-secondary)' }}>{m.reason}</span>
                    <span
                      className="tabular-nums"
                      style={{
                        fontWeight: 600,
                        color:
                          m.quantityChange >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                      }}
                    >
                      {m.quantityChange >= 0 ? `+${m.quantityChange}` : m.quantityChange} {m.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales Statistics Line Chart */}
          <div>
            <div className={styles.statsHeaderRow}>
              <span className={styles.infoSectionTitle}>Depletion trend</span>
              <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                This year
              </span>
            </div>

            <svg
              viewBox="0 0 300 130"
              style={{ width: '100%', height: '130px', marginTop: '6px' }}
              role="img"
              aria-label="Product depletion statistics chart"
            >
              <rect x="115" y="10" width="95" height="95" fill="var(--color-surface-muted)" />
              <line
                x1="20"
                y1="55"
                x2="290"
                y2="55"
                stroke="var(--color-border)"
                strokeDasharray="3 3"
              />
              <line x1="20" y1="105" x2="290" y2="105" stroke="var(--color-border)" />
              {comparePrior && (
                <polyline
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  points="25,45 65,48 105,62 145,58 185,68 225,52 275,60"
                />
              )}
              <polyline
                fill="none"
                stroke="var(--color-text-primary)"
                strokeWidth="1.8"
                points="25,28 65,36 105,42 135,72 165,61 205,54 245,49 275,44"
              />
              <line
                x1="210"
                y1="10"
                x2="210"
                y2="105"
                stroke="var(--color-text-primary)"
                strokeDasharray="2 2"
              />
              <text x="20" y="122" fontSize="10" fill="var(--color-text-muted)">
                January
              </text>
              <text x="140" y="122" fontSize="10" fill="var(--color-text-muted)">
                June
              </text>
              <text x="260" y="122" fontSize="10" fill="var(--color-text-muted)">
                Oct
              </text>
            </svg>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '10px',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
              }}
            >
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={comparePrior}
                  onChange={(e) => setComparePrior(e.target.checked)}
                />
                <span>Compare to prior</span>
              </label>

              <div style={{ display: 'flex', gap: '10px', fontSize: '11.5px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>▪ 2025</span>
                <span style={{ fontWeight: 600 }}>▪ 2026</span>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Stock Adjustment Modal */}
      <Dialog
        open={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title={`Adjust Stock — ${selectedProduct?.name || ''}`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdjustModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={(e) => void handleConfirmAdjustment(e)}>
              Confirm Adjustment
            </Button>
          </>
        }
      >
        <form className={styles.formStack} onSubmit={handleConfirmAdjustment}>
          <div style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
            Current balance:{' '}
            <strong>
              {selectedProduct?.stockQuantity} {selectedProduct?.unit}
            </strong>
          </div>

          <div className={styles.fieldRow}>
            <label htmlFor="adj-type" className={styles.fieldLabel}>
              Adjustment type
            </label>
            <select
              id="adj-type"
              className={styles.fieldSelect}
              value={adjustType}
              onChange={(e) => setAdjustType(e.target.value as 'add' | 'remove')}
            >
              <option value="add">Add stock (+)</option>
              <option value="remove">Deduct / write-off stock (−)</option>
            </select>
          </div>

          <div className={styles.fieldRow}>
            <label htmlFor="adj-qty" className={styles.fieldLabel}>
              Quantity ({selectedProduct?.unit})
            </label>
            <input
              id="adj-qty"
              type="number"
              min="1"
              className={styles.fieldInput}
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
            />
          </div>

          <div className={styles.fieldRow}>
            <label htmlFor="adj-reason" className={styles.fieldLabel}>
              Reason
            </label>
            <input
              id="adj-reason"
              type="text"
              className={styles.fieldInput}
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
            />
          </div>

          <div className={styles.fieldRow}>
            <label htmlFor="adj-notes" className={styles.fieldLabel}>
              Optional notes
            </label>
            <input
              id="adj-notes"
              type="text"
              className={styles.fieldInput}
              placeholder="e.g. Verified by warehouse supervisor"
              value={adjustNotes}
              onChange={(e) => setAdjustNotes(e.target.value)}
            />
          </div>
        </form>
      </Dialog>

      {/* Register Perishable Expiry Batch Modal */}
      <Dialog
        open={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        title="Register Perishable / Expiry Batch"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBatchModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={(e) => void handleConfirmBatch(e)}>
              Save Batch & Add Stock
            </Button>
          </>
        }
      >
        <form className={styles.formStack} onSubmit={handleConfirmBatch}>
          <div className={styles.fieldRow}>
            <label htmlFor="bat-prod" className={styles.fieldLabel}>
              Product
            </label>
            <select
              id="bat-prod"
              className={styles.fieldSelect}
              value={batchProductId}
              onChange={(e) => setBatchProductId(e.target.value)}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldRow}>
            <label htmlFor="bat-num" className={styles.fieldLabel}>
              Batch / Lot identifier
            </label>
            <input
              id="bat-num"
              type="text"
              className={styles.fieldInput}
              value={batchNum}
              onChange={(e) => setBatchNum(e.target.value)}
            />
          </div>

          <div className={styles.fieldRow}>
            <label htmlFor="bat-exp" className={styles.fieldLabel}>
              Expiry date
            </label>
            <input
              id="bat-exp"
              type="date"
              className={styles.fieldInput}
              value={batchExpiry}
              onChange={(e) => setBatchExpiry(e.target.value)}
            />
          </div>

          <div className={styles.fieldRow}>
            <label htmlFor="bat-qty" className={styles.fieldLabel}>
              Received quantity
            </label>
            <input
              id="bat-qty"
              type="number"
              min="1"
              className={styles.fieldInput}
              value={batchQty}
              onChange={(e) => setBatchQty(e.target.value)}
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
