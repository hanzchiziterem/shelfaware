import { apiClient } from '../../../services/api/axiosInstance';
import { API_CONFIG } from '../../../services/api/apiConfig';
import { Product, ProductCategory } from '../../../types/domain';
import { mockStorage } from '../../../mocks/mockStorage';
import { MOCK_CATEGORIES } from '../../../mocks/products';
import { CreateProductPayload, ProductFilterParams } from '../../../services/api/apiTypes';

export const productApi = {
  async getProducts(params?: ProductFilterParams): Promise<Product[]> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 150));
      let items = mockStorage.getProducts();

      if (params?.search) {
        const q = params.search.toLowerCase();
        items = items.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.barcode?.includes(q)
        );
      }
      if (params?.categoryId) {
        items = items.filter((p) => p.categoryId === params.categoryId);
      }
      if (params?.stockStatus) {
        if (params.stockStatus === 'low') {
          items = items.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStockThreshold);
        } else if (params.stockStatus === 'out') {
          items = items.filter((p) => p.currentStock <= 0);
        } else if (params.stockStatus === 'in_stock') {
          items = items.filter((p) => p.currentStock > p.minStockThreshold);
        }
      }
      return items;
    }
    const res = await apiClient.get<Product[]>('/products', { params });
    return res.data;
  },

  async getCategories(): Promise<ProductCategory[]> {
    if (API_CONFIG.useMockApi) {
      return MOCK_CATEGORIES;
    }
    const res = await apiClient.get<ProductCategory[]>('/categories');
    return res.data;
  },

  async createProduct(payload: CreateProductPayload): Promise<Product> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 200));
      const products = mockStorage.getProducts();
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: payload.name,
        sku: payload.sku,
        barcode: payload.barcode,
        categoryId: payload.categoryId,
        categoryName: payload.categoryName,
        description: payload.description,
        unit: payload.unit as any,
        costPrice: Number(payload.costPrice),
        sellingPrice: Number(payload.sellingPrice),
        currentStock: Number(payload.currentStock),
        minStockThreshold: Number(payload.minStockThreshold),
        supplierId: payload.supplierId,
        trackExpiry: payload.trackExpiry,
        expiryDate: payload.expiryDate,
        batchNumber: payload.batchNumber,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      products.unshift(newProduct);
      mockStorage.saveProducts(products);
      return newProduct;
    }
    const res = await apiClient.post<Product>('/products', payload);
    return res.data;
  },

  async updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 150));
      const products = mockStorage.getProducts();
      const idx = products.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error('Product not found');
      const updated = {
        ...products[idx],
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      products[idx] = updated;
      mockStorage.saveProducts(products);
      return updated;
    }
    const res = await apiClient.patch<Product>(`/products/${id}`, payload);
    return res.data;
  },

  async toggleProductStatus(id: string): Promise<Product> {
    const products = mockStorage.getProducts();
    const item = products.find((p) => p.id === id);
    if (!item) throw new Error('Product not found');
    return this.updateProduct(id, { isActive: !item.isActive });
  },

  /**
   * Endpoint: DELETE /api/v1/products/:id
   */
  async deleteProduct(id: string): Promise<boolean> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 100));
      return mockStorage.deleteProduct(id);
    }
    await apiClient.delete(`/products/${id}`);
    return true;
  },
};

