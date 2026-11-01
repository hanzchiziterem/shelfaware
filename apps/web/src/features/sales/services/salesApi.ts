import { loadMockDb, saveMockDb } from '@/mocks/mockDb';
import { API_CONFIG } from '@/services/api/apiConfig';
import { API_ENDPOINTS, type ApiResponse } from '@/services/api/apiTypes';
import { axiosInstance } from '@/services/api/axiosInstance';
import type { Sale } from '@/types/common';

export const salesApi = {
  async getSales(): Promise<ApiResponse<Sale[]>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.get<ApiResponse<Sale[]>>(API_ENDPOINTS.SALES.BASE);
      return data;
    }

    const db = loadMockDb();
    return {
      success: true,
      data: [...db.sales],
    };
  },

  async voidOrRefundSale(
    saleId: string,
    action: 'void' | 'refund',
    reason: string,
    performedBy: string
  ): Promise<ApiResponse<Sale>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.post<ApiResponse<Sale>>(
        `${API_ENDPOINTS.SALES.BASE}/${saleId}/${action === 'void' ? 'void' : 'refunds'}`,
        { reason }
      );
      return data;
    }

    const db = loadMockDb();
    const sale = db.sales.find((s) => s.id === saleId);
    if (!sale) {
      throw new Error('Sale transaction not found.');
    }
    if (sale.status !== 'completed') {
      throw new Error(`Order ${sale.orderNumber} is already ${sale.status}.`);
    }

    const nowIso = new Date().toISOString();
    sale.status = action === 'void' ? 'cancelled' : 'refunded';
    sale.paymentStatus = action === 'void' ? 'failed' : 'refunded';
    sale.notes = reason ? `${sale.notes ? `${sale.notes} · ` : ''}${reason}` : sale.notes;

    // Restore stock for returned/voided items and create auditable movement records
    for (const item of sale.items) {
      const product = db.products.find((p) => p.id === item.productId);
      if (product) {
        const previousBalance = product.stockQuantity;
        product.stockQuantity = Number((product.stockQuantity + item.quantity).toFixed(2));
        product.updatedAt = nowIso;

        db.movements.unshift({
          id: `mov-${Date.now().toString().slice(-4)}-${item.productId}`,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          type: 'void_return',
          quantityChange: item.quantity,
          previousBalance,
          newBalance: product.stockQuantity,
          unit: product.unit,
          reason: `${action === 'void' ? 'Voided' : 'Refunded'} Order ${sale.orderNumber}: ${reason}`,
          performedBy,
          createdAt: nowIso,
        });
      }
    }

    saveMockDb(db);
    return {
      success: true,
      data: { ...sale },
    };
  },
};
