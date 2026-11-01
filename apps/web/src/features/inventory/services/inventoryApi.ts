import { loadMockDb, saveMockDb } from '@/mocks/mockDb';
import { API_CONFIG } from '@/services/api/apiConfig';
import { API_ENDPOINTS, type ApiResponse } from '@/services/api/apiTypes';
import { axiosInstance } from '@/services/api/axiosInstance';
import type { Product, StockBatch, StockMovement, StocktakeSession } from '@/types/common';

export interface StockAdjustmentPayload {
  productId: string;
  adjustmentType: 'add' | 'remove';
  quantity: number;
  reason: string;
  notes?: string;
  batchNumber?: string;
  performedBy: string;
}

export interface RegisterBatchPayload {
  productId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unitCost: number;
  performedBy: string;
}

export const inventoryApi = {
  async getInventoryData(): Promise<
    ApiResponse<{
      products: Product[];
      movements: StockMovement[];
      batches: StockBatch[];
      stocktakes: StocktakeSession[];
    }>
  > {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.get<
        ApiResponse<{
          products: Product[];
          movements: StockMovement[];
          batches: StockBatch[];
          stocktakes: StocktakeSession[];
        }>
      >(API_ENDPOINTS.INVENTORY.BASE);
      return data;
    }

    const db = loadMockDb();
    return {
      success: true,
      data: {
        products: [...db.products],
        movements: [...db.movements],
        batches: [...db.batches],
        stocktakes: [...db.stocktakes],
      },
    };
  },

  async adjustStock(
    payload: StockAdjustmentPayload
  ): Promise<ApiResponse<{ product: Product; movement: StockMovement }>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.post<
        ApiResponse<{ product: Product; movement: StockMovement }>
      >(API_ENDPOINTS.INVENTORY.ADJUSTMENTS, payload);
      return data;
    }

    if (payload.quantity <= 0) {
      throw new Error('Adjustment quantity must be greater than zero.');
    }

    const db = loadMockDb();
    const product = db.products.find((p) => p.id === payload.productId);
    if (!product) {
      throw new Error('Product not found in inventory.');
    }

    const signedDelta = payload.adjustmentType === 'add' ? payload.quantity : -payload.quantity;
    const newBalance = product.stockQuantity + signedDelta;

    if (newBalance < 0) {
      throw new Error(
        `Cannot deduct ${payload.quantity} ${product.unit}(s). Only ${product.stockQuantity} available.`
      );
    }

    const previousBalance = product.stockQuantity;
    product.stockQuantity = newBalance;
    product.updatedAt = new Date().toISOString();

    const movement: StockMovement = {
      id: `mov-${Date.now().toString().slice(-5)}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: payload.adjustmentType === 'add' ? 'adjustment_add' : 'adjustment_remove',
      quantityChange: signedDelta,
      previousBalance,
      newBalance,
      unit: product.unit,
      reason: payload.reason,
      notes: payload.notes,
      batchNumber: payload.batchNumber,
      performedBy: payload.performedBy,
      createdAt: new Date().toISOString(),
    };

    db.movements.unshift(movement);
    saveMockDb(db);

    return {
      success: true,
      data: {
        product: { ...product },
        movement,
      },
    };
  },

  async registerBatch(payload: RegisterBatchPayload): Promise<ApiResponse<StockBatch>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.post<ApiResponse<StockBatch>>(
        API_ENDPOINTS.INVENTORY.BATCHES,
        payload
      );
      return data;
    }

    const db = loadMockDb();
    const product = db.products.find((p) => p.id === payload.productId);
    if (!product) {
      throw new Error('Product not found.');
    }

    const previousBalance = product.stockQuantity;
    product.stockQuantity += payload.quantity;
    product.trackExpiry = true;
    product.expiryDate = payload.expiryDate;
    product.batchNumber = payload.batchNumber;
    product.updatedAt = new Date().toISOString();

    const batch: StockBatch = {
      id: `bat-${Date.now().toString().slice(-5)}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      batchNumber: payload.batchNumber,
      expiryDate: payload.expiryDate,
      receivedQuantity: payload.quantity,
      remainingQuantity: payload.quantity,
      unitCost: payload.unitCost,
      unit: product.unit,
      receivedAt: new Date().toISOString(),
    };

    const movement: StockMovement = {
      id: `mov-${Date.now().toString().slice(-5)}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: 'purchase_receive',
      quantityChange: payload.quantity,
      previousBalance,
      newBalance: product.stockQuantity,
      unit: product.unit,
      reason: `Batch ${payload.batchNumber} registered`,
      batchNumber: payload.batchNumber,
      performedBy: payload.performedBy,
      createdAt: new Date().toISOString(),
    };

    db.batches.unshift(batch);
    db.movements.unshift(movement);
    saveMockDb(db);

    return {
      success: true,
      data: batch,
    };
  },

  async recordStocktake(payload: {
    countedBy: string;
    notes?: string;
    counts: Array<{ productId: string; countedQuantity: number }>;
  }): Promise<ApiResponse<StocktakeSession>> {
    const db = loadMockDb();
    let discrepanciesFound = 0;

    for (const entry of payload.counts) {
      const product = db.products.find((p) => p.id === entry.productId);
      if (product && product.stockQuantity !== entry.countedQuantity) {
        discrepanciesFound++;
        const delta = entry.countedQuantity - product.stockQuantity;
        const prev = product.stockQuantity;
        product.stockQuantity = entry.countedQuantity;
        product.updatedAt = new Date().toISOString();

        db.movements.unshift({
          id: `mov-${Date.now().toString().slice(-4)}-${product.id}`,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          type: 'stocktake',
          quantityChange: delta,
          previousBalance: prev,
          newBalance: entry.countedQuantity,
          unit: product.unit,
          reason: 'Physical Stocktake Reconciliation',
          notes: payload.notes,
          performedBy: payload.countedBy,
          createdAt: new Date().toISOString(),
        });
      }
    }

    const session: StocktakeSession = {
      id: `stk-${Date.now().toString().slice(-4)}`,
      reference: `CNT-2026-${Math.floor(100 + Math.random() * 899)}`,
      status: 'completed',
      countedBy: payload.countedBy,
      itemsCounted: payload.counts.length,
      discrepanciesFound,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
    };

    db.stocktakes.unshift(session);
    saveMockDb(db);

    return {
      success: true,
      data: session,
    };
  },
};
