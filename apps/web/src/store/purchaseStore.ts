import { create } from 'zustand';
import { PurchaseOrder } from '../types/domain';
import { purchaseApi } from '../features/purchases/services/purchaseApi';
import { CreatePurchasePayload } from '../services/api/apiTypes';
import { normalizeApiError } from '../services/api/apiErrors';

interface PurchaseState {
  purchases: PurchaseOrder[];
  isLoading: boolean;
  error: string | null;
  selectedPurchase: PurchaseOrder | null;
  isCreateModalOpen: boolean;

  fetchPurchases: () => Promise<void>;
  createPurchase: (payload: CreatePurchasePayload) => Promise<boolean>;
  receivePurchase: (poId: string) => Promise<boolean>;
  setSelectedPurchase: (po: PurchaseOrder | null) => void;
  setCreateModalOpen: (open: boolean) => void;
}

export const usePurchaseStore = create<PurchaseState>((set) => ({
  purchases: [],
  isLoading: false,
  error: null,
  selectedPurchase: null,
  isCreateModalOpen: false,

  fetchPurchases: async () => {
    try {
      set({ isLoading: true, error: null });
      const purchases = await purchaseApi.getPurchases();
      set({ purchases, isLoading: false });
    } catch (err) {
      set({ error: normalizeApiError(err).message, isLoading: false });
    }
  },

  createPurchase: async (payload) => {
    try {
      set({ isLoading: true, error: null });
      const newPO = await purchaseApi.createPurchase(payload);
      set((state) => ({
        purchases: [newPO, ...state.purchases],
        isLoading: false,
        isCreateModalOpen: false,
      }));
      return true;
    } catch (err) {
      set({ error: normalizeApiError(err).message, isLoading: false });
      return false;
    }
  },

  receivePurchase: async (poId) => {
    try {
      set({ isLoading: true, error: null });
      const updated = await purchaseApi.receivePurchase(poId);
      set((state) => ({
        purchases: state.purchases.map((p) => (p.id === poId ? updated : p)),
        selectedPurchase: state.selectedPurchase?.id === poId ? updated : state.selectedPurchase,
        isLoading: false,
      }));
      return true;
    } catch (err) {
      set({ error: normalizeApiError(err).message, isLoading: false });
      return false;
    }
  },

  setSelectedPurchase: (po) => set({ selectedPurchase: po }),
  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
}));

