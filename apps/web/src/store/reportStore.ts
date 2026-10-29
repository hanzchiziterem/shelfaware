import { create } from 'zustand';
import { reportApi } from '../features/reports/services/reportApi';

interface ReportState {
  salesSummary: {
    totalRevenue: number;
    orderCount: number;
    averageOrderValue: number;
    sales: any[];
  } | null;
  inventoryValuation: {
    totalCostValue: number;
    totalRetailValue: number;
    potentialGrossProfit: number;
    totalSkus: number;
  } | null;
  isLoading: boolean;

  fetchReports: () => Promise<void>;
}

export const useReportStore = create<ReportState>((set) => ({
  salesSummary: null,
  inventoryValuation: null,
  isLoading: false,

  fetchReports: async () => {
    set({ isLoading: true });
    try {
      const [salesSummary, inventoryValuation] = await Promise.all([
        reportApi.getSalesReport(),
        reportApi.getInventoryValuation(),
      ]);
      set({ salesSummary, inventoryValuation, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));

