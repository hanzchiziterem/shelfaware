import { create } from 'zustand';
import { StockMovement, StockBatch } from '../types/domain';
import { inventoryApi } from '../features/inventory/services/inventoryApi';
import { StockAdjustmentPayload } from '../services/api/apiTypes';
import { normalizeApiError } from '../services/api/apiErrors';

interface InventoryState {
  movements: StockMovement[];
  batches: StockBatch[];
  isLoading: boolean;
  error: string | null;
  isAdjustModalOpen: boolean;

  fetchMovements: () => Promise<void>;
  fetchBatches: () => Promise<void>;
  adjustStock: (payload: StockAdjustmentPayload) => Promise<boolean>;
  setAdjustModalOpen: (open: boolean) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  movements: [],
  batches: [],
  isLoading: false,
  error: null,
  isAdjustModalOpen: false,

  fetchMovements: async () => {
    try {
      set({ isLoading: true, error: null });
      const movements = await inventoryApi.getMovements();
      set({ movements, isLoading: false });
    } catch (err) {
      set({ error: normalizeApiError(err).message, isLoading: false });
    }
  },

  fetchBatches: async () => {
    try {
      set({ isLoading: true, error: null });
      const batches = await inventoryApi.getBatches();
      set({ batches, isLoading: false });
    } catch (err) {
      set({ error: normalizeApiError(err).message, isLoading: false });
    }
  },

  adjustStock: async (payload) => {
    try {
      set({ isLoading: true, error: null });
      const newMovement = await inventoryApi.adjustStock(payload);
      set((state) => ({
        movements: [newMovement, ...state.movements],
        isLoading: false,
        isAdjustModalOpen: false,
      }));
      return true;
    } catch (err) {
      set({ error: normalizeApiError(err).message, isLoading: false });
      return false;
    }
  },

  setAdjustModalOpen: (open) => set({ isAdjustModalOpen: open }),
}));

