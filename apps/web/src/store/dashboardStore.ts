import { create } from 'zustand';
import { dashboardApi } from '../features/dashboard/services/dashboardApi';
import { DashboardOverview } from '../mocks/dashboard';

interface DashboardState {
  overview: DashboardOverview | null;
  salesTrend: Array<{ time: string; sales: number; transactions: number }>;
  weeklySales: Array<{ day: string; revenue: number; profit: number }>;
  paymentBreakdown: Array<{ method: string; value: number; percentage: number; color: string }>;
  topProducts: Array<{ id: string; name: string; category: string; soldCount: number; revenue: number; profit: number }>;
  isLoading: boolean;
  error: string | null;

  fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  overview: null,
  salesTrend: [],
  weeklySales: [],
  paymentBreakdown: [],
  topProducts: [],
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    try {
      set({ isLoading: true, error: null });
      const [overview, salesTrend, weeklySales, paymentBreakdown, topProducts] = await Promise.all([
        dashboardApi.getOverview(),
        dashboardApi.getSalesTrend(),
        dashboardApi.getWeeklySales(),
        dashboardApi.getPaymentBreakdown(),
        dashboardApi.getTopProducts(),
      ]);
      set({
        overview,
        salesTrend,
        weeklySales,
        paymentBreakdown,
        topProducts,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load dashboard', isLoading: false });
    }
  },
}));

