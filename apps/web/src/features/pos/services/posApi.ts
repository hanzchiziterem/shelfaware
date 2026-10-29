import { apiClient } from '../../../services/api/axiosInstance';
import { API_CONFIG } from '../../../services/api/apiConfig';
import { Sale } from '../../../types/domain';
import { mockStorage } from '../../../mocks/mockStorage';
import { CheckoutRequest } from '../../../services/api/apiTypes';

/**
 * POS API Service
 * ============================================================
 * BACKEND INTEGRATION INSTRUCTIONS:
 * When connecting to your production backend:
 * 1. Set VITE_USE_MOCK_API=false in .env.local
 * 2. Implement the corresponding REST endpoints on your server:
 *    - POST /api/v1/pos/checkout (payload: CheckoutRequest)
 * ============================================================
 */
export const posApi = {
  /**
   * Endpoint: POST /api/v1/pos/checkout
   */
  async processCheckout(request: CheckoutRequest): Promise<Sale> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 150)); // realistic network delay

      const products = mockStorage.getProducts();
      const sales = mockStorage.getSales();

      // 1. Validate stock availability
      for (const item of request.items) {
        const prod = products.find((p) => p.id === item.productId);
        if (!prod) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        if (prod.currentStock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${prod.name}. Available: ${prod.currentStock}, Requested: ${item.quantity}`
          );
        }
      }

      // 2. Build Sale entity
      const saleId = `sale-${Date.now()}`;
      const txnNumber = `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(
        sales.length + 1
      ).padStart(3, '0')}`;

      const saleItems = request.items.map((it, idx) => {
        const prod = products.find((p) => p.id === it.productId)!;
        return {
          id: `item-${Date.now()}-${idx}`,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          unit: prod.unit,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          subtotal: it.quantity * it.unitPrice,
        };
      });

      const subtotal = saleItems.reduce((acc, cur) => acc + cur.subtotal, 0);
      let discountAmount = 0;
      if (request.discount?.value) {
        if (request.discount.type === 'percentage') {
          discountAmount = (subtotal * request.discount.value) / 100;
        } else {
          discountAmount = request.discount.value;
        }
      }
      const totalAmount = Math.max(0, subtotal - discountAmount);

      const newSale: Sale = {
        id: saleId,
        transactionNumber: txnNumber,
        cashierId: 'usr-001',
        cashierName: 'Adeola Adeleke (Admin)',
        customerId: request.customerId || 'cust-walkin',
        customerName: request.customerName || 'Walk-in Customer',
        customerPhone: request.customerId ? '+234 803 123 4567' : undefined,
        items: saleItems,
        subtotal,
        discountType: request.discount?.type,
        discountValue: request.discount?.value,
        discountAmount,
        taxAmount: 0,
        totalAmount,
        amountReceived: request.amountReceived,
        changeDue: request.changeDue,
        paymentMethod: request.payments[0]?.method || 'cash',
        paymentDetails: request.payments,
        orderType: 'store_pickup',
        status: 'completed',
        notes: request.notes,
        createdAt: new Date().toISOString(),
      };

      // 3. Atomically record sale and cascade stock deduction + customer stats
      return mockStorage.recordSale(newSale);
    }

    const res = await apiClient.post<Sale>('/pos/checkout', request);
    return res.data;
  },
};
