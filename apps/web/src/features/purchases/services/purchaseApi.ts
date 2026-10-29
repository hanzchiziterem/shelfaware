import { apiClient } from '../../../services/api/axiosInstance';
import { API_CONFIG } from '../../../services/api/apiConfig';
import { PurchaseOrder } from '../../../types/domain';
import { mockStorage } from '../../../mocks/mockStorage';
import { CreatePurchasePayload } from '../../../services/api/apiTypes';

export const purchaseApi = {
  async getPurchases(): Promise<PurchaseOrder[]> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 150));
      return mockStorage.getPurchases();
    }
    const res = await apiClient.get<PurchaseOrder[]>('/purchases');
    return res.data;
  },

  async createPurchase(payload: CreatePurchasePayload): Promise<PurchaseOrder> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 200));
      const purchases = mockStorage.getPurchases();
      const suppliers = mockStorage.getSuppliers();
      const products = mockStorage.getProducts();

      const supplier = suppliers.find((s) => s.id === payload.supplierId);
      const items = payload.items.map((it, idx) => {
        const prod = products.find((p) => p.id === it.productId);
        return {
          id: `poi-${Date.now()}-${idx}`,
          productId: it.productId,
          productName: prod ? prod.name : 'Unknown Product',
          sku: prod ? prod.sku : 'SKU-UNKNOWN',
          unit: prod ? prod.unit : ('bag' as const),
          orderedQuantity: Number(it.orderedQuantity),
          receivedQuantity: 0,
          unitCost: Number(it.unitCost),
          totalCost: Number(it.orderedQuantity) * Number(it.unitCost),
        };
      });

      const totalCost = items.reduce((acc, cur) => acc + cur.totalCost, 0);
      const newPO: PurchaseOrder = {
        id: `po-${Date.now()}`,
        poNumber: `PO-${new Date().getFullYear()}-${String(purchases.length + 1).padStart(3, '0')}`,
        supplierId: payload.supplierId,
        supplierName: supplier ? supplier.name : 'Direct Supplier',
        items,
        totalCost,
        status: 'draft',
        paymentStatus: 'unpaid',
        expectedDate: payload.expectedDate,
        notes: payload.notes,
        createdAt: new Date().toISOString(),
      };

      purchases.unshift(newPO);
      mockStorage.savePurchases(purchases);
      return newPO;
    }
    const res = await apiClient.post<PurchaseOrder>('/purchases', payload);
    return res.data;
  },

  async receivePurchase(poId: string): Promise<PurchaseOrder> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 200));
      return mockStorage.receivePurchase(poId);
    }
    const res = await apiClient.post<PurchaseOrder>(`/purchases/${poId}/receive`);
    return res.data;
  },
};

