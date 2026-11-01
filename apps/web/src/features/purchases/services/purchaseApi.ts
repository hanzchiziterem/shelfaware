import { loadMockDb, saveMockDb } from '@/mocks/mockDb';
import { API_CONFIG } from '@/services/api/apiConfig';
import { API_ENDPOINTS, type ApiResponse } from '@/services/api/apiTypes';
import { axiosInstance } from '@/services/api/axiosInstance';
import type { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from '@/types/common';
import { addAmounts, multiplyAmount } from '@/utils/currency';

export interface CreatePurchasePayload {
  supplierId: string;
  expectedDate: string;
  status: PurchaseOrderStatus;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  createdBy: string;
  notes?: string;
  items: Array<{
    productId: string;
    orderedQuantity: number;
    unitCost: number;
    batchNumber?: string;
    expiryDate?: string;
  }>;
}

export const purchaseApi = {
  async getPurchases(): Promise<ApiResponse<PurchaseOrder[]>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.get<ApiResponse<PurchaseOrder[]>>(
        API_ENDPOINTS.PURCHASES.BASE
      );
      return data;
    }

    const db = loadMockDb();
    return {
      success: true,
      data: [...db.purchases],
    };
  },

  /**
   * Creating a purchase order does NOT automatically increase product stock.
   * Inventory increases only when `receivePurchaseOrder` is executed.
   */
  async createPurchaseOrder(payload: CreatePurchasePayload): Promise<ApiResponse<PurchaseOrder>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.post<ApiResponse<PurchaseOrder>>(
        API_ENDPOINTS.PURCHASES.BASE,
        payload
      );
      return data;
    }

    const db = loadMockDb();
    const supplier = db.suppliers.find((s) => s.id === payload.supplierId);
    if (!supplier) {
      throw new Error('Select a valid supplier.');
    }
    if (!payload.items.length) {
      throw new Error('Add at least one product to the purchase order.');
    }

    let totalCost = 0;
    const poItems: PurchaseOrderItem[] = payload.items.map((entry) => {
      const product = db.products.find((p) => p.id === entry.productId);
      if (!product) {
        throw new Error(`Product ${entry.productId} not found.`);
      }
      const subtotal = multiplyAmount(entry.unitCost, entry.orderedQuantity);
      totalCost = addAmounts(totalCost, subtotal);
      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unit: product.unit,
        orderedQuantity: entry.orderedQuantity,
        receivedQuantity: 0,
        unitCost: entry.unitCost,
        subtotal,
        batchNumber: entry.batchNumber,
        expiryDate: entry.expiryDate,
      };
    });

    const newPo: PurchaseOrder = {
      id: `po-${Date.now().toString().slice(-4)}`,
      reference: `PO-2026-0${87 + db.purchases.length}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      status: payload.status,
      paymentStatus: payload.paymentStatus,
      expectedDate: payload.expectedDate,
      createdBy: payload.createdBy,
      createdAt: new Date().toISOString(),
      notes: payload.notes,
      items: poItems,
      totalCost,
    };

    db.purchases.unshift(newPo);
    saveMockDb(db);

    return {
      success: true,
      data: newPo,
    };
  },

  async updatePurchaseStatus(
    purchaseId: string,
    nextStatus: 'ordered' | 'cancelled'
  ): Promise<ApiResponse<PurchaseOrder>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.patch<ApiResponse<PurchaseOrder>>(
        `${API_ENDPOINTS.PURCHASES.BASE}/${purchaseId}/status`,
        { status: nextStatus }
      );
      return data;
    }

    const db = loadMockDb();
    const po = db.purchases.find((p) => p.id === purchaseId);
    if (!po) {
      throw new Error('Purchase order not found.');
    }
    if (po.status === 'received') {
      throw new Error('Cannot modify status of a fully received purchase order.');
    }
    po.status = nextStatus;
    saveMockDb(db);
    return {
      success: true,
      data: { ...po },
    };
  },

  async receivePurchaseOrder(
    purchaseId: string,
    receivedBy: string,
    receivedQuantitiesByProductId?: Record<string, number>,
    discrepancyNotes?: string
  ): Promise<ApiResponse<PurchaseOrder>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.post<ApiResponse<PurchaseOrder>>(
        `${API_ENDPOINTS.PURCHASES.BASE}/${purchaseId}/receive`,
        { receivedBy, receivedQuantitiesByProductId, discrepancyNotes }
      );
      return data;
    }

    const db = loadMockDb();
    const po = db.purchases.find((p) => p.id === purchaseId);
    if (!po) {
      throw new Error('Purchase order not found.');
    }
    if (po.status === 'received') {
      throw new Error('This purchase order has already been fully received into inventory.');
    }
    if (po.status === 'cancelled') {
      throw new Error('Cannot receive a cancelled purchase order.');
    }

    const nowIso = new Date().toISOString();
    let totalNewlyReceivedValue = 0;

    for (const item of po.items) {
      const remainingToReceive = Math.max(0, item.orderedQuantity - item.receivedQuantity);
      const rawDelivered =
        receivedQuantitiesByProductId &&
        typeof receivedQuantitiesByProductId[item.productId] === 'number'
          ? receivedQuantitiesByProductId[item.productId]
          : remainingToReceive;

      const qtyToAdd = Math.max(0, Math.min(remainingToReceive, rawDelivered));
      if (qtyToAdd <= 0) continue;

      item.receivedQuantity += qtyToAdd;
      totalNewlyReceivedValue = addAmounts(
        totalNewlyReceivedValue,
        multiplyAmount(item.unitCost, qtyToAdd)
      );

      const product = db.products.find((p) => p.id === item.productId);
      if (product) {
        const previousBalance = product.stockQuantity;
        product.stockQuantity += qtyToAdd;
        product.costPrice = item.unitCost;
        product.updatedAt = nowIso;

        if (item.expiryDate) {
          product.trackExpiry = true;
          product.expiryDate = item.expiryDate;
          product.batchNumber = item.batchNumber || `BATCH-${po.reference}`;

          db.batches.unshift({
            id: `bat-${Date.now().toString().slice(-4)}-${product.id}`,
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            batchNumber: product.batchNumber,
            expiryDate: item.expiryDate,
            receivedQuantity: qtyToAdd,
            remainingQuantity: qtyToAdd,
            unitCost: item.unitCost,
            unit: product.unit,
            receivedAt: nowIso,
          });
        }

        db.movements.unshift({
          id: `mov-${Date.now().toString().slice(-4)}-${product.id}`,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          type: 'purchase_receive',
          quantityChange: qtyToAdd,
          previousBalance,
          newBalance: product.stockQuantity,
          unit: product.unit,
          reason: `Purchase Order ${po.reference} Received (${item.receivedQuantity}/${item.orderedQuantity})`,
          notes: discrepancyNotes || undefined,
          batchNumber: item.batchNumber,
          performedBy: receivedBy,
          createdAt: nowIso,
        });
      }
    }

    const isFullyReceived = po.items.every(
      (item) => item.receivedQuantity >= item.orderedQuantity
    );
    const hasAnyReceived = po.items.some((item) => item.receivedQuantity > 0);

    if (isFullyReceived) {
      po.status = 'received';
      po.receivedAt = nowIso;
    } else if (hasAnyReceived) {
      po.status = 'partially_received';
      po.receivedAt = nowIso;
    }

    if (discrepancyNotes) {
      po.discrepancyNotes = discrepancyNotes;
    }

    const supplier = db.suppliers.find((s) => s.id === po.supplierId);
    if (supplier && totalNewlyReceivedValue > 0) {
      supplier.totalPurchasesValue += totalNewlyReceivedValue;
      supplier.lastSupplyDate = nowIso;
    }

    saveMockDb(db);
    return {
      success: true,
      data: { ...po, items: po.items.map((i) => ({ ...i })) },
    };
  },
};
