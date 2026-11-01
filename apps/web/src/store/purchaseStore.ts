import { create } from 'zustand';
import {
  purchaseApi,
  type CreatePurchasePayload,
} from '@/features/purchases/services/purchaseApi';
import { normalizeApiError } from '@/services/api/apiErrors';
import type { PurchaseOrder } from '@/types/common';

interface PurchaseState {
  purchases: PurchaseOrder[];
  selectedPurchase: PurchaseOrder | null;
  isLoading: boolean;
  error: string | null;
  setSelectedPurchase: (po: PurchaseOrder | null) => void;
  fetchPurchases: () => Promise<void>;
  createPurchase: (payload: CreatePurchasePayload) => Promise<PurchaseOrder | null>;
  updatePurchaseStatus: (
    purchaseId: string,
    nextStatus: 'ordered' | 'cancelled'
  ) => Promise<boolean>;
  receivePurchase: (
    purchaseId: string,
    receivedBy: string,
    receivedQuantitiesByProductId?: Record<string, number>,
    discrepancyNotes?: string
  ) => Promise<boolean>;
}

export const usePurchaseStore = create<PurchaseState>((set) => ({
  purchases: [],
  selectedPurchase: null,
  isLoading: false,
  error: null,

  setSelectedPurchase: (selectedPurchase) => set({ selectedPurchase }),

  fetchPurchases: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await purchaseApi.getPurchases();
      set({ purchases: res.data, isLoading: false });
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message, isLoading: false });
    }
  },

  createPurchase: async (payload) => {
    set({ error: null });
    try {
      const res = await purchaseApi.createPurchaseOrder(payload);
      set((state) => ({
        purchases: [res.data, ...state.purchases],
        selectedPurchase: res.data,
      }));
      return res.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message });
      return null;
    }
  },

  updatePurchaseStatus: async (purchaseId, nextStatus) => {
    set({ error: null });
    try {
      const res = await purchaseApi.updatePurchaseStatus(purchaseId, nextStatus);
      set((state) => ({
        purchases: state.purchases.map((p) => (p.id === purchaseId ? res.data : p)),
        selectedPurchase:
          state.selectedPurchase?.id === purchaseId ? res.data : state.selectedPurchase,
      }));
      return true;
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message });
      return false;
    }
  },

  receivePurchase: async (
    purchaseId,
    receivedBy,
    receivedQuantitiesByProductId,
    discrepancyNotes
  ) => {
    set({ error: null });
    try {
      const res = await purchaseApi.receivePurchaseOrder(
        purchaseId,
        receivedBy,
        receivedQuantitiesByProductId,
        discrepancyNotes
      );
      set((state) => ({
        purchases: state.purchases.map((p) => (p.id === purchaseId ? res.data : p)),
        selectedPurchase:
          state.selectedPurchase?.id === purchaseId ? res.data : state.selectedPurchase,
      }));
      return true;
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message });
      return false;
    }
  },
}));
