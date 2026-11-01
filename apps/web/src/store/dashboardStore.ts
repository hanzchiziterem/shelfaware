import { create } from 'zustand';
import { dashboardApi, type DashboardMetrics } from '@/features/dashboard/services/dashboardApi';
import { normalizeApiError } from '@/services/api/apiErrors';

interface DashboardState {
  metrics: DashboardMetrics | null;
  period: 'today' | '7d' | '30d';
  isLoading: boolean;
  error: string | null;
  setPeriod: (period: 'today' | '7d' | '30d') => void;
  fetchDashboard: (period?: 'today' | '7d' | '30d') => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  metrics: null,
  period: '30d',
  isLoading: false,
  error: null,

  setPeriod: (period) => {
    set({ period });
    void get().fetchDashboard(period);
  },

  fetchDashboard: async (periodOverride) => {
    const activePeriod = periodOverride ?? get().period;
    set({ isLoading: true, error: null });
    try {
      const res = await dashboardApi.getDashboardData(activePeriod);
      set({ metrics: res.data, isLoading: false });
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message, isLoading: false });
    }
  },
}));
