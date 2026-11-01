import { create } from 'zustand';
import {
  reportApi,
  type ComprehensiveReportData,
  type ReportDateRange,
} from '@/features/reports/services/reportApi';
import { normalizeApiError } from '@/services/api/apiErrors';

interface ReportState {
  reportData: ComprehensiveReportData | null;
  period: ReportDateRange;
  isLoading: boolean;
  error: string | null;
  setPeriod: (period: ReportDateRange) => void;
  fetchReports: (period?: ReportDateRange) => Promise<void>;
}

export const useReportStore = create<ReportState>((set, get) => ({
  reportData: null,
  period: '30d',
  isLoading: false,
  error: null,

  setPeriod: (period) => {
    set({ period });
    void get().fetchReports(period);
  },

  fetchReports: async (periodOverride) => {
    const activePeriod = periodOverride ?? get().period;
    set({ isLoading: true, error: null });
    try {
      const res = await reportApi.getReports(activePeriod);
      set({ reportData: res.data, isLoading: false });
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message, isLoading: false });
    }
  },
}));
