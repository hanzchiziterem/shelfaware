import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChevronDown,
  GripVertical,
  Info,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { hasPermission } from '@/app/config/permissions';
import { PATHS } from '@/app/router/paths';
import { Button } from '@/components/ui/Button';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useSettingsStore } from '@/store/settingsStore';
import { formatCompactCurrency, formatCurrency } from '@/utils/currency';
import { formatShortDate, getDaysUntilExpiry } from '@/utils/dates';
import styles from './DashboardPage.module.css';

type RailWidgetId = 'payments' | 'alerts' | 'topSellers';

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const settings = useSettingsStore((s) => s.settings);
  const metrics = useDashboardStore((s) => s.metrics);
  const period = useDashboardStore((s) => s.period);
  const setPeriod = useDashboardStore((s) => s.setPeriod);
  const fetchDashboard = useDashboardStore((s) => s.fetchDashboard);

  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(324);
  const [widgetOrder, setWidgetOrder] = useState<RailWidgetId[]>([
    'payments',
    'alerts',
    'topSellers',
  ]);
  const [draggedWidget, setDraggedWidget] = useState<RailWidgetId | null>(null);
  const isResizingRef = useRef(false);

  const canViewCostAndProfit = hasPermission(user?.role, 'view_cost_price');

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = Math.min(440, Math.max(268, window.innerWidth - e.clientX));
      setRightSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startResizingRail = () => {
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleWidgetDragStart = (id: RailWidgetId) => {
    setDraggedWidget(id);
  };

  const handleWidgetDrop = (targetId: RailWidgetId) => {
    if (!draggedWidget || draggedWidget === targetId) return;
    setWidgetOrder((prev) => {
      const next = [...prev];
      const fromIdx = next.indexOf(draggedWidget);
      const toIdx = next.indexOf(targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      next.splice(fromIdx, 1);
      next.splice(toIdx, 0, draggedWidget);
      return next;
    });
    setDraggedWidget(null);
  };

  if (!metrics) {
    return (
      <div className={styles.mainWorkspace}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading overview...</p>
      </div>
    );
  }

  const maxTrendRev = Math.max(...metrics.salesTrend.map((d) => d.revenue), 100000);
  const svgPointsRevenue = metrics.salesTrend
    .map((pt, idx) => {
      const x = 30 + (idx / Math.max(1, metrics.salesTrend.length - 1)) * 560;
      const y = 135 - (pt.revenue / maxTrendRev) * 105;
      return `${x},${y}`;
    })
    .join(' ');

  const svgPointsProfit = metrics.salesTrend
    .map((pt, idx) => {
      const x = 30 + (idx / Math.max(1, metrics.salesTrend.length - 1)) * 560;
      const y = 135 - (pt.grossProfit / maxTrendRev) * 105;
      return `${x},${y}`;
    })
    .join(' ');

  const channelColors = ['#059669', '#0f172a', '#d97706'];

  const renderRailWidget = (widgetId: RailWidgetId) => {
    if (widgetId === 'payments') {
      return (
        <div
          key="payments"
          className={`${styles.railSection} ${
            draggedWidget === 'payments' ? styles.railSectionDragging : ''
          }`}
          draggable
          onDragStart={() => handleWidgetDragStart('payments')}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleWidgetDrop('payments')}
        >
          <div className={styles.railHeadingRow}>
            <div className={styles.railTitleGroup}>
              <span className={styles.dragGrip} title="Drag to reorder section">
                <GripVertical size={13} />
              </span>
              <span className={styles.railHeading}>SALES BY PAYMENT METHOD</span>
            </div>
            <span className={styles.periodTagSmall}>{metrics.periodLabel}</span>
          </div>

          <p className={styles.railDescription}>
            Revenue collected across payment channels ({metrics.todaysTransactionsCount} orders)
          </p>

          <div className={styles.paymentSummaryBanner}>
            <div>
              <span className={styles.paymentTotalLabel}>Total Collected</span>
              <div className={styles.paymentTotalValue}>
                {formatCurrency(metrics.todaysSalesRevenue, settings.currency, settings.locale)}
              </div>
            </div>
            <span className={styles.paymentOrderCount}>
              {metrics.todaysTransactionsCount} completed
            </span>
          </div>

          <div className={styles.stackedBar} aria-label="Payment channel share bar">
            {metrics.paymentBreakdown.map((pm, idx) => (
              <div
                key={pm.method}
                style={{
                  width: `${Math.max(pm.percentage, 4)}%`,
                  backgroundColor: channelColors[idx % channelColors.length],
                }}
                title={`${pm.method}: ${pm.percentage}% (${formatCurrency(
                  pm.amount,
                  settings.currency,
                  settings.locale
                )})`}
              />
            ))}
          </div>

          <div className={styles.paymentMethodList}>
            {metrics.paymentBreakdown.map((pm, idx) => (
              <div key={pm.method} className={styles.paymentMethodRow}>
                <div className={styles.paymentMethodLeft}>
                  <span
                    className={styles.methodDot}
                    style={{ backgroundColor: channelColors[idx % channelColors.length] }}
                  />
                  <div>
                    <div className={styles.methodName}>{pm.method}</div>
                    <div className={styles.methodSub}>
                      {pm.count} {pm.count === 1 ? 'order' : 'orders'}
                    </div>
                  </div>
                </div>
                <div className={styles.paymentMethodRight}>
                  <span className={styles.methodAmount}>
                    {formatCurrency(pm.amount, settings.currency, settings.locale)}
                  </span>
                  <span className={styles.methodShare}>{pm.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (widgetId === 'alerts') {
      return (
        <div
          key="alerts"
          className={`${styles.railSection} ${
            draggedWidget === 'alerts' ? styles.railSectionDragging : ''
          }`}
          draggable
          onDragStart={() => handleWidgetDragStart('alerts')}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleWidgetDrop('alerts')}
        >
          <div className={styles.railHeadingRow}>
            <div className={styles.railTitleGroup}>
              <span className={styles.dragGrip} title="Drag to reorder section">
                <GripVertical size={13} />
              </span>
              <span className={styles.railHeading}>LOW STOCK & EXPIRY ALERTS</span>
            </div>
            <Link to={PATHS.APP.INVENTORY} className={styles.railLink}>
              Manage
            </Link>
          </div>

          <div className={styles.alertList}>
            {metrics.lowStockProducts.slice(0, 4).map((prod) => (
              <div key={prod.id} className={styles.alertRow}>
                <div style={{ minWidth: 0 }}>
                  <div className={styles.alertName}>{prod.name}</div>
                  <div className={styles.alertSub}>Min threshold: {prod.minStockThreshold}</div>
                </div>
                <StatusIndicator
                  tone={prod.stockQuantity === 0 ? 'danger' : 'warning'}
                  label={`${prod.stockQuantity} ${prod.unit}`}
                  appearance="tag"
                />
              </div>
            ))}
            {metrics.expiringBatches.slice(0, 2).map((bat) => {
              const days = getDaysUntilExpiry(bat.expiryDate);
              return (
                <div key={bat.id} className={styles.alertRow}>
                  <div style={{ minWidth: 0 }}>
                    <div className={styles.alertName}>{bat.productName}</div>
                    <div className={styles.alertSub}>Batch {bat.batchNumber}</div>
                  </div>
                  <StatusIndicator
                    tone={days <= 0 ? 'danger' : 'warning'}
                    label={days <= 0 ? 'Expired' : `${days}d left`}
                    appearance="tag"
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div
        key="topSellers"
        className={`${styles.railSection} ${
          draggedWidget === 'topSellers' ? styles.railSectionDragging : ''
        }`}
        draggable
        onDragStart={() => handleWidgetDragStart('topSellers')}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleWidgetDrop('topSellers')}
      >
        <div className={styles.railHeadingRow}>
          <div className={styles.railTitleGroup}>
            <span className={styles.dragGrip} title="Drag to reorder section">
              <GripVertical size={13} />
            </span>
            <span className={styles.railHeading}>TOP SELLERS</span>
          </div>
          <span className={styles.railMetaText}>By revenue</span>
        </div>

        <div className={styles.alertList}>
          {metrics.topSellingProducts.slice(0, 4).map((item) => (
            <div key={item.productId} className={styles.alertRow}>
              <div style={{ minWidth: 0 }}>
                <div className={styles.alertName}>{item.name}</div>
                <div className={styles.alertSub}>
                  {formatCurrency(item.revenue, settings.currency, settings.locale)}
                </div>
              </div>
              <span className={styles.topSellerQty}>{item.unitsSold} sold</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${styles.pageLayout} ${!rightSidebarOpen ? styles.pageLayoutExpanded : ''}`}
      style={
        rightSidebarOpen
          ? ({ '--right-rail-width': `${rightSidebarWidth}px` } as React.CSSProperties)
          : undefined
      }
    >
      <div className={styles.mainWorkspace}>
        <div className={styles.topBar}>
          <h1 className={styles.pageTitle}>Overview</h1>

          <div className={styles.actionGroup}>
            <div className={styles.periodSelectWrap}>
              <Calendar size={14} className={styles.periodSelectIcon} aria-hidden="true" />
              <select
                aria-label="Filter reporting period"
                className={styles.periodSelect}
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'today' | '7d' | '30d')}
              >
                <option value="today">Today</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">This month</option>
              </select>
              <ChevronDown size={14} className={styles.periodChevron} aria-hidden="true" />
            </div>

            <Button variant="secondary" onClick={() => navigate(PATHS.APP.PRODUCTS)}>
              + Add Product
            </Button>
            <Button variant="primary" onClick={() => navigate(PATHS.APP.POS)}>
              New POS Sale
            </Button>
            <button
              type="button"
              className={`${styles.railToggleBtn} ${
                rightSidebarOpen ? styles.railToggleBtnActive : ''
              }`}
              onClick={() => setRightSidebarOpen((prev) => !prev)}
              title={rightSidebarOpen ? 'Hide right insights sidebar' : 'Show right insights sidebar'}
              aria-label={
                rightSidebarOpen ? 'Hide right insights sidebar' : 'Show right insights sidebar'
              }
            >
              {rightSidebarOpen ? (
                <PanelRightClose size={16} strokeWidth={1.8} />
              ) : (
                <PanelRightOpen size={16} strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>

        {/* KPI Strip with clear Title -> Primary Value -> Summary hierarchy & Info Tooltips */}
        <div className={styles.kpiStrip}>
          <div className={styles.kpiBlock}>
            <div className={styles.kpiHeaderRow}>
              <span className={styles.kpiLabel}>Sales Revenue</span>
              <span
                className={styles.tooltipWrap}
                tabIndex={0}
                aria-label={`Total completed sales revenue for ${metrics.periodLabel}`}
              >
                <Info size={13.5} />
                <span className={styles.tooltipBubble}>
                  Total revenue from {metrics.todaysTransactionsCount} completed POS and delivery
                  orders ({metrics.periodLabel}).
                </span>
              </span>
            </div>
            <span className={styles.kpiValue}>
              {formatCurrency(metrics.todaysSalesRevenue, settings.currency, settings.locale)}
            </span>
            <span className={styles.kpiFootnote}>
              {metrics.todaysTransactionsCount} completed orders
            </span>
          </div>

          {canViewCostAndProfit ? (
            <div className={styles.kpiBlock}>
              <div className={styles.kpiHeaderRow}>
                <span className={styles.kpiLabel}>Gross Profit</span>
                <span
                  className={styles.tooltipWrap}
                  tabIndex={0}
                  aria-label="Estimated gross profit calculation details"
                >
                  <Info size={13.5} />
                  <span className={styles.tooltipBubble}>
                    Estimated gross profit (Sales Revenue minus Cost of Goods Sold:{' '}
                    {formatCurrency(
                      metrics.todaysCostOfGoodsSold,
                      settings.currency,
                      settings.locale
                    )}
                    ) before operating expenses.
                  </span>
                </span>
              </div>
              <span className={styles.kpiValue}>
                {formatCurrency(metrics.estimatedGrossProfit, settings.currency, settings.locale)}
              </span>
              <span className={styles.kpiFootnote}>
                COGS:{' '}
                {formatCurrency(metrics.todaysCostOfGoodsSold, settings.currency, settings.locale)}
              </span>
            </div>
          ) : (
            <div className={styles.kpiBlock}>
              <div className={styles.kpiHeaderRow}>
                <span className={styles.kpiLabel}>Processed Orders</span>
                <span
                  className={styles.tooltipWrap}
                  tabIndex={0}
                  aria-label="Processed orders details"
                >
                  <Info size={13.5} />
                  <span className={styles.tooltipBubble}>
                    Completed counter and delivery transactions for {metrics.periodLabel}.
                  </span>
                </span>
              </div>
              <span className={styles.kpiValue}>{metrics.todaysTransactionsCount}</span>
              <span className={styles.kpiFootnote}>Active counter terminal</span>
            </div>
          )}

          <div className={styles.kpiBlock}>
            <div className={styles.kpiHeaderRow}>
              <span className={styles.kpiLabel}>
                {canViewCostAndProfit ? 'Inventory Valuation' : 'Retail Stock Value'}
              </span>
              <span
                className={styles.tooltipWrap}
                tabIndex={0}
                aria-label="Inventory valuation details"
              >
                <Info size={13.5} />
                <span className={styles.tooltipBubble}>
                  {canViewCostAndProfit
                    ? 'Total landed cost valuation of all current stock on hand.'
                    : 'Total retail selling value of all current stock on hand.'}{' '}
                  ({metrics.inStockSkuCount} of {metrics.activeSkuCount} active SKUs in stock).
                </span>
              </span>
            </div>
            <span className={styles.kpiValue}>
              {formatCompactCurrency(
                canViewCostAndProfit
                  ? metrics.totalInventoryValue
                  : metrics.totalInventoryRetailValue
              )}
            </span>
            <span className={styles.kpiFootnote}>
              {metrics.inStockSkuCount} of {metrics.activeSkuCount} SKUs in stock
            </span>
          </div>

          <div className={styles.kpiBlock}>
            <div className={styles.kpiHeaderRow}>
              <span className={styles.kpiLabel}>Stock & Expiry Alerts</span>
              <span
                className={styles.tooltipWrap}
                tabIndex={0}
                aria-label="Low stock and expiry breakdown"
              >
                <Info size={13.5} />
                <span className={styles.tooltipBubble}>
                  {metrics.lowStockCount} low stock · {metrics.outOfStockCount} out of stock ·{' '}
                  {metrics.expiringSoonCount} perishable batch(es) expiring soon.
                </span>
              </span>
            </div>
            <span className={styles.kpiValue}>
              {metrics.lowStockCount + metrics.outOfStockCount} Low/Out ·{' '}
              {metrics.expiringSoonCount} Expiring
            </span>
            <span className={styles.kpiFootnote}>
              {metrics.lowStockCount} low · {metrics.outOfStockCount} out ·{' '}
              {metrics.expiringSoonCount} batches
            </span>
          </div>
        </div>

        {/* Revenue & Gross Profit Trend Chart */}
        <div className={styles.sectionBlock}>
          <div className={styles.chartBox}>
            <div className={styles.chartLegendRow}>
              <div className={styles.sectionTitleGroup}>
                <h2 className={styles.sectionTitle}>Revenue & Gross Profit</h2>
                <span className={styles.periodTag}>{metrics.periodLabel}</span>
              </div>

              <div className={styles.legendItems}>
                <span className={styles.legendItem}>
                  <span
                    className={styles.legendSwatch}
                    style={{ backgroundColor: 'var(--color-text-primary)' }}
                  />
                  Sales Revenue
                </span>
                {canViewCostAndProfit && (
                  <span className={styles.legendItem}>
                    <span
                      className={styles.legendSwatch}
                      style={{ backgroundColor: 'var(--color-success)' }}
                    />
                    <span>Est. Gross Profit</span>
                    <span
                      className={styles.tooltipWrap}
                      tabIndex={0}
                      aria-label="Estimated gross profit definition"
                    >
                      <Info size={12.5} />
                      <span className={styles.tooltipBubble}>
                        Estimated Gross Profit before operating expenses (Sales Revenue minus COGS).
                      </span>
                    </span>
                  </span>
                )}
              </div>
            </div>

            <svg
              viewBox="0 0 620 165"
              style={{ width: '100%', height: '172px', overflow: 'visible' }}
              role="img"
              aria-label="Revenue and gross profit trend chart"
            >
              {[30, 82, 135].map((y, idx) => (
                <line
                  key={idx}
                  x1="30"
                  y1={y}
                  x2="590"
                  y2={y}
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                />
              ))}
              <polyline
                fill="none"
                stroke="var(--color-text-primary)"
                strokeWidth="2.2"
                points={svgPointsRevenue}
              />
              {canViewCostAndProfit && (
                <polyline
                  fill="none"
                  stroke="var(--color-success)"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  points={svgPointsProfit}
                />
              )}
              {metrics.salesTrend.map((pt, idx) => {
                const x = 30 + (idx / Math.max(1, metrics.salesTrend.length - 1)) * 560;
                const y = 135 - (pt.revenue / maxTrendRev) * 105;
                return (
                  <g key={pt.label}>
                    <circle cx={x} cy={y} r="3.5" fill="var(--color-text-primary)" />
                    <text
                      x={x}
                      y="158"
                      textAnchor="middle"
                      fontSize="11"
                      fill="var(--color-text-muted)"
                    >
                      {pt.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Recent Transactions Table with dedicated Qty column */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2 className={styles.sectionTitle}>Transactions</h2>
              <span className={styles.periodTag}>{metrics.periodLabel}</span>
            </div>
            <Link to={PATHS.APP.ORDERS} className={styles.viewAllLink}>
              View all orders →
            </Link>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th style={{ textAlign: 'right' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ textAlign: 'right' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentSales.map((sale) => {
                  const totalQty = sale.items.reduce((acc, item) => acc + item.quantity, 0);
                  const allItemsTooltip = sale.items
                    .map((i) => `${i.productName} (${i.quantity} ${i.unit})`)
                    .join(', ');

                  return (
                    <tr
                      key={sale.id}
                      onClick={() => navigate(PATHS.APP.ORDERS)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="tabular-nums" style={{ fontWeight: 600 }}>
                        {sale.orderNumber}
                      </td>
                      <td>
                        <div className={styles.customerCell}>
                          <span className={styles.initialsCircle}>{sale.customerInitials}</span>
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
                      <td
                        style={{ color: 'var(--color-text-secondary)' }}
                        title={allItemsTooltip}
                      >
                        <span className={styles.itemPrimaryText}>
                          {sale.items[0]?.productName.slice(0, 28)}
                        </span>
                        {sale.items.length > 1 && (
                          <span className={styles.itemMoreCount}>+{sale.items.length - 1}</span>
                        )}
                      </td>
                      <td
                        className="tabular-nums"
                        style={{
                          textAlign: 'right',
                          fontWeight: 500,
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {totalQty}
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Collapsible & Draggable Right Analytics Sidebar */}
      {rightSidebarOpen && (
        <aside className={styles.rightRail} aria-label="Store Analytics Summary">
          <div
            className={styles.railResizeHandle}
            onMouseDown={startResizingRail}
            title="Drag to resize right sidebar"
            role="separator"
            aria-orientation="vertical"
          />
          {widgetOrder.map((widgetId) => renderRailWidget(widgetId))}
        </aside>
      )}
    </div>
  );
}
