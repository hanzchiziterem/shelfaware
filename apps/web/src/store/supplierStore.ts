import { create } from 'zustand';
import { Supplier } from '../types/domain';
import { supplierApi } from '../features/suppliers/services/supplierApi';

interface SupplierState {
  suppliers: Supplier[];
  isLoading: boolean;
  isCreateModalOpen: boolean;
  selectedSupplier: Supplier | null;

  fetchSuppliers: () => Promise<void>;
  createSupplier: (data: Omit<Supplier, 'id' | 'totalPurchases' | 'balancePayable' | 'createdAt'>) => Promise<boolean>;
  setSelectedSupplier: (supplier: Supplier | null) => void;
  setCreateModalOpen: (open: boolean) => void;
}

export const useSupplierStore = create<SupplierState>((set) => ({
  suppliers: [],
  isLoading: false,
  isCreateModalOpen: false,
  selectedSupplier: null,

  fetchSuppliers: async () => {
    set({ isLoading: true });
    try {
      const suppliers = await supplierApi.getSuppliers();
      set({ suppliers, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createSupplier: async (data) => {
    try {
      const created = await supplierApi.createSupplier(data);
      set((state) => ({
        suppliers: [created, ...state.suppliers],
        isCreateModalOpen: false,
      }));
      return true;
    } catch {
      return false;
    }
  },

  setSelectedSupplier: (supplier) => set({ selectedSupplier: supplier }),
  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
}));

