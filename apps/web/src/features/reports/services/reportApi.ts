import { loadMockDb } from '@/mocks/mockDb';
import { API_CONFIG } from '@/services/api/apiConfig';
import { API_ENDPOINTS, type ApiResponse } from '@/services/api/apiTypes';
import { axiosInstance } from '@/services/api/axiosInstance';

export type ReportDateRange = 'today' | '7d' | '30d';

export interface ComprehensiveReportData {
  periodLabel: string;
  totalSalesRevenue: number;
  totalCostOfGoodsSold: number;
  estimatedGrossProfit: number;
  estimatedOperatingExpenses: number;
  estimatedNetProfit: number;
  grossMarginPercentage: number;
  netMarginPercentage: number;
  completedOrdersCount: number;
  refundedOrCancelledCount: number;
  totalInventoryCostValuation: number;
  totalInventoryRetailValuation: number;
  salesByCategory: Array<{
    categoryName: string;
    revenue: number;
    cost: number;
    profit: number;
    unitsSold: number;
  }>;
  productPerformance: Array<{
    productId: string;
    name: string;
    sku: string;
    unit: string;
    categoryName: string;
    unitsSold: number;
    revenue: number;
    profit: number;
    currentStock: number;
  }>;
  slowMovingProducts: Array<{
    productId: string;
    name: string;
    sku: string;
    unit: string;
    stockQuantity: number;
    tiedUpCapital: number;
  }>;
}

export const reportApi = {
  async getReports(
    period: ReportDateRange = '30d'
  ): Promise<ApiResponse<ComprehensiveReportData>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.get<ApiResponse<ComprehensiveReportData>>(
        API_ENDPOINTS.REPORTS.SALES,
        { params: { period } }
      );
      return data;
    }

    const db = loadMockDb();
    const filterByPeriod = (createdAt: string): boolean => {
      const d = createdAt.slice(0, 10);
      if (period === 'today') return d >= '2026-10-30';
      if (period === '7d') return d >= '2026-10-28';
      return true;
    };

    const periodSales = db.sales.filter((s) => filterByPeriod(s.createdAt));
    const completedSales = periodSales.filter((s) => s.status === 'completed');
    const refundedOrCancelledCount = periodSales.filter((s) => s.status !== 'completed').length;

    let totalSalesRevenue = 0;
    let totalCostOfGoodsSold = 0;

    const categoryMap = new Map<
      string,
      { categoryName: string; revenue: number; cost: number; profit: number; unitsSold: number }
    >();
    const productStatsMap = new Map<
      string,
      {
        productId: string;
        name: string;
        sku: string;
        unit: string;
        categoryName: string;
        unitsSold: number;
        revenue: number;
        profit: number;
        currentStock: number;
      }
    >();

    for (const prod of db.products) {
      productStatsMap.set(prod.id, {
        productId: prod.id,
        name: prod.name,
        sku: prod.sku,
        unit: prod.unit,
        categoryName: prod.categoryName,
        unitsSold: 0,
        revenue: 0,
        profit: 0,
        currentStock: prod.stockQuantity,
      });
    }

    for (const sale of completedSales) {
      totalSalesRevenue += sale.total;
      for (const item of sale.items) {
        const lineCost = item.costPrice * item.quantity;
        const lineProfit = item.subtotal - lineCost;
        totalCostOfGoodsSold += lineCost;

        const product = db.products.find((p) => p.id === item.productId);
        const catName = product?.categoryName || 'Grains & Staples';

        const catEntry = categoryMap.get(catName) || {
          categoryName: catName,
          revenue: 0,
          cost: 0,
          profit: 0,
          unitsSold: 0,
        };
        catEntry.revenue += item.subtotal;
        catEntry.cost += lineCost;
        catEntry.profit += lineProfit;
        catEntry.unitsSold += item.quantity;
        categoryMap.set(catName, catEntry);

        const pEntry = productStatsMap.get(item.productId);
        if (pEntry) {
          pEntry.unitsSold += item.quantity;
          pEntry.revenue += item.subtotal;
          pEntry.profit += lineProfit;
        }
      }
    }

    const estimatedGrossProfit = Math.max(0, totalSalesRevenue - totalCostOfGoodsSold);

    // Store operating expense estimate (coldroom diesel/power, market levy, offloading & logistics)
    const estimatedOperatingExpenses =
      period === 'today' ? 12500 : period === '7d' ? 38000 : 65000;
    const estimatedNetProfit = estimatedGrossProfit - estimatedOperatingExpenses;

    const grossMarginPercentage =
      totalSalesRevenue > 0
        ? Number(((estimatedGrossProfit / totalSalesRevenue) * 100).toFixed(1))
        : 0;
    const netMarginPercentage =
      totalSalesRevenue > 0
        ? Number(((estimatedNetProfit / totalSalesRevenue) * 100).toFixed(1))
        : 0;

    let totalInventoryCostValuation = 0;
    let totalInventoryRetailValuation = 0;
    for (const p of db.products.filter((prod) => prod.status === 'active')) {
      totalInventoryCostValuation += p.costPrice * p.stockQuantity;
      totalInventoryRetailValuation += p.sellingPrice * p.stockQuantity;
    }

    const productPerformance = Array.from(productStatsMap.values()).sort(
      (a, b) => b.revenue - a.revenue
    );

    const slowMovingProducts = Array.from(productStatsMap.values())
      .filter((p) => p.unitsSold <= 2 && p.currentStock > 0)
      .map((p) => {
        const prod = db.products.find((x) => x.id === p.productId);
        return {
          productId: p.productId,
          name: p.name,
          sku: p.sku,
          unit: p.unit,
          stockQuantity: p.currentStock,
          tiedUpCapital: (prod?.costPrice || 0) * p.currentStock,
        };
      })
      .sort((a, b) => b.tiedUpCapital - a.tiedUpCapital);

    const periodLabel =
      period === 'today' ? 'Today' : period === '7d' ? 'Last 7 Days' : 'This Month';

    return {
      success: true,
      data: {
        periodLabel,
        totalSalesRevenue,
        totalCostOfGoodsSold,
        estimatedGrossProfit,
        estimatedOperatingExpenses,
        estimatedNetProfit,
        grossMarginPercentage,
        netMarginPercentage,
        completedOrdersCount: completedSales.length,
        refundedOrCancelledCount,
        totalInventoryCostValuation,
        totalInventoryRetailValuation,
        salesByCategory: Array.from(categoryMap.values()).sort((a, b) => b.revenue - a.revenue),
        productPerformance,
        slowMovingProducts,
      },
    };
  },
};
