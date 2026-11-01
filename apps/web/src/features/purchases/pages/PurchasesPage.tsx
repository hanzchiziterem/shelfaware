import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useAuthStore } from '@/store/authStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useProductStore } from '@/store/productStore';
import { usePurchaseStore } from '@/store/purchaseStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSupplierStore } from '@/store/supplierStore';
import { useUiStore } from '@/store/uiStore';
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/common';
import { formatCompactCurrency, formatCurrency } from '@/utils/currency';
import styles from './PurchasesPage.module.css';

export function PurchasesPage() {
  const user = useAuthStore((s) => s.user);
  const settings = useSettingsStore((s) => s.settings);
  const pushToast = useUiStore((s) => s.pushToast);

  const purchases = usePurchaseStore((s) => s.purchases);
  const fetchPurchases = usePurchaseStore((s) => s.fetchPurchases);
  const createPurchase = usePurchaseStore((s) => s.createPurchase);
  const updatePurchaseStatus = usePurchaseStore((s) => s.updatePurchaseStatus);
  const receivePurchase = usePurchaseStore((s) => s.receivePurchase);

  const products = useProductStore((s) => s.products);
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const fetchInventory = useInventoryStore((s) => s.fetchInventory);
  const suppliers = useSupplierStore((s) => s.suppliers);
  const fetchSuppliers = useSupplierStore((s) => s.fetchSuppliers);

  const [statusFilter, setStatusFilter] = useState<
    'all' | 'draft' | 'awaiting' | 'partially_received' | 'received' | 'cancelled'
  >('all');

  // Create Purchase Order Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [supplierId, setSupplierId] = useState('sup-01');
  const [productId, setProductId] = useState('prod-101');
  const [orderedQty, setOrderedQty] = useState('20');
  const [unitCost, setUnitCost] = useState('71000');
  const [expectedDate, setExpectedDate] = useState('2026-11-05');
  const [poInitialStatus, setPoInitialStatus] = useState<'draft' | 'ordered'>('ordered');
  const [batchNumber, setBatchNumber] = useState('BATCH-PO-2611');
  const [expiryDate, setExpiryDate] = useState('2027-07-30');

  // Receive Delivery Modal (supports full & partial deliveries + discrepancy logging)
  const [receivingPo, setReceivingPo] = useState<PurchaseOrder | null>(null);
  const [deliveryQuantities, setDeliveryQuantities] = useState<Record<string, string>>({});
  const [discrepancyNotes, setDiscrepancyNotes] = useState('');

  useEffect(() => {
    void fetchPurchases();
    void fetchProducts();
    void fetchSuppliers();
  }, [fetchPurchases, fetchProducts, fetchSuppliers]);

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createPurchase({
      supplierId,
      expectedDate,
      status: poInitialStatus,
      paymentStatus: 'unpaid',
      createdBy: user?.fullName || 'Store Manager',
      items: [
        {
          productId,
          orderedQuantity: Number(orderedQty) || 10,
          unitCost: Number(unitCost) || 10000,
          batchNumber: batchNumber || undefined,
          expiryDate: expiryDate || undefined,
        },
      ],
    });

    if (created) {
      setCreateOpen(false);
      pushToast({
        title:
          poInitialStatus === 'draft'
            ? `Saved draft purchase order ${created.reference}`
            : `Purchase order ${created.reference} submitted to supplier`,
        description: 'Inventory is not increased until delivery is received and verified.',
        tone: 'info',
      });
    }
  };

  const openReceiveModal = (po: PurchaseOrder) => {
    const defaults: Record<string, string> = {};
    for (const item of po.items) {
      const remaining = Math.max(0, item.orderedQuantity - item.receivedQuantity);
      defaults[item.productId] = String(remaining);
    }
    setReceivingPo(po);
    setDeliveryQuantities(defaults);
    setDiscrepancyNotes(po.discrepancyNotes || '');
  };

  const handleConfirmReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingPo) return;

    const parsedQuantities: Record<string, number> = {};
    let totalToReceiveNow = 0;

    for (const item of receivingPo.items) {
      const remaining = Math.max(0, item.orderedQuantity - item.receivedQuantity);
      const val = Math.max(0, Math.min(remaining, Number(deliveryQuantities[item.productId]) || 0));
      parsedQuantities[item.productId] = val;
      totalToReceiveNow += val;
    }

    if (totalToReceiveNow <= 0) {
      pushToast({
        title: 'Enter a delivered quantity greater than zero',
        tone: 'error',
      });
      return;
    }

    const ok = await receivePurchase(
      receivingPo.id,
      user?.fullName || 'Store Manager',
      parsedQuantities,
      discrepancyNotes.trim() || undefined
    );

    if (ok) {
      setReceivingPo(null);
      await Promise.all([fetchProducts(), fetchInventory()]);
      pushToast({
        title: `Stock received for ${receivingPo.reference}`,
        description: 'Delivered quantities added to active inventory and logged in stock movements.',
        tone: 'success',
      });
    }
  };

  const handleSubmitDraft = async (po: PurchaseOrder) => {
    const ok = await updatePurchaseStatus(po.id, 'ordered');
    if (ok) {
      pushToast({
        title: `${po.reference} submitted to ${po.supplierName}`,
        description: 'Status updated to Awaiting Delivery.',
        tone: 'info',
      });
    }
  };

  const handleCancelPo = async (po: PurchaseOrder) => {
    const ok = await updatePurchaseStatus(po.id, 'cancelled');
    if (ok) {
      pushToast({
        title: `Purchase order ${po.reference} cancelled`,
        tone: 'warning',
      });
    }
  };

  const isAwaitingStatus = (status: PurchaseOrderStatus) =>
    status === 'ordered' || status === 'submitted' || status === 'awaiting_delivery';

  const filteredPurchases = purchases.filter((po) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'awaiting') return isAwaitingStatus(po.status);
    return po.status === statusFilter;
  });

  const awaitingDeliveryCount = purchases.filter(
    (p) => isAwaitingStatus(p.status) || p.status === 'partially_received'
  ).length;
  const draftCount = purchases.filter((p) => p.status === 'draft').length;
  const receivedValue = purchases
    .filter((p) => p.status === 'received' || p.status === 'partially_received')
    .reduce((acc, p) => acc + p.totalCost, 0);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Purchases & Receiving</h1>
          <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
            Create supplier purchase orders, track delivery statuses, and verify full or partial stock-in deliveries.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          + New Purchase Order
        </Button>
      </div>

      <div className={styles.statStrip}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{purchases.length}</span>
          <span className={styles.statLabel}>Total purchase orders</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{awaitingDeliveryCount}</span>
          <span className={styles.statLabel}>Awaiting / partial delivery</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{draftCount}</span>
          <span className={styles.statLabel}>Draft orders pending submission</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{formatCompactCurrency(receivedValue)}</span>
          <span className={styles.statLabel}>Received purchase value</span>
        </div>
      </div>

      <div className={styles.tabsRow} role="tablist">
        {(
          [
            { id: 'all', label: `All (${purchases.length})` },
            { id: 'draft', label: `Draft (${draftCount})` },
            {
              id: 'awaiting',
              label: `Awaiting Delivery (${purchases.filter((p) => isAwaitingStatus(p.status)).length})`,
            },
            {
              id: 'partially_received',
              label: `Partially Received (${
                purchases.filter((p) => p.status === 'partially_received').length
              })`,
            },
            {
              id: 'received',
              label: `Fully Received (${purchases.filter((p) => p.status === 'received').length})`,
            },
            {
              id: 'cancelled',
              label: `Cancelled (${purchases.filter((p) => p.status === 'cancelled').length})`,
            },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={statusFilter === tab.id}
            className={`${styles.tabBtn} ${statusFilter === tab.id ? styles.tabBtnActive : ''}`}
            onClick={() => setStatusFilter(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Supplier</th>
              <th>Items (Received / Ordered)</th>
              <th>Expected Date</th>
              <th style={{ textAlign: 'right' }}>Total Cost</th>
              <th>PO Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.map((po) => (
              <tr key={po.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{po.reference}</td>
                <td style={{ fontWeight: 500 }}>{po.supplierName}</td>
                <td style={{ color: 'var(--color-text-secondary)' }}>
                  {po.items
                    .map(
                      (i) =>
                        `${i.productName} (${i.receivedQuantity}/${i.orderedQuantity} ${i.unit})`
                    )
                    .join(', ')}
                </td>
                <td className="tabular-nums">{po.expectedDate}</td>
                <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(po.totalCost, settings.currency, settings.locale)}
                </td>
                <td>
                  {po.status === 'received' && (
                    <StatusIndicator tone="success" label="Fully received" appearance="tag" />
                  )}
                  {po.status === 'partially_received' && (
                    <StatusIndicator tone="warning" label="Partially received" appearance="tag" />
                  )}
                  {isAwaitingStatus(po.status) && (
                    <StatusIndicator tone="warning" label="Awaiting delivery" appearance="tag" />
                  )}
                  {po.status === 'draft' && (
                    <StatusIndicator tone="neutral" label="Draft" appearance="tag" />
                  )}
                  {po.status === 'cancelled' && (
                    <StatusIndicator tone="danger" label="Cancelled" appearance="tag" />
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
                    {po.status === 'draft' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => void handleSubmitDraft(po)}
                        >
                          Submit PO
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => void handleCancelPo(po)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {(isAwaitingStatus(po.status) || po.status === 'partially_received') && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openReceiveModal(po)}
                        >
                          Receive Stock
                        </Button>
                        {po.status !== 'partially_received' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => void handleCancelPo(po)}
                          >
                            Cancel
                          </Button>
                        )}
                      </>
                    )}
                    {(po.status === 'received' || po.status === 'cancelled') && (
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {po.status === 'received' ? 'Stocked In' : 'Cancelled'}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Purchase Order Modal */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Supplier Purchase Order"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={(e) => void handleCreatePo(e)}>
              {poInitialStatus === 'draft' ? 'Save as Draft' : 'Submit Purchase Order'}
            </Button>
          </>
        }
      >
        <form className={styles.formStack} onSubmit={handleCreatePo}>
          <div className={styles.fieldGroup}>
            <label htmlFor="po-sup" className={styles.label}>
              Supplier
            </label>
            <select
              id="po-sup"
              className={styles.select}
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="po-prod" className={styles.label}>
              Product to Replenish
            </label>
            <select
              id="po-prod"
              className={styles.select}
              value={productId}
              onChange={(e) => {
                const p = products.find((x) => x.id === e.target.value);
                setProductId(e.target.value);
                if (p) setUnitCost(String(p.costPrice));
              }}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="po-qty" className={styles.label}>
              Quantity to Order
            </label>
            <input
              id="po-qty"
              type="number"
              min="1"
              className={styles.input}
              value={orderedQty}
              onChange={(e) => setOrderedQty(e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="po-cost" className={styles.label}>
              Supplier Unit Cost (₦)
            </label>
            <input
              id="po-cost"
              type="number"
              min="1"
              className={styles.input}
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="po-status" className={styles.label}>
              Initial Order Status
            </label>
            <select
              id="po-status"
              className={styles.select}
              value={poInitialStatus}
              onChange={(e) => setPoInitialStatus(e.target.value as 'draft' | 'ordered')}
            >
              <option value="ordered">Submit to Supplier (Awaiting Delivery)</option>
              <option value="draft">Save as Draft (Not yet sent)</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="po-date" className={styles.label}>
              Expected Delivery Date
            </label>
            <input
              id="po-date"
              type="date"
              className={styles.input}
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="po-batch" className={styles.label}>
              Batch / Lot Code (Optional)
            </label>
            <input
              id="po-batch"
              type="text"
              className={styles.input}
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="po-exp" className={styles.label}>
              Batch Expiry Date (Optional)
            </label>
            <input
              id="po-exp"
              type="date"
              className={styles.input}
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>
        </form>
      </Dialog>

      {/* Receive Stock Modal supporting Full & Partial Receiving */}
      <Dialog
        open={Boolean(receivingPo)}
        onClose={() => setReceivingPo(null)}
        title={`Receive Delivery — ${receivingPo?.reference || ''}`}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReceivingPo(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={(e) => void handleConfirmReceive(e)}>
              Confirm Delivered Quantities & Update Stock
            </Button>
          </>
        }
      >
        {receivingPo && (
          <form className={styles.formStack} onSubmit={handleConfirmReceive}>
            <div style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
              Supplier: <strong>{receivingPo.supplierName}</strong> · Confirm the exact physical
              quantities offloaded today. Entering less than the remaining quantity will mark this
              PO as <strong>Partially Received</strong>.
            </div>

            {receivingPo.items.map((item) => {
              const remaining = Math.max(0, item.orderedQuantity - item.receivedQuantity);
              const enteredQty = Number(deliveryQuantities[item.productId]) || 0;
              const discrepancy = remaining - enteredQty;

              return (
                <div key={item.productId} className={styles.receiveItemCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                    <strong style={{ fontSize: '13px' }}>{item.productName}</strong>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {item.sku}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '16px',
                      fontSize: '12px',
                      color: 'var(--color-text-secondary)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>
                      Ordered: <strong>{item.orderedQuantity} {item.unit}</strong>
                    </span>
                    <span>
                      Previously Received: <strong>{item.receivedQuantity} {item.unit}</strong>
                    </span>
                    <span>
                      Outstanding: <strong>{remaining} {item.unit}</strong>
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      alignItems: 'center',
                      marginTop: '4px',
                    }}
                  >
                    <div>
                      <label
                        htmlFor={`recv-qty-${item.productId}`}
                        className={styles.label}
                      >
                        Delivered Now ({item.unit})
                      </label>
                      <input
                        id={`recv-qty-${item.productId}`}
                        type="number"
                        min="0"
                        max={remaining}
                        className={styles.input}
                        value={deliveryQuantities[item.productId] ?? String(remaining)}
                        onChange={(e) =>
                          setDeliveryQuantities((prev) => ({
                            ...prev,
                            [item.productId]: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div style={{ fontSize: '12px', paddingTop: '16px' }}>
                      {discrepancy > 0 ? (
                        <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                          Shortfall / Pending: {discrepancy} {item.unit}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                          Full remaining quantity matched
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className={styles.fieldGroup}>
              <label htmlFor="recv-notes" className={styles.label}>
                Receiving / Discrepancy Notes (Optional)
              </label>
              <input
                id="recv-notes"
                type="text"
                className={styles.input}
                placeholder="e.g. Waybill #WB-8821 verified; 5 bags scheduled for second truck"
                value={discrepancyNotes}
                onChange={(e) => setDiscrepancyNotes(e.target.value)}
              />
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
