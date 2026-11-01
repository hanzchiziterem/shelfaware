import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasPermission } from '@/app/config/permissions';
import { PATHS } from '@/app/router/paths';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useAuthStore } from '@/store/authStore';
import { useSalesStore } from '@/store/salesStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';
import type { OrderFulfillmentType, PaymentMethod, SaleStatus } from '@/types/common';
import { formatCompactCurrency, formatCurrency } from '@/utils/currency';
import { formatFullDateTime, formatShortDate } from '@/utils/dates';
import styles from './OrdersPage.module.css';

export function OrdersPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const settings = useSettingsStore((s) => s.settings);
  const pushToast = useUiStore((s) => s.pushToast);

  const sales = useSalesStore((s) => s.sales);
  const selectedSale = useSalesStore((s) => s.selectedSale);
  const setSelectedSale = useSalesStore((s) => s.setSelectedSale);
  const searchQuery = useSalesStore((s) => s.searchQuery);
  const setSearchQuery = useSalesStore((s) => s.setSearchQuery);
  const statusFilter = useSalesStore((s) => s.statusFilter);
  const setStatusFilter = useSalesStore((s) => s.setStatusFilter);
  const fulfillmentFilter = useSalesStore((s) => s.fulfillmentFilter);
  const setFulfillmentFilter = useSalesStore((s) => s.setFulfillmentFilter);
  const paymentFilter = useSalesStore((s) => s.paymentFilter);
  const setPaymentFilter = useSalesStore((s) => s.setPaymentFilter);
  const fetchSales = useSalesStore((s) => s.fetchSales);
  const voidOrRefundSale = useSalesStore((s) => s.voidOrRefundSale);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailTab, setDetailTab] = useState<'items' | 'delivery' | 'receipt'>('items');
  const [voidModalAction, setVoidModalAction] = useState<'void' | 'refund' | null>(null);
  const [voidReason, setVoidReason] = useState('Customer requested return of unopened items');

  const canVoidOrRefund = hasPermission(user?.role, 'void_or_refund_sale');

  useEffect(() => {
    void fetchSales();
  }, [fetchSales]);

  const filteredSales = sales.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (fulfillmentFilter !== 'all' && s.fulfillmentType !== fulfillmentFilter) return false;
    if (paymentFilter !== 'all' && s.paymentMethod !== paymentFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchOrder = s.orderNumber.toLowerCase().includes(q);
      const matchCustomer = s.customerName.toLowerCase().includes(q);
      const matchProduct = s.items.some((i) => i.productName.toLowerCase().includes(q));
      if (!matchOrder && !matchCustomer && !matchProduct) return false;
    }
    return true;
  });

  // Analytics calculations for the right rail
  const completedSales = sales.filter((s) => s.status === 'completed');
  const totalRevenue = completedSales.reduce((acc, s) => acc + s.total, 0);
  const deliveryRevenue = completedSales
    .filter((s) => s.fulfillmentType === 'Delivery')
    .reduce((acc, s) => acc + s.total, 0);
  const pickupAndWalkinRevenue = totalRevenue - deliveryRevenue;
  const deliveryCount = completedSales.filter((s) => s.fulfillmentType === 'Delivery').length;
  const pickupCount = completedSales.length - deliveryCount;

  const totalCount = sales.length || 1;
  const paidPct = Math.round((completedSales.length / totalCount) * 100);
  const cancelledPct = Math.round(
    (sales.filter((s) => s.status === 'cancelled').length / totalCount) * 100
  );
  const refundedPct = Math.max(0, 100 - paidPct - cancelledPct);

  const avgOrderVal = completedSales.length ? Math.round(totalRevenue / completedSales.length) : 0;
  const avgItemsPerOrder = completedSales.length
    ? (
        completedSales.reduce((acc, s) => acc + s.itemsCount, 0) / completedSales.length
      ).toFixed(1)
    : '0.0';

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleExportCsv = () => {
    const rows = [
      ['Order', 'Customer', 'Type', 'Status', 'Payment', 'Total (NGN)', 'Date'].join(','),
      ...filteredSales.map((s) =>
        [
          s.orderNumber,
          `"${s.customerName}"`,
          s.fulfillmentType,
          s.status,
          s.paymentMethod,
          s.total,
          s.createdAt,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    pushToast({
      title: `Exported ${filteredSales.length} order records to CSV`,
      tone: 'success',
    });
  };

  const handleConfirmVoidOrRefund = async () => {
    if (!selectedSale || !voidModalAction) return;
    const ok = await voidOrRefundSale(
      selectedSale.id,
      voidModalAction,
      voidReason,
      user?.fullName || 'Store Manager'
    );
    if (ok) {
      pushToast({
        title: `Order ${selectedSale.orderNumber} ${
          voidModalAction === 'void' ? 'cancelled' : 'refunded'
        }`,
        description: 'Product stock balances and movement history updated.',
        tone: 'info',
      });
      setVoidModalAction(null);
    }
  };

  return (
    <div className={styles.ordersLayout}>
      <div className={styles.mainArea}>
        <div className={styles.headerRow}>
          <h1 className={styles.pageTitle}>Orders</h1>
          <div className={styles.headerActions}>
            <Button variant="primary" onClick={() => navigate(PATHS.APP.POS)}>
              + New Sale
            </Button>
            <Button variant="secondary" onClick={handleExportCsv}>
              ↑ Export
            </Button>
          </div>
        </div>

        {/* Rounded filter chips matching the Orders reference UI */}
        <div className={styles.filterChipsRow}>
          <div className={styles.chipsLeft}>
            <select
              aria-label="Filter by fulfillment type"
              className={`${styles.chipSelect} ${
                fulfillmentFilter !== 'all' ? styles.chipSelectActive : ''
              }`}
              value={fulfillmentFilter}
              onChange={(e) =>
                setFulfillmentFilter(e.target.value as 'all' | OrderFulfillmentType)
              }
            >
              <option value="all">Type: All</option>
              <option value="Walk-in">Type: Walk-in</option>
              <option value="Pickup">Type: Pickups</option>
              <option value="Delivery">Type: Delivery</option>
            </select>

            <select
              aria-label="Filter by order status"
              className={`${styles.chipSelect} ${
                statusFilter !== 'all' ? styles.chipSelectActive : ''
              }`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | SaleStatus)}
            >
              <option value="all">Status: All</option>
              <option value="completed">Status: Paid</option>
              <option value="refunded">Status: Refunded</option>
              <option value="cancelled">Status: Cancelled</option>
            </select>

            <select
              aria-label="Filter by payment method"
              className={`${styles.chipSelect} ${
                paymentFilter !== 'all' ? styles.chipSelectActive : ''
              }`}
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as 'all' | PaymentMethod)}
            >
              <option value="all">Payment: All</option>
              <option value="cash">Payment: Cash</option>
              <option value="bank_transfer">Payment: Bank Transfer</option>
              <option value="card">Payment: POS Card</option>
            </select>

            {(fulfillmentFilter !== 'all' ||
              statusFilter !== 'all' ||
              paymentFilter !== 'all' ||
              searchQuery !== '') && (
              <button
                type="button"
                className={styles.chipSelect}
                onClick={() => {
                  setFulfillmentFilter('all');
                  setStatusFilter('all');
                  setPaymentFilter('all');
                  setSearchQuery('');
                }}
              >
                Reset filters
              </button>
            )}
          </div>

          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search #order, customer, item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredSales.length === 0 ? (
          <EmptyState
            title="No matching orders found"
            description="Adjust your search query or status filters, or record a new counter transaction in the Point of Sale."
            action={
              <Button variant="primary" onClick={() => navigate(PATHS.APP.POS)}>
                Open Point of Sale
              </Button>
            }
          />
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th style={{ width: '36px' }}>
                    <input
                      type="checkbox"
                      aria-label="Select all orders"
                      checked={
                        filteredSales.length > 0 && selectedIds.length === filteredSales.length
                      }
                      onChange={(e) =>
                        setSelectedIds(
                          e.target.checked ? filteredSales.map((s) => s.id) : []
                        )
                      }
                    />
                  </th>
                  <th>Order ↓</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Product</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ textAlign: 'right' }}>Date</th>
                  <th style={{ width: '40px' }} />
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => {
                  const isChecked = selectedIds.includes(sale.id);
                  const isSelected = selectedSale?.id === sale.id;
                  return (
                    <tr
                      key={sale.id}
                      className={isSelected || isChecked ? styles.rowSelected : ''}
                      onClick={() => setSelectedSale(sale)}
                    >
                      <td onClick={(e) => toggleSelectRow(sale.id, e)}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          aria-label={`Select order ${sale.orderNumber}`}
                        />
                      </td>
                      <td className="tabular-nums" style={{ fontWeight: 500 }}>
                        {sale.orderNumber}
                      </td>
                      <td>
                        <div className={styles.customerCell}>
                          <span className={styles.avatarBadge}>{sale.customerInitials}</span>
                          <span>{sale.customerName}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>
                        {sale.fulfillmentType}
                      </td>
                      <td>
                        {sale.status === 'completed' && (
                          <StatusIndicator tone="success" label="Paid" />
                        )}
                        {sale.status === 'refunded' && (
                          <StatusIndicator tone="neutral" label="Refunded" />
                        )}
                        {sale.status === 'cancelled' && (
                          <StatusIndicator tone="danger" label="Cancelled" />
                        )}
                      </td>
                      <td>
                        <span className={styles.productThumbs}>
                          <span>
                            {sale.items[0]?.productName.slice(0, 28)}
                            {sale.items.length > 1 ? ` +${sale.items.length - 1} more` : ''}
                          </span>
                        </span>
                      </td>
                      <td
                        className="tabular-nums"
                        style={{ textAlign: 'right', fontWeight: 600 }}
                      >
                        {formatCurrency(sale.total, settings.currency, settings.locale)}
                      </td>
                      <td
                        className="tabular-nums"
                        style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}
                      >
                        {formatShortDate(sale.createdAt)}
                      </td>
                      <td>
                        <button
                          type="button"
                          className={styles.moreDotsBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSale(sale);
                          }}
                          aria-label={`Inspect order ${sale.orderNumber}`}
                        >
                          ···
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Floating contextual order popover card matching Order #4567 in reference image */}
        {selectedSale && (
          <div className={styles.floatingOrderCard} role="dialog" aria-label="Order details">
            <div className={styles.floatingHeader}>
              <span>Order {selectedSale.orderNumber}</span>
              <div className={styles.floatingHeaderActions}>
                <button
                  type="button"
                  className={styles.floatingCloseBtn}
                  onClick={() => setSelectedSale(null)}
                  aria-label="Close order details"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className={styles.floatingBody}>
              <div className={styles.contactList}>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {selectedSale.customerName}
                </div>
                {selectedSale.customerEmail && <div>{selectedSale.customerEmail}</div>}
                {selectedSale.customerPhone && <div>{selectedSale.customerPhone}</div>}
                <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                  Cashier: {selectedSale.cashierName} · {formatFullDateTime(selectedSale.createdAt)}
                </div>
              </div>

              <div className={styles.floatingTabs}>
                <button
                  type="button"
                  className={`${styles.floatingTabBtn} ${
                    detailTab === 'items' ? styles.floatingTabActive : ''
                  }`}
                  onClick={() => setDetailTab('items')}
                >
                  Order items ({selectedSale.items.length})
                </button>
                <button
                  type="button"
                  className={`${styles.floatingTabBtn} ${
                    detailTab === 'delivery' ? styles.floatingTabActive : ''
                  }`}
                  onClick={() => setDetailTab('delivery')}
                >
                  Payment & notes
                </button>
                <button
                  type="button"
                  className={`${styles.floatingTabBtn} ${
                    detailTab === 'receipt' ? styles.floatingTabActive : ''
                  }`}
                  onClick={() => setDetailTab('receipt')}
                >
                  Receipt
                </button>
              </div>

              {detailTab === 'items' && (
                <div className={styles.lineItemsList}>
                  {selectedSale.items.map((item) => (
                    <div key={item.productId} className={styles.lineItemRow}>
                      <div>
                        <div className={styles.lineItemTitle}>{item.productName}</div>
                        <div className={styles.lineItemPrice}>
                          {item.quantity} {item.unit} ×{' '}
                          {formatCurrency(item.unitPrice, settings.currency, settings.locale)}
                        </div>
                      </div>
                      <div className="tabular-nums" style={{ fontWeight: 600 }}>
                        {formatCurrency(item.subtotal, settings.currency, settings.locale)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {detailTab === 'delivery' && (
                <div className={styles.contactList}>
                  <div>
                    <strong>Fulfillment:</strong> {selectedSale.fulfillmentType}
                  </div>
                  <div>
                    <strong>Payment Method:</strong>{' '}
                    {selectedSale.paymentMethod.replace('_', ' ').toUpperCase()}
                  </div>
                  <div>
                    <strong>Amount Tendered:</strong>{' '}
                    {formatCurrency(selectedSale.amountReceived, settings.currency, settings.locale)}
                  </div>
                  {selectedSale.changeGiven > 0 && (
                    <div>
                      <strong>Change Given:</strong>{' '}
                      {formatCurrency(selectedSale.changeGiven, settings.currency, settings.locale)}
                    </div>
                  )}
                  {selectedSale.notes && (
                    <div>
                      <strong>Notes:</strong> {selectedSale.notes}
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'receipt' && (
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11.5px',
                    padding: '10px',
                    backgroundColor: 'var(--color-surface-muted)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{settings.businessName}</div>
                  <div>{settings.address}</div>
                  <div>Order: {selectedSale.orderNumber}</div>
                  <hr style={{ border: 'none', borderTop: '1px dashed var(--color-border-strong)' }} />
                  {selectedSale.items.map((i) => (
                    <div
                      key={i.productId}
                      style={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                      <span>
                        {i.quantity}x {i.productName.slice(0, 18)}
                      </span>
                      <span>{formatCurrency(i.subtotal)}</span>
                    </div>
                  ))}
                  <hr style={{ border: 'none', borderTop: '1px dashed var(--color-border-strong)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span>TOTAL</span>
                    <span>{formatCurrency(selectedSale.total)}</span>
                  </div>
                  <div style={{ marginTop: '4px', color: 'var(--color-text-muted)' }}>
                    {settings.receiptFooter}
                  </div>
                </div>
              )}

              <div className={styles.totalRow}>
                <span>Total:</span>
                <span className="tabular-nums">
                  {formatCurrency(selectedSale.total, settings.currency, settings.locale)}
                </span>
              </div>
            </div>

            <div className={styles.floatingFooter}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className={styles.miniActionBtn}
                  onClick={() => {
                    window.print();
                    pushToast({
                      title: `Receipt ${selectedSale.orderNumber} sent to print preview`,
                      tone: 'info',
                    });
                  }}
                >
                  Print
                </button>
                <button
                  type="button"
                  className={styles.miniActionBtn}
                  onClick={handleExportCsv}
                >
                  ↑ Export
                </button>
              </div>

              {canVoidOrRefund && selectedSale.status === 'completed' && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className={styles.miniActionBtn}
                    onClick={() => setVoidModalAction('refund')}
                  >
                    Refund
                  </button>
                  <button
                    type="button"
                    className={styles.miniActionBtn}
                    style={{ color: 'var(--color-danger)' }}
                    onClick={() => setVoidModalAction('void')}
                  >
                    Void
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating bottom bulk action bar matching reference UI */}
        {selectedIds.length > 0 && (
          <div className={styles.bulkFloatingBar}>
            <button
              type="button"
              className={styles.bulkActionBtn}
              onClick={() => setSelectedIds([])}
              aria-label="Clear selection"
            >
              ✕
            </button>
            <span className="tabular-nums">Selected: {selectedIds.length}</span>
            <button type="button" className={styles.bulkActionBtn} onClick={handleExportCsv}>
              ↑ Export
            </button>
            <button
              type="button"
              className={styles.bulkActionBtn}
              onClick={() => {
                window.print();
                pushToast({
                  title: `Prepared batch print for ${selectedIds.length} orders`,
                  tone: 'info',
                });
              }}
            >
              Print
            </button>
          </div>
        )}
      </div>

      {/* Right Analytics Column matching Orders reference image */}
      <aside className={styles.analyticsRail} aria-label="Orders Analytics">
        <div className={styles.railSection}>
          <div className={styles.railTitleRow}>
            <span className={styles.railTitle}>RECEIPT OF GOODS</span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '6px 0',
            }}
          >
            <svg viewBox="0 0 200 110" style={{ width: '190px', height: '105px' }} aria-hidden="true">
              <path
                d="M 20 95 A 80 80 0 0 1 180 95"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M 20 95 A 80 80 0 0 1 140 32"
                fill="none"
                stroke="var(--color-success)"
                strokeWidth="12"
                strokeLinecap="round"
              />
            </svg>
            <div
              className="tabular-nums"
              style={{ fontSize: '21px', fontWeight: 700, marginTop: '-38px' }}
            >
              {formatCompactCurrency(totalRevenue)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              {completedSales.length} orders
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
              <div>
                <div className="tabular-nums" style={{ fontSize: '13.5px', fontWeight: 600 }}>
                  <span style={{ color: 'var(--color-success)', marginRight: '5px' }}>▪</span>
                  {formatCompactCurrency(deliveryRevenue)}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                  {deliveryCount} deliveries
                </div>
              </div>
              <div>
                <div className="tabular-nums" style={{ fontSize: '13.5px', fontWeight: 600 }}>
                  <span style={{ color: 'var(--color-text-muted)', marginRight: '5px' }}>▪</span>
                  {formatCompactCurrency(pickupAndWalkinRevenue)}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                  {pickupCount} pickups / walk-in
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.railSection}>
          <div className={styles.railTitleRow}>
            <span className={styles.railTitle}>ORDERS STATUS</span>
            <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>Active</span>
          </div>

          <div
            style={{
              display: 'flex',
              height: '6px',
              borderRadius: '3px',
              overflow: 'hidden',
              gap: '2px',
              backgroundColor: 'var(--color-surface-muted)',
            }}
          >
            <div style={{ width: `${paidPct}%`, backgroundColor: 'var(--color-success)' }} />
            <div style={{ width: `${cancelledPct}%`, backgroundColor: 'var(--color-danger)' }} />
            <div style={{ width: `${refundedPct}%`, backgroundColor: '#9ca3af' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                <span style={{ color: 'var(--color-success)', marginRight: '6px' }}>▪</span>
                Paid
              </span>
              <span className="tabular-nums" style={{ fontWeight: 600 }}>
                {paidPct}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                <span style={{ color: 'var(--color-danger)', marginRight: '6px' }}>▪</span>
                Cancelled
              </span>
              <span className="tabular-nums" style={{ fontWeight: 600 }}>
                {cancelledPct}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                <span style={{ color: '#9ca3af', marginRight: '6px' }}>▪</span>
                Refunded
              </span>
              <span className="tabular-nums" style={{ fontWeight: 600 }}>
                {refundedPct}%
              </span>
            </div>
          </div>
        </div>

        <div className={styles.railSection}>
          <div className={styles.railTitleRow}>
            <span className={styles.railTitle}>OVERVIEW</span>
            <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>This month</span>
          </div>

          <div className={styles.overviewGrid}>
            <div>
              <div className={styles.overviewMetricVal}>
                {formatCurrency(avgOrderVal, settings.currency, settings.locale)}
              </div>
              <div className={styles.overviewMetricLabel}>Average order</div>
            </div>
            <div>
              <div className={styles.overviewMetricVal}>{formatCompactCurrency(totalRevenue)}</div>
              <div className={styles.overviewMetricLabel}>Total revenue</div>
            </div>
            <div>
              <div className={styles.overviewMetricVal}>4 min</div>
              <div className={styles.overviewMetricLabel}>Counter checkout time</div>
            </div>
            <div>
              <div className={styles.overviewMetricVal}>{avgItemsPerOrder}</div>
              <div className={styles.overviewMetricLabel}>Avg. items/order</div>
            </div>
            <div>
              <div className={styles.overviewMetricVal}>{refundedPct}%</div>
              <div className={styles.overviewMetricLabel}>Refund rate</div>
            </div>
            <div>
              <div className={styles.overviewMetricVal}>{cancelledPct}%</div>
              <div className={styles.overviewMetricLabel}>Cancel rate</div>
            </div>
          </div>
        </div>

        <div className={styles.railSection}>
          <div className={styles.railTitleRow}>
            <span className={styles.railTitle}>TOP SELLERS</span>
            <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>This month</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 500 }}>
              Royal Stallion Parboiled Rice 50kg
            </div>
            <span className="tabular-nums" style={{ fontWeight: 600 }}>
              14
            </span>
          </div>
        </div>
      </aside>

      <Dialog
        open={voidModalAction !== null}
        onClose={() => setVoidModalAction(null)}
        title={
          voidModalAction === 'void'
            ? `Void Order ${selectedSale?.orderNumber}`
            : `Refund Order ${selectedSale?.orderNumber}`
        }
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setVoidModalAction(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => void handleConfirmVoidOrRefund()}>
              Confirm {voidModalAction === 'void' ? 'Void' : 'Refund'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            This action will mark order <strong>{selectedSale?.orderNumber}</strong> as{' '}
            {voidModalAction === 'void' ? 'cancelled' : 'refunded'} and automatically restore the
            item quantities back to store inventory with an auditable stock movement entry.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="void-reason" style={{ fontWeight: 500, fontSize: '12.5px' }}>
              Reason for {voidModalAction}
            </label>
            <input
              id="void-reason"
              type="text"
              style={{
                height: '36px',
                padding: '0 10px',
                border: '1px solid var(--color-border-strong)',
                borderRadius: 'var(--radius-control)',
              }}
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
