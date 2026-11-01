import { create } from 'zustand';
import {
  supplierApi,
  type CreateSupplierPayload,
} from '@/features/suppliers/services/supplierApi';
import { normalizeApiError } from '@/services/api/apiErrors';
import type { Supplier } from '@/types/common';

interface SupplierState {
  suppliers: Supplier[];
  selectedSupplier: Supplier | null;
  isLoading: boolean;
  error: string | null;
  setSelectedSupplier: (supplier: Supplier | null) => void;
  fetchSuppliers: () => Promise<void>;
  createSupplier: (payload: CreateSupplierPayload) => Promise<Supplier | null>;
  updateSupplier: (
    supplierId: string,
    payload: Partial<CreateSupplierPayload> & { status?: 'active' | 'inactive' }
  ) => Promise<boolean>;
}

export const useSupplierStore = create<SupplierState>((set) => ({
  suppliers: [],
  selectedSupplier: null,
  isLoading: false,
  error: null,

  setSelectedSupplier: (selectedSupplier) => set({ selectedSupplier }),

  fetchSuppliers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await supplierApi.getSuppliers();
      set({ suppliers: res.data, isLoading: false });
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message, isLoading: false });
    }
  },

  createSupplier: async (payload) => {
    set({ error: null });
    try {
      const res = await supplierApi.createSupplier(payload);
      set((state) => ({
        suppliers: [res.data, ...state.suppliers],
        selectedSupplier: res.data,
      }));
      return res.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message });
      return null;
    }
  },

  updateSupplier: async (supplierId, payload) => {
    set({ error: null });
    try {
      const res = await supplierApi.updateSupplier(supplierId, payload);
      set((state) => ({
        suppliers: state.suppliers.map((s) => (s.id === supplierId ? res.data : s)),
        selectedSupplier:
          state.selectedSupplier?.id === supplierId ? res.data : state.selectedSupplier,
      }));
      return true;
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message });
      return false;
    }
  },
}));
