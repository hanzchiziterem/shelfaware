import { loadMockDb, saveMockDb } from '@/mocks/mockDb';
import { API_CONFIG } from '@/services/api/apiConfig';
import { API_ENDPOINTS, type ApiResponse } from '@/services/api/apiTypes';
import { axiosInstance } from '@/services/api/axiosInstance';
import type { Product, ProductCategory, UnitOfMeasure } from '@/types/common';

export interface CreateOrUpdateProductPayload {
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  description: string;
  unit: UnitOfMeasure;
  allowFractional: boolean;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockThreshold: number;
  supplierId?: string;
  trackExpiry: boolean;
  expiryDate?: string;
  batchNumber?: string;
  status?: 'active' | 'draft' | 'archived';
}

export const productApi = {
  async getProducts(): Promise<ApiResponse<{ products: Product[]; categories: ProductCategory[] }>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.get<
        ApiResponse<{ products: Product[]; categories: ProductCategory[] }>
      >(API_ENDPOINTS.PRODUCTS.BASE);
      return data;
    }

    const db = loadMockDb();
    return {
      success: true,
      data: {
        products: [...db.products],
        categories: [...db.categories],
      },
    };
  },

  async createProduct(payload: CreateOrUpdateProductPayload): Promise<ApiResponse<Product>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.post<ApiResponse<Product>>(
        API_ENDPOINTS.PRODUCTS.BASE,
        payload
      );
      return data;
    }

    const db = loadMockDb();
    const category = db.categories.find((c) => c.id === payload.categoryId);
    const supplier = db.suppliers.find((s) => s.id === payload.supplierId);

    const newProduct: Product = {
      id: `prod-${Date.now().toString().slice(-5)}`,
      name: payload.name.trim(),
      sku: payload.sku.trim().toUpperCase(),
      barcode: payload.barcode.trim() || `6151100${Math.floor(100000 + Math.random() * 900000)}`,
      categoryId: payload.categoryId,
      categoryName: category?.name || 'Grains & Staples',
      description: payload.description.trim(),
      unit: payload.unit,
      allowFractional: payload.allowFractional,
      costPrice: Number(payload.costPrice),
      sellingPrice: Number(payload.sellingPrice),
      stockQuantity: Number(payload.stockQuantity),
      processedCount: 0,
      minStockThreshold: Number(payload.minStockThreshold),
      supplierId: payload.supplierId,
      supplierName: supplier?.name,
      trackExpiry: payload.trackExpiry,
      expiryDate: payload.trackExpiry ? payload.expiryDate : undefined,
      batchNumber: payload.trackExpiry ? payload.batchNumber : undefined,
      status: payload.status || 'active',
      updatedAt: new Date().toISOString(),
    };

    db.products.unshift(newProduct);

    if (newProduct.trackExpiry && newProduct.expiryDate && newProduct.stockQuantity > 0) {
      db.batches.unshift({
        id: `bat-${Date.now().toString().slice(-4)}`,
        productId: newProduct.id,
        productName: newProduct.name,
        sku: newProduct.sku,
        batchNumber: newProduct.batchNumber || `BATCH-${newProduct.sku}`,
        expiryDate: newProduct.expiryDate,
        receivedQuantity: newProduct.stockQuantity,
        remainingQuantity: newProduct.stockQuantity,
        unitCost: newProduct.costPrice,
        unit: newProduct.unit,
        receivedAt: new Date().toISOString(),
      });
    }

    saveMockDb(db);
    return {
      success: true,
      data: newProduct,
    };
  },

  async updateProduct(
    productId: string,
    payload: Partial<CreateOrUpdateProductPayload>
  ): Promise<ApiResponse<Product>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.patch<ApiResponse<Product>>(
        `${API_ENDPOINTS.PRODUCTS.BASE}/${productId}`,
        payload
      );
      return data;
    }

    const db = loadMockDb();
    const index = db.products.findIndex((p) => p.id === productId);
    if (index === -1) {
      throw new Error('Product not found.');
    }

    const current = db.products[index];
    const category = payload.categoryId
      ? db.categories.find((c) => c.id === payload.categoryId)
      : undefined;

    const updated: Product = {
      ...current,
      ...payload,
      categoryName: category ? category.name : current.categoryName,
      updatedAt: new Date().toISOString(),
    };

    db.products[index] = updated;
    saveMockDb(db);

    return {
      success: true,
      data: updated,
    };
  },

  async archiveProducts(productIds: string[]): Promise<ApiResponse<{ archivedIds: string[] }>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.post<ApiResponse<{ archivedIds: string[] }>>(
        `${API_ENDPOINTS.PRODUCTS.BASE}/archive`,
        { productIds }
      );
      return data;
    }

    const db = loadMockDb();
    for (const p of db.products) {
      if (productIds.includes(p.id)) {
        p.status = 'archived';
        p.updatedAt = new Date().toISOString();
      }
    }
    saveMockDb(db);
    return {
      success: true,
      data: { archivedIds: productIds },
    };
  },
};
