import { create } from 'zustand';
import {
  productApi,
  type CreateOrUpdateProductPayload,
} from '@/features/products/services/productApi';
import { normalizeApiError } from '@/services/api/apiErrors';
import type { Product, ProductCategory, StockStatus } from '@/types/common';

interface ProductState {
  products: Product[];
  categories: ProductCategory[];
  searchQuery: string;
  selectedCategoryId: string;
  selectedStockStatus: 'all' | StockStatus;
  selectedLifecycleTab: 'all' | 'active' | 'draft' | 'archived';
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  setSearchQuery: (q: string) => void;
  setSelectedCategoryId: (categoryId: string) => void;
  setSelectedStockStatus: (status: 'all' | StockStatus) => void;
  setSelectedLifecycleTab: (tab: 'all' | 'active' | 'draft' | 'archived') => void;
  setSelectedProduct: (product: Product | null) => void;
  fetchProducts: () => Promise<void>;
  createProduct: (payload: CreateOrUpdateProductPayload) => Promise<Product | null>;
  updateProduct: (
    productId: string,
    payload: Partial<CreateOrUpdateProductPayload>
  ) => Promise<Product | null>;
  archiveProducts: (productIds: string[]) => Promise<boolean>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  searchQuery: '',
  selectedCategoryId: 'all',
  selectedStockStatus: 'all',
  selectedLifecycleTab: 'all',
  selectedProduct: null,
  isLoading: false,
  error: null,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategoryId: (selectedCategoryId) => set({ selectedCategoryId }),
  setSelectedStockStatus: (selectedStockStatus) => set({ selectedStockStatus }),
  setSelectedLifecycleTab: (selectedLifecycleTab) => set({ selectedLifecycleTab }),
  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await productApi.getProducts();
      const currentSelected = get().selectedProduct;
      const updatedSelected = currentSelected
        ? res.data.products.find((p) => p.id === currentSelected.id) || res.data.products[0] || null
        : res.data.products[0] || null;

      set({
        products: res.data.products,
        categories: res.data.categories,
        selectedProduct: updatedSelected,
        isLoading: false,
      });
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message, isLoading: false });
    }
  },

  createProduct: async (payload) => {
    set({ error: null });
    try {
      const res = await productApi.createProduct(payload);
      set((state) => ({
        products: [res.data, ...state.products],
        selectedProduct: res.data,
      }));
      return res.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message });
      return null;
    }
  },

  updateProduct: async (productId, payload) => {
    set({ error: null });
    try {
      const res = await productApi.updateProduct(productId, payload);
      set((state) => ({
        products: state.products.map((p) => (p.id === productId ? res.data : p)),
        selectedProduct:
          state.selectedProduct?.id === productId ? res.data : state.selectedProduct,
      }));
      return res.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message });
      return null;
    }
  },

  archiveProducts: async (productIds) => {
    set({ error: null });
    try {
      await productApi.archiveProducts(productIds);
      set((state) => ({
        products: state.products.map((p) =>
          productIds.includes(p.id) ? { ...p, status: 'archived' } : p
        ),
      }));
      return true;
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message });
      return false;
    }
  },
}));
