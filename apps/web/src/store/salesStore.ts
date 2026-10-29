import { create } from 'zustand';
import { Sale } from '../types/domain';
import { salesApi } from '../features/sales/services/salesApi';
import { posApi } from '../features/pos/services/posApi';
import { mockStorage } from '../mocks/mockStorage';
import { normalizeApiError } from '../services/api/apiErrors';

interface SalesState {
  sales: Sale[];
  isLoading: boolean;
  error: string | null;
  selectedSale: Sale | null;
  isDetailDrawerOpen: boolean;
  filters: {
    search: string;
    status: string;
    paymentMethod: string;
  };

  fetchSales: () => Promise<void>;
  setFilters: (filters: Partial<{ search: string; status: string; paymentMethod: string }>) => void;
  setSelectedSale: (sale: Sale | null) => void;
  setDetailDrawerOpen: (open: boolean) => void;
  voidSale: (id: string, reason: string) => Promise<boolean>;
  deleteSale: (id: string) => Promise<boolean>;
  simulateSale: () => Promise<Sale | null>;
}

export const useSalesStore = create<SalesState>((set, get) => ({
  sales: [],
  isLoading: false,
  error: null,
  selectedSale: null,
  isDetailDrawerOpen: false,
  filters: {
    search: '',
    status: 'all',
    paymentMethod: 'all',
  },

  fetchSales: async () => {
    try {
      set({ isLoading: true, error: null });
      const sales = await salesApi.getSales(get().filters);
      set({ sales, isLoading: false });
    } catch (err) {
      set({ error: normalizeApiError(err).message, isLoading: false });
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
    get().fetchSales();
  },

  setSelectedSale: (sale) => set({ selectedSale: sale }),
  setDetailDrawerOpen: (open) => set({ isDetailDrawerOpen: open }),

  voidSale: async (id: string, reason: string) => {
    try {
      set({ isLoading: true, error: null });
      const updated = await salesApi.voidSale(id, reason);
      set((state) => ({
        sales: state.sales.map((s) => (s.id === id ? updated : s)),
        selectedSale: state.selectedSale?.id === id ? updated : state.selectedSale,
        isLoading: false,
      }));
      return true;
    } catch (err) {
      set({ error: normalizeApiError(err).message, isLoading: false });
      return false;
    }
  },

  deleteSale: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await salesApi.deleteSale(id);
      set((state) => ({
        sales: state.sales.filter((s) => s.id !== id),
        selectedSale: state.selectedSale?.id === id ? null : state.selectedSale,
        isLoading: false,
      }));
      return true;
    } catch (err) {
      set({ error: normalizeApiError(err).message, isLoading: false });
      return false;
    }
  },

  simulateSale: async () => {
    try {
      set({ isLoading: true, error: null });
      const products = mockStorage.getProducts().filter((p) => p.currentStock > 1);
      if (products.length === 0) {
        throw new Error('No products with available stock to simulate a purchase.');
      }

      // Pick 1 or 2 products
      const p1 = products[Math.floor(Math.random() * products.length)];
      const items = [{ productId: p1.id, quantity: 1, unitPrice: p1.sellingPrice }];

      if (products.length > 1 && Math.random() > 0.4) {
        const remaining = products.filter((p) => p.id !== p1.id);
        const p2 = remaining[Math.floor(Math.random() * remaining.length)];
        items.push({ productId: p2.id, quantity: 1, unitPrice: p2.sellingPrice });
      }

      const total = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
      const methods: Array<'cash' | 'card' | 'bank_transfer'> = ['cash', 'card', 'bank_transfer'];
      const chosenMethod = methods[Math.floor(Math.random() * methods.length)];

      const customers = [
        { id: 'cust-walkin', name: 'Walk-in Customer' },
        { id: 'cust-001', name: 'Alhaja Kudirat Balogun' },
        { id: 'cust-003', name: 'Mrs. Blessing Adeleke' },
        { id: 'cust-002', name: 'Chief Emeka Okonkwo' },
      ];
      const chosenCust = customers[Math.floor(Math.random() * customers.length)];

      const newSale = await posApi.processCheckout({
        idempotencyKey: `sim-${Date.now()}`,
        items,
        customerId: chosenCust.id,
        customerName: chosenCust.name,
        payments: [{ method: chosenMethod, amount: total }],
        amountReceived: total,
        changeDue: 0,
        notes: 'Simulated live retail order',
      });

      set((state) => ({
        sales: [newSale, ...state.sales],
        isLoading: false,
      }));

      return newSale;
    } catch (err) {
      set({ error: normalizeApiError(err).message, isLoading: false });
      return null;
    }
  },
}));
