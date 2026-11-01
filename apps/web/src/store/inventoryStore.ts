import { create } from 'zustand';
import {
  inventoryApi,
  type RegisterBatchPayload,
  type StockAdjustmentPayload,
} from '@/features/inventory/services/inventoryApi';
import { normalizeApiError } from '@/services/api/apiErrors';
import type { Product, StockBatch, StockMovement, StocktakeSession } from '@/types/common';

interface InventoryState {
  products: Product[];
  movements: StockMovement[];
  batches: StockBatch[];
  stocktakes: StocktakeSession[];
  isLoading: boolean;
  error: string | null;
  fetchInventory: () => Promise<void>;
  adjustStock: (payload: StockAdjustmentPayload) => Promise<boolean>;
  registerBatch: (payload: RegisterBatchPayload) => Promise<boolean>;
  recordStocktake: (payload: {
    countedBy: string;
    notes?: string;
    counts: Array<{ productId: string; countedQuantity: number }>;
  }) => Promise<boolean>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  movements: [],
  batches: [],
  stocktakes: [],
  isLoading: false,
  error: null,

  fetchInventory: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await inventoryApi.getInventoryData();
      set({
        products: res.data.products,
        movements: res.data.movements,
        batches: res.data.batches,
        stocktakes: res.data.stocktakes,
        isLoading: false,
      });
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message, isLoading: false });
    }
  },

  adjustStock: async (payload) => {
    set({ error: null });
    try {
      const res = await inventoryApi.adjustStock(payload);
      set((state) => ({
        products: state.products.map((p) =>
          p.id === res.data.product.id ? res.data.product : p
        ),
        movements: [res.data.movement, ...state.movements],
      }));
      return true;
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message });
      return false;
    }
  },

  registerBatch: async (payload) => {
    set({ error: null });
    try {
      await inventoryApi.registerBatch(payload);
      await get().fetchInventory();
      return true;
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message });
      return false;
    }
  },

  recordStocktake: async (payload) => {
    set({ error: null });
    try {
      await inventoryApi.recordStocktake(payload);
      await get().fetchInventory();
      return true;
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message });
      return false;
    }
  },
}));
