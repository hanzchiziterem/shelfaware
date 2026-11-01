import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import type { ReportDateRange } from '@/features/reports/services/reportApi';
import { useReportStore } from '@/store/reportStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';
import styles from '@/styles/SharedPages.module.css';
import { formatCompactCurrency, formatCurrency } from '@/utils/currency';

export function ReportsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const pushToast = useUiStore((s) => s.pushToast);
  const reportData = useReportStore((s) => s.reportData);
  const period = useReportStore((s) => s.period);
  const setPeriod = useReportStore((s) => s.setPeriod);
  const fetchReports = useReportStore((s) => s.fetchReports);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  if (!reportData) {
    return <div className={styles.pageWrap}>Loading financial and inventory reports...</div>;
  }

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Reports & Financial Analytics</h1>
          <p className={styles.pageSubtitle}>
            Showing {reportData.periodLabel} — Clearly separating Sales Revenue, Cost of Goods Sold
            (COGS), Gross Profit, Operating Expenses, and Net Profit.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 'var(--radius-control)',
              overflow: 'hidden',
            }}
            role="group"
            aria-label="Report period filter"
          >
            {(
              [
                { id: 'today', label: 'Today' },
                { id: '7d', label: 'Last 7 Days' },
                { id: '30d', label: 'This Month' },
              ] as Array<{ id: ReportDateRange; label: string }>
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPeriod(opt.id)}
                style={{
                  height: '32px',
                  padding: '0 12px',
                  fontSize: '12.5px',
                  fontWeight: period === opt.id ? 600 : 500,
                  backgroundColor:
                    period === opt.id ? 'var(--color-surface-muted)' : 'var(--color-surface)',
                  color:
                    period === opt.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              window.print();
              pushToast({ title: 'Prepared store financial report for export', tone: 'info' });
            }}
          >
            ↑ Export Report
          </Button>
        </div>
      </div>

      {/* Financial P&L Breakdown: Revenue -> COGS -> Gross Profit -> Operating Expenses -> Net Profit */}
      <div className={styles.statStrip4}>
        <div className={styles.statBox}>
          <span className={styles.statBig}>
            {formatCurrency(reportData.totalSalesRevenue, settings.currency, settings.locale)}
          </span>
          <span className={styles.statLabel}>
            Sales Revenue ({reportData.completedOrdersCount} completed orders)
          </span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statBig}>
            {formatCurrency(reportData.totalCostOfGoodsSold, settings.currency, settings.locale)}
          </span>
          <span className={styles.statLabel}>Cost of Goods Sold (COGS)</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statBig} style={{ color: 'var(--color-success)' }}>
            {formatCurrency(reportData.estimatedGrossProfit, settings.currency, settings.locale)}
          </span>
          <span className={styles.statLabel}>
            Estimated Gross Profit ({reportData.grossMarginPercentage}% gross margin)
          </span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statBig}>
            {formatCurrency(reportData.estimatedNetProfit, settings.currency, settings.locale)}
          </span>
          <span className={styles.statLabel}>
            Estimated Net Profit (after{' '}
            {formatCurrency(
              reportData.estimatedOperatingExpenses,
              settings.currency,
              settings.locale
            )}{' '}
            operating expenses)
          </span>
        </div>
      </div>

      {/* Inventory Valuation Summary */}
      <div className={styles.statStrip3}>
        <div className={styles.statBox}>
          <span className={styles.statBig}>
            {formatCurrency(
              reportData.totalInventoryCostValuation,
              settings.currency,
              settings.locale
            )}
          </span>
          <span className={styles.statLabel}>Current Inventory Cost Valuation</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statBig}>
            {formatCurrency(
              reportData.totalInventoryRetailValuation,
              settings.currency,
              settings.locale
            )}
          </span>
          <span className={styles.statLabel}>Current Inventory Retail Valuation</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statBig}>
            {formatCompactCurrency(
              Math.max(
                0,
                reportData.totalInventoryRetailValuation - reportData.totalInventoryCostValuation
              )
            )}
          </span>
          <span className={styles.statLabel}>Projected Unrealized Margin on Stocked Goods</span>
        </div>
      </div>

      <div>
        <h2 className={styles.sectionHeading} style={{ marginBottom: '12px' }}>
          Sales, COGS & Gross Profit Breakdown by Category ({reportData.periodLabel})
        </h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Items Sold</th>
                <th style={{ textAlign: 'right' }}>Sales Revenue</th>
                <th style={{ textAlign: 'right' }}>Cost of Goods Sold (COGS)</th>
                <th style={{ textAlign: 'right' }}>Estimated Gross Profit</th>
              </tr>
            </thead>
            <tbody>
              {reportData.salesByCategory.map((cat) => (
                <tr key={cat.categoryName}>
                  <td style={{ fontWeight: 500 }}>{cat.categoryName}</td>
                  <td className="tabular-nums" style={{ textAlign: 'right' }}>
                    {cat.unitsSold}
                  </td>
                  <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatCurrency(cat.revenue, settings.currency, settings.locale)}
                  </td>
                  <td className="tabular-nums" style={{ textAlign: 'right' }}>
                    {formatCurrency(cat.cost, settings.currency, settings.locale)}
                  </td>
                  <td
                    className="tabular-nums"
                    style={{
                      textAlign: 'right',
                      fontWeight: 600,
                      color: 'var(--color-success)',
                    }}
                  >
                    {formatCurrency(cat.profit, settings.currency, settings.locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className={styles.sectionHeading} style={{ marginBottom: '12px' }}>
          Product Performance & Remaining Stock ({reportData.periodLabel})
        </h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Qty Sold</th>
                <th style={{ textAlign: 'right' }}>Sales Revenue</th>
                <th style={{ textAlign: 'right' }}>Est. Gross Profit</th>
                <th style={{ textAlign: 'right' }}>Remaining Stock</th>
              </tr>
            </thead>
            <tbody>
              {reportData.productPerformance.slice(0, 12).map((p) => (
                <tr key={p.productId}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{p.sku}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{p.categoryName}</td>
                  <td className="tabular-nums" style={{ textAlign: 'right' }}>
                    {p.unitsSold} {p.unit}
                  </td>
                  <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatCurrency(p.revenue, settings.currency, settings.locale)}
                  </td>
                  <td
                    className="tabular-nums"
                    style={{ textAlign: 'right', color: 'var(--color-success)' }}
                  >
                    {formatCurrency(p.profit, settings.currency, settings.locale)}
                  </td>
                  <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600 }}>
                    {p.currentStock} {p.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
