import { create } from 'zustand';
import { salesApi } from '@/features/sales/services/salesApi';
import { normalizeApiError } from '@/services/api/apiErrors';
import type { OrderFulfillmentType, PaymentMethod, Sale, SaleStatus } from '@/types/common';

interface SalesState {
  sales: Sale[];
  selectedSale: Sale | null;
  searchQuery: string;
  statusFilter: 'all' | SaleStatus;
  fulfillmentFilter: 'all' | OrderFulfillmentType;
  paymentFilter: 'all' | PaymentMethod;
  isLoading: boolean;
  error: string | null;
  setSearchQuery: (q: string) => void;
  setStatusFilter: (status: 'all' | SaleStatus) => void;
  setFulfillmentFilter: (type: 'all' | OrderFulfillmentType) => void;
  setPaymentFilter: (method: 'all' | PaymentMethod) => void;
  setSelectedSale: (sale: Sale | null) => void;
  fetchSales: () => Promise<void>;
  voidOrRefundSale: (
    saleId: string,
    action: 'void' | 'refund',
    reason: string,
    performedBy: string
  ) => Promise<boolean>;
}

export const useSalesStore = create<SalesState>((set, get) => ({
  sales: [],
  selectedSale: null,
  searchQuery: '',
  statusFilter: 'all',
  fulfillmentFilter: 'all',
  paymentFilter: 'all',
  isLoading: false,
  error: null,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setFulfillmentFilter: (fulfillmentFilter) => set({ fulfillmentFilter }),
  setPaymentFilter: (paymentFilter) => set({ paymentFilter }),
  setSelectedSale: (selectedSale) => set({ selectedSale }),

  fetchSales: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await salesApi.getSales();
      const currentSelected = get().selectedSale;
      const updatedSelected = currentSelected
        ? res.data.find((s) => s.id === currentSelected.id) || null
        : null;
      set({
        sales: res.data,
        selectedSale: updatedSelected,
        isLoading: false,
      });
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message, isLoading: false });
    }
  },

  voidOrRefundSale: async (saleId, action, reason, performedBy) => {
    set({ error: null });
    try {
      const res = await salesApi.voidOrRefundSale(saleId, action, reason, performedBy);
      set((state) => ({
        sales: state.sales.map((s) => (s.id === saleId ? res.data : s)),
        selectedSale: state.selectedSale?.id === saleId ? res.data : state.selectedSale,
      }));
      return true;
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message });
      return false;
    }
  },
}));
