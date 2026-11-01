import { loadMockDb } from '@/mocks/mockDb';
import { API_CONFIG } from '@/services/api/apiConfig';
import { API_ENDPOINTS, type ApiResponse } from '@/services/api/apiTypes';
import { axiosInstance } from '@/services/api/axiosInstance';
import type { Product, Sale, StockBatch, StockMovement } from '@/types/common';
import { getDaysUntilExpiry } from '@/utils/dates';
import { getStockStatus } from '@/utils/formatters';

export interface DashboardMetrics {
  periodLabel: string;
  todaysSalesRevenue: number;
  todaysTransactionsCount: number;
  todaysCostOfGoodsSold: number;
  estimatedGrossProfit: number;
  totalInventoryValue: number;
  totalInventoryRetailValue: number;
  activeSkuCount: number;
  inStockSkuCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringSoonCount: number;
  salesTrend: Array<{
    label: string;
    revenue: number;
    grossProfit: number;
    orders: number;
  }>;
  paymentBreakdown: Array<{
    method: string;
    amount: number;
    percentage: number;
    count: number;
  }>;
  topSellingProducts: Array<{
    productId: string;
    name: string;
    categoryName: string;
    unitsSold: number;
    revenue: number;
  }>;
  recentSales: Sale[];
  lowStockProducts: Product[];
  expiringBatches: StockBatch[];
  recentMovements: StockMovement[];
}

export const dashboardApi = {
  async getDashboardData(
    period: 'today' | '7d' | '30d' = '30d'
  ): Promise<ApiResponse<DashboardMetrics>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.get<ApiResponse<DashboardMetrics>>(
        API_ENDPOINTS.DASHBOARD.OVERVIEW,
        { params: { period } }
      );
      return data;
    }

    const db = loadMockDb();

    // Filter sales consistently according to the selected date range
    const filterByPeriod = (createdAt: string): boolean => {
      const d = createdAt.slice(0, 10);
      if (period === 'today') {
        // Include demo "today" (2026-10-30) and any newly created runtime sales
        return d >= '2026-10-30';
      }
      if (period === '7d') {
        return d >= '2026-10-28';
      }
      return true;
    };

    const periodSales = db.sales.filter((s) => filterByPeriod(s.createdAt));
    const completedSales = periodSales.filter((s) => s.status === 'completed');

    let todaysSalesRevenue = 0;
    let todaysCostOfGoodsSold = 0;
    for (const sale of completedSales) {
      todaysSalesRevenue += sale.total;
      for (const item of sale.items) {
        todaysCostOfGoodsSold += item.costPrice * item.quantity;
      }
    }

    const estimatedGrossProfit = Math.max(0, todaysSalesRevenue - todaysCostOfGoodsSold);

    let totalInventoryValue = 0;
    let totalInventoryRetailValue = 0;
    let inStockSkuCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const activeProducts = db.products.filter((p) => p.status === 'active');
    for (const product of activeProducts) {
      totalInventoryValue += product.costPrice * product.stockQuantity;
      totalInventoryRetailValue += product.sellingPrice * product.stockQuantity;
      if (product.stockQuantity > 0) inStockSkuCount++;
      const status = getStockStatus(product.stockQuantity, product.minStockThreshold);
      if (status === 'low_stock') lowStockCount++;
      if (status === 'out_of_stock') outOfStockCount++;
    }

    const expiringBatches = db.batches.filter(
      (b) =>
        b.remainingQuantity > 0 &&
        getDaysUntilExpiry(b.expiryDate) <= db.settings.expiryWarningDays
    );

    // Aggregate payment breakdown from completed sales in the selected period
    const methodTotals: Record<string, { amount: number; count: number }> = {
      'Bank Transfer': { amount: 0, count: 0 },
      'POS Card': { amount: 0, count: 0 },
      Cash: { amount: 0, count: 0 },
    };

    for (const sale of completedSales) {
      const label =
        sale.paymentMethod === 'bank_transfer'
          ? 'Bank Transfer'
          : sale.paymentMethod === 'card'
          ? 'POS Card'
          : 'Cash';
      if (!methodTotals[label]) methodTotals[label] = { amount: 0, count: 0 };
      methodTotals[label].amount += sale.total;
      methodTotals[label].count += 1;
    }

    const grandTotal = todaysSalesRevenue || 1;
    const paymentBreakdown = Object.entries(methodTotals).map(([method, stats]) => ({
      method,
      amount: stats.amount,
      count: stats.count,
      percentage: todaysSalesRevenue > 0 ? Math.round((stats.amount / grandTotal) * 100) : 0,
    }));

    // Aggregate top products from completed sales in the selected period
    const productSalesMap = new Map<
      string,
      { productId: string; name: string; categoryName: string; unitsSold: number; revenue: number }
    >();

    for (const sale of completedSales) {
      for (const item of sale.items) {
        const existing = productSalesMap.get(item.productId);
        const prod = db.products.find((p) => p.id === item.productId);
        if (existing) {
          existing.unitsSold += item.quantity;
          existing.revenue += item.subtotal;
        } else {
          productSalesMap.set(item.productId, {
            productId: item.productId,
            name: item.productName,
            categoryName: prod?.categoryName || 'Foodstuff',
            unitsSold: item.quantity,
            revenue: item.subtotal,
          });
        }
      }
    }

    const topSellingProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const fullTrend = [
      { label: '25 Oct', revenue: 175000, grossProfit: 18250, orders: 14 },
      { label: '26 Oct', revenue: 218400, grossProfit: 24100, orders: 18 },
      { label: '27 Oct', revenue: 141000, grossProfit: 14750, orders: 12 },
      { label: '28 Oct', revenue: 245100, grossProfit: 28900, orders: 19 },
      { label: '29 Oct', revenue: 506000, grossProfit: 53400, orders: 27 },
      { label: '30 Oct', revenue: 543000, grossProfit: 59800, orders: 31 },
    ];

    const salesTrend =
      period === 'today'
        ? [
            { label: '08:00', revenue: 84000, grossProfit: 9200, orders: 4 },
            { label: '10:00', revenue: 192000, grossProfit: 21500, orders: 9 },
            { label: '12:00', revenue: 145000, grossProfit: 15800, orders: 11 },
            { label: '14:00', revenue: 122000, grossProfit: 13300, orders: 7 },
          ]
        : period === '7d'
        ? fullTrend.slice(-4)
        : fullTrend;

    const lowStockProducts = activeProducts
      .filter((p) => p.stockQuantity <= p.minStockThreshold)
      .sort((a, b) => a.stockQuantity - b.stockQuantity);

    const periodLabel =
      period === 'today' ? 'Today' : period === '7d' ? 'Last 7 days' : 'This month';

    return {
      success: true,
      data: {
        periodLabel,
        todaysSalesRevenue,
        todaysTransactionsCount: completedSales.length,
        todaysCostOfGoodsSold,
        estimatedGrossProfit,
        totalInventoryValue,
        totalInventoryRetailValue,
        activeSkuCount: activeProducts.length,
        inStockSkuCount,
        lowStockCount,
        outOfStockCount,
        expiringSoonCount: expiringBatches.length,
        salesTrend,
        paymentBreakdown,
        topSellingProducts,
        recentSales: periodSales.slice(0, 7),
        lowStockProducts,
        expiringBatches,
        recentMovements: db.movements.slice(0, 6),
      },
    };
  },
};
