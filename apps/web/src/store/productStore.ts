import { create } from 'zustand';
import { Product, ProductCategory } from '../types/domain';
import { productApi } from '../features/products/services/productApi';
import { CreateProductPayload, ProductFilterParams } from '../services/api/apiTypes';
import { normalizeApiError } from '../services/api/apiErrors';

interface ProductState {
  products: Product[];
  categories: ProductCategory[];
  isLoading: boolean;
  error: string | null;
  filters: ProductFilterParams;
  selectedProduct: Product | null;
  isCreateModalOpen: boolean;
  isDetailDrawerOpen: boolean;

  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  setFilters: (filters: Partial<ProductFilterParams>) => void;
  createProduct: (payload: CreateProductPayload) => Promise<boolean>;
  updateProduct: (id: string, payload: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  toggleStatus: (id: string) => Promise<void>;
  setSelectedProduct: (product: Product | null) => void;
  setCreateModalOpen: (open: boolean) => void;
  setDetailDrawerOpen: (open: boolean) => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  isLoading: false,
  error: null,
  filters: {
    search: '',
    categoryId: 'all',
    stockStatus: 'all',
  },
  selectedProduct: null,
  isCreateModalOpen: false,
  isDetailDrawerOpen: false,

  fetchProducts: async () => {
    try {
      set({ isLoading: true, error: null });
      const products = await productApi.getProducts(get().filters);
      set({ products, isLoading: false });
    } catch (err) {
      set({ error: normalizeApiError(err).message, isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await productApi.getCategories();
      set({ categories });
    } catch (err) {
      console.error('Fetch categories error:', err);
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
    get().fetchProducts();
  },

  createProduct: async (payload) => {
    try {
      set({ isLoading: true, error: null });
      const newProd = await productApi.createProduct(payload);
      set((state) => ({
        products: [newProd, ...state.products],
        isLoading: false,
        isCreateModalOpen: false,
      }));
      return true;
    } catch (err) {
      set({ error: normalizeApiError(err).message, isLoading: false });
      return false;
    }
  },

  updateProduct: async (id, payload) => {
    try {
      set({ isLoading: true, error: null });
      const updated = await productApi.updateProduct(id, payload);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updated : p)),
        selectedProduct: state.selectedProduct?.id === id ? updated : state.selectedProduct,
        isLoading: false,
      }));
      return true;
    } catch (err) {
      set({ error: normalizeApiError(err).message, isLoading: false });
      return false;
    }
  },

  deleteProduct: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await productApi.deleteProduct(id);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        selectedProduct: state.selectedProduct?.id === id ? null : state.selectedProduct,
        isLoading: false,
      }));
      return true;
    } catch (err) {
      set({ error: normalizeApiError(err).message, isLoading: false });
      return false;
    }
  },

  toggleStatus: async (id) => {
    try {
      const updated = await productApi.toggleProductStatus(id);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updated : p)),
      }));
    } catch (err) {
      set({ error: normalizeApiError(err).message });
    }
  },

  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setDetailDrawerOpen: (open) => set({ isDetailDrawerOpen: open }),
}));

