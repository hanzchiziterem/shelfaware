import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  ShoppingCart,
  Truck,
  ArrowUpRight,
} from 'lucide-react';
import { useDashboardStore } from '../../../store/dashboardStore';
import { useProductStore } from '../../../store/productStore';
import { useSalesStore } from '../../../store/salesStore';
import { SalesChart } from '../components/SalesChart';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { formatNaira } from '../../../utils/currency';
import { PATHS } from '../../../router/paths';

export const DashboardPage: React.FC = () => {
  const { overview, weeklySales, paymentBreakdown, topProducts, fetchDashboardData } =
    useDashboardStore();
  const { products, fetchProducts } = useProductStore();
  const { fetchSales } = useSalesStore();

  useEffect(() => {
    fetchDashboardData();
    fetchProducts();
    fetchSales();
  }, [fetchDashboardData, fetchProducts, fetchSales]);

  const lowStockProducts = products.filter(
    (p) => p.isActive && p.currentStock <= p.minStockThreshold
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <PageHeader
        title="Store Operations Overview"
        description="Daily retail sales, inventory health, and register performance."
        actions={
          <div className="flex items-center gap-2">
            <Link to={PATHS.POS}>
              <Button
                size="sm"
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                leftIcon={<ShoppingCart className="w-4 h-4" />}
              >
                Open POS Register
              </Button>
            </Link>
            <Link to={PATHS.PURCHASES}>
              <Button size="sm" variant="outline" leftIcon={<Truck className="w-4 h-4" />}>
                New Stock Order
              </Button>
            </Link>
          </div>
        }
      />

      {/* Dashboard Metrics Hierarchy matching user design guideline (no icons) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Primary Hero Metric Block (Today's Sales bold, Gross Profit & Stock Value below) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-subtle p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Today's Sales
              </span>
            </div>

            <div className="my-1">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-mono block">
                {formatNaira(overview?.todaySales || 0)}
              </span>
            </div>

            <div className="mt-2.5">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                (overview?.salesGrowthPct ?? 0) >= 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {(overview?.salesGrowthPct ?? 0) >= 0 ? '+' : ''}
                {overview?.salesGrowthPct ?? 0}% from yesterday
              </span>
            </div>
          </div>

          {/* Divider line matching wireframe */}
          <div className="border-t border-slate-100 my-5" />

          {/* Bottom row: Gross profit on left, Stock value on right */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Gross Profit
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono mt-0.5 block">
                {formatNaira(overview?.todayGrossProfit || 0)}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
                Margin ~{overview?.profitMarginPct ?? 0}%
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Total Stock Value
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono mt-0.5 block">
                {formatNaira(overview?.totalInventoryValue || 0)}
              </span>
              <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                Retail valuation basis
              </span>
            </div>
          </div>
        </div>

        {/* Right: 3 Stacked Secondary Small Cards (Transactions, Low Stock, Expiring Soon) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          {/* Secondary 1: Transactions / Customers */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-subtle p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Transactions
              </span>
              <span className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5 block">
                {overview?.todayTransactions || 0}
              </span>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
              Live Registers
            </span>
          </div>

          {/* Secondary 2: Low Stock */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-subtle p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Low Stock
              </span>
              <span className="text-2xl font-extrabold text-amber-600 font-mono mt-0.5 block">
                {lowStockProducts.length}
              </span>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Needs Restock
            </span>
          </div>

          {/* Secondary 3: Expiring Soon */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-subtle p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Expiring Soon
              </span>
              <span className="text-2xl font-extrabold text-rose-600 font-mono mt-0.5 block">
                {overview?.expiringStockCount || 0}
              </span>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              &lt; 60 Days
            </span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Sales Trend Chart & Payment Methods Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Revenue & Profit Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Sales Revenue & Profit Performance</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Past 7 days gross revenue compared against cost of goods sold.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Revenue
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Est. Profit
              </span>
            </div>
          </CardHeader>
          <SalesChart data={weeklySales} />
        </Card>

        {/* Payment Methods Breakdown */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle>Payment Tender Breakdown</CardTitle>
            </CardHeader>
            <div className="space-y-3.5 mt-2">
              {paymentBreakdown.map((item) => (
                <div key={item.method} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{item.method}</span>
                    <span className="font-mono text-slate-900 font-bold">
                      {formatNaira(item.value)} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-[var(--radius-control)] border border-slate-200 mt-4 text-[11px] text-slate-600">
            💡 Real-time aggregate breakdown of electronic bank transfers, POS card terminals, and cash register tenders.
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Low Stock Warnings & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Low Stock Watchlist */}
        <Card>
          <CardHeader>
            <CardTitle>Low-Stock Inventory Warnings</CardTitle>
            <Link to={PATHS.INVENTORY} className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
              View all inventory <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>

          <div className="divide-y divide-slate-100">
            {lowStockProducts.slice(0, 4).map((p) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <h5 className="font-semibold text-slate-900">{p.name}</h5>
                  <p className="text-[11px] text-slate-400 font-mono">
                    SKU: {p.sku} | Unit: {p.unit}
                  </p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <Badge variant="danger" size="sm">
                      {p.currentStock} remaining
                    </Badge>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      Min: {p.minStockThreshold}
                    </span>
                  </div>
                  <Link to={PATHS.PURCHASES}>
                    <Button variant="outline" size="xs" leftIcon={<Plus className="w-3 h-3" />}>
                      Order
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            {lowStockProducts.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center">
                All inventory levels are currently healthy!
              </p>
            )}
          </div>
        </Card>

        {/* Top Performing Fast-Movers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Fast-Moving Foodstuff</CardTitle>
            <Link to={PATHS.REPORTS} className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
              Full sales reports <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>

          <div className="divide-y divide-slate-100">
            {topProducts.map((prod) => (
              <div key={prod.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <h5 className="font-semibold text-slate-900">{prod.name}</h5>
                  <p className="text-[11px] text-slate-400">{prod.category}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">{formatNaira(prod.revenue)}</span>
                  <span className="block text-[10px] text-slate-500">
                    {prod.soldCount} units sold
                  </span>
                </div>
              </div>
            ))}

            {topProducts.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center">
                No completed product sales recorded yet.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
