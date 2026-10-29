import { apiClient } from '../../../services/api/axiosInstance';
import { API_CONFIG } from '../../../services/api/apiConfig';
import { mockStorage } from '../../../mocks/mockStorage';
import { DashboardOverview } from '../../../mocks/dashboard';

/**
 * Dashboard API Service
 * ============================================================
 * BACKEND INTEGRATION INSTRUCTIONS:
 * When connecting to your production backend:
 * 1. Set VITE_USE_MOCK_API=false in .env.local
 * 2. Implement the corresponding REST endpoints on your server:
 *    - GET /api/v1/dashboard/overview
 *    - GET /api/v1/dashboard/sales-trend
 *    - GET /api/v1/dashboard/weekly-sales
 *    - GET /api/v1/dashboard/payments
 *    - GET /api/v1/dashboard/top-products
 * ============================================================
 */
export const dashboardApi = {
  /**
   * Endpoint: GET /api/v1/dashboard/overview
   */
  async getOverview(): Promise<DashboardOverview> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 100));
      const sales = mockStorage.getSales();
      const products = mockStorage.getProducts();

      const completedSales = sales.filter((s) => s.status === 'completed');
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      const twoDaysAgo = now - 48 * 60 * 60 * 1000;

      // Filter sales belonging to today (past 24h)
      const todaySalesList = completedSales.filter((s) => {
        const time = new Date(s.createdAt).getTime();
        return time >= oneDayAgo;
      });

      // Filter sales belonging to yesterday (24-48h ago) for dynamic growth %
      const yesterdaySalesList = completedSales.filter((s) => {
        const time = new Date(s.createdAt).getTime();
        return time >= twoDaysAgo && time < oneDayAgo;
      });

      const todaySales = todaySalesList.reduce((acc, s) => acc + s.totalAmount, 0);
      const yesterdaySales = yesterdaySalesList.reduce((acc, s) => acc + s.totalAmount, 0);

      // Dynamic Gross Profit = Revenue - COGS
      let todayCOGS = 0;
      todaySalesList.forEach((sale) => {
        sale.items.forEach((item) => {
          const prod = products.find((p) => p.id === item.productId);
          const cost = prod ? prod.costPrice : item.unitPrice * 0.8;
          todayCOGS += item.quantity * cost;
        });
      });
      const todayGrossProfit = Math.max(0, todaySales - todayCOGS);

      // Dynamic inventory aggregates
      const totalInventoryValue = products.reduce((acc, p) => acc + p.currentStock * p.sellingPrice, 0);
      const lowStockCount = products.filter((p) => p.isActive && p.currentStock <= p.minStockThreshold).length;
      const expiringStockCount = products.filter(
        (p) =>
          p.trackExpiry &&
          p.expiryDate &&
          new Date(p.expiryDate).getTime() - now < 1000 * 60 * 60 * 24 * 60
      ).length;

      const salesGrowthPct =
        yesterdaySales > 0
          ? Number((((todaySales - yesterdaySales) / yesterdaySales) * 100).toFixed(1))
          : todaySales > 0
          ? 100
          : 0;

      const profitMarginPct =
        todaySales > 0 ? Number(((todayGrossProfit / todaySales) * 100).toFixed(1)) : 0;

      return {
        todaySales,
        todayTransactions: todaySalesList.length,
        todayGrossProfit,
        totalInventoryValue,
        lowStockCount,
        expiringStockCount,
        salesGrowthPct,
        profitMarginPct,
      };
    }
    const res = await apiClient.get<DashboardOverview>('/dashboard/overview');
    return res.data;
  },

  /**
   * Endpoint: GET /api/v1/dashboard/sales-trend
   */
  async getSalesTrend(): Promise<Array<{ time: string; sales: number; transactions: number }>> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 80));
      const sales = mockStorage.getSales();
      const completedToday = sales.filter((s) => {
        const isCompleted = s.status === 'completed';
        const isRecent = Date.now() - new Date(s.createdAt).getTime() <= 24 * 60 * 60 * 1000;
        return isCompleted && isRecent;
      });

      const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
      return hours.map((hourStr) => {
        const targetH = parseInt(hourStr.slice(0, 2), 10);
        const matchingSales = completedToday.filter((s) => {
          const d = new Date(s.createdAt);
          const saleH = d.getHours();
          return Math.abs(saleH - targetH) <= 1;
        });

        const salesSum = matchingSales.reduce((acc, s) => acc + s.totalAmount, 0);
        return {
          time: hourStr,
          sales: salesSum,
          transactions: matchingSales.length,
        };
      });
    }
    const res = await apiClient.get('/dashboard/sales-trend');
    return res.data;
  },

  /**
   * Endpoint: GET /api/v1/dashboard/weekly-sales
   */
  async getWeeklySales(): Promise<Array<{ day: string; revenue: number; profit: number }>> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 80));
      const sales = mockStorage.getSales();
      const products = mockStorage.getProducts();
      const completedSales = sales.filter((s) => s.status === 'completed');

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const past7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
        return {
          dateStr: d.toISOString().slice(0, 10),
          dayName: dayNames[d.getDay()],
        };
      });

      return past7Days.map(({ dateStr, dayName }) => {
        const daySales = completedSales.filter((s) => s.createdAt.slice(0, 10) === dateStr);
        const revenue = daySales.reduce((sum, s) => sum + s.totalAmount, 0);

        let cogs = 0;
        daySales.forEach((s) => {
          s.items.forEach((item) => {
            const p = products.find((prod) => prod.id === item.productId);
            cogs += item.quantity * (p ? p.costPrice : item.unitPrice * 0.8);
          });
        });

        const profit = Math.max(0, revenue - cogs);
        return {
          day: dayName,
          revenue,
          profit,
        };
      });
    }
    const res = await apiClient.get('/dashboard/weekly-sales');
    return res.data;
  },

  /**
   * Endpoint: GET /api/v1/dashboard/payments
   */
  async getPaymentBreakdown(): Promise<
    Array<{ method: string; value: number; percentage: number; color: string }>
  > {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 80));
      const sales = mockStorage.getSales();
      const completedSales = sales.filter((s) => s.status === 'completed');

      let cash = 0;
      let transfer = 0;
      let card = 0;

      completedSales.forEach((s) => {
        if (s.paymentDetails && s.paymentDetails.length > 0) {
          s.paymentDetails.forEach((p) => {
            if (p.method === 'cash') cash += p.amount;
            else if (p.method === 'bank_transfer') transfer += p.amount;
            else card += p.amount;
          });
        } else {
          if (s.paymentMethod === 'cash') cash += s.totalAmount;
          else if (s.paymentMethod === 'bank_transfer') transfer += s.totalAmount;
          else card += s.totalAmount;
        }
      });

      const total = cash + transfer + card;
      return [
        {
          method: 'Cash',
          value: cash,
          percentage: total > 0 ? Number(((cash / total) * 100).toFixed(1)) : 0,
          color: '#10B981',
        },
        {
          method: 'Bank Transfer',
          value: transfer,
          percentage: total > 0 ? Number(((transfer / total) * 100).toFixed(1)) : 0,
          color: '#3B82F6',
        },
        {
          method: 'POS Card',
          value: card,
          percentage: total > 0 ? Number(((card / total) * 100).toFixed(1)) : 0,
          color: '#6366F1',
        },
      ];
    }
    const res = await apiClient.get('/dashboard/payments');
    return res.data;
  },

  /**
   * Endpoint: GET /api/v1/dashboard/top-products
   */
  async getTopProducts(): Promise<
    Array<{ id: string; name: string; category: string; soldCount: number; revenue: number; profit: number }>
  > {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 80));
      const sales = mockStorage.getSales();
      const products = mockStorage.getProducts();
      const completedSales = sales.filter((s) => s.status === 'completed');

      const productMap = new Map<
        string,
        { id: string; name: string; category: string; soldCount: number; revenue: number; profit: number }
      >();

      completedSales.forEach((s) => {
        s.items.forEach((item) => {
          const existing = productMap.get(item.productId) || {
            id: item.productId,
            name: item.productName,
            category: 'Groceries',
            soldCount: 0,
            revenue: 0,
            profit: 0,
          };
          const prod = products.find((p) => p.id === item.productId);
          const cost = prod ? prod.costPrice : item.unitPrice * 0.8;
          const profitOnItem = (item.unitPrice - cost) * item.quantity;

          existing.category = prod ? prod.categoryName : existing.category;
          existing.soldCount += item.quantity;
          existing.revenue += item.subtotal;
          existing.profit += profitOnItem;
          productMap.set(item.productId, existing);
        });
      });

      return Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    }
    const res = await apiClient.get('/dashboard/top-products');
    return res.data;
  },
};
