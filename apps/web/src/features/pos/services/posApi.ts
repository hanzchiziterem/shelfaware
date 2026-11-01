import { loadMockDb, saveMockDb } from '@/mocks/mockDb';
import { API_CONFIG } from '@/services/api/apiConfig';
import { API_ENDPOINTS, type ApiResponse } from '@/services/api/apiTypes';
import { axiosInstance } from '@/services/api/axiosInstance';
import type { OrderFulfillmentType, PaymentMethod, PaymentRecord, Sale, SaleItem } from '@/types/common';
import {
  addAmounts,
  calculateCashChange,
  calculateDiscountAmount,
  calculateTaxAmount,
  multiplyAmount,
  subtractAmounts,
} from '@/utils/currency';
import { getInitials } from '@/utils/formatters';
import { isValidSaleQuantity } from '@/utils/validation';

export interface CheckoutRequest {
  customerId: string;
  fulfillmentType: OrderFulfillmentType;
  cashierId: string;
  cashierName: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  discount?: {
    type: 'fixed' | 'percentage';
    value: number;
  };
  paymentMethod: PaymentMethod;
  payments: PaymentRecord[];
  notes?: string;
  idempotencyKey: string;
}

export const posApi = {
  /**
   * Atomic POS checkout service.
   * Enforces idempotency, validates stock availability and fractional rules,
   * recalculates authoritative subtotals/discounts/taxes, decrements inventory,
   * records stock movement ledger entries, and updates customer spend.
   */
  async submitCheckout(payload: CheckoutRequest): Promise<ApiResponse<Sale>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.post<ApiResponse<Sale>>(
        API_ENDPOINTS.POS.CHECKOUT,
        payload
      );
      return data;
    }

    const db = loadMockDb();

    if (!payload.idempotencyKey) {
      throw new Error('Checkout request requires an idempotencyKey.');
    }

    if (db.processedIdempotencyKeys.includes(payload.idempotencyKey)) {
      throw new Error('Duplicate checkout prevented: This sale has already been processed.');
    }

    if (!payload.items || payload.items.length === 0) {
      throw new Error('Cannot checkout an empty cart.');
    }

    // 1. Validate all items and calculate authoritative line subtotals
    const saleItems: SaleItem[] = [];
    let subtotal = 0;
    let totalUnitsCount = 0;

    for (const reqItem of payload.items) {
      const product = db.products.find((p) => p.id === reqItem.productId);
      if (!product || product.status !== 'active') {
        throw new Error(`Product ${reqItem.productId} is unavailable.`);
      }

      const validation = isValidSaleQuantity(
        reqItem.quantity,
        product.stockQuantity,
        product.allowFractional
      );
      if (!validation.valid) {
        throw new Error(`${product.name}: ${validation.reason}`);
      }

      const lineSubtotal = multiplyAmount(product.sellingPrice, reqItem.quantity);
      subtotal = addAmounts(subtotal, lineSubtotal);
      totalUnitsCount += reqItem.quantity;

      saleItems.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unit: product.unit,
        quantity: reqItem.quantity,
        unitPrice: product.sellingPrice,
        costPrice: product.costPrice,
        subtotal: lineSubtotal,
      });
    }

    const discountAmount = payload.discount
      ? calculateDiscountAmount(subtotal, payload.discount.type, payload.discount.value)
      : 0;

    const taxableAmount = subtractAmounts(subtotal, discountAmount);
    const taxAmount = db.settings.enableTax
      ? calculateTaxAmount(taxableAmount, db.settings.taxPercentage)
      : 0;
    const grandTotal = addAmounts(taxableAmount, taxAmount);

    // 2. Validate payment amounts
    const amountReceived = payload.payments.reduce((acc, p) => addAmounts(acc, p.amount), 0);
    if (amountReceived < grandTotal) {
      throw new Error(
        `Insufficient payment tendered (₦${amountReceived.toLocaleString()} received vs ₦${grandTotal.toLocaleString()} due).`
      );
    }

    const changeGiven = calculateCashChange(grandTotal, amountReceived);

    // 3. Commit stock deductions and movement records atomically
    const nextOrderNumInt = 192542 + db.sales.length;
    const orderNumber = `#${nextOrderNumInt}`;
    const nowIso = new Date().toISOString();

    for (const item of saleItems) {
      const prod = db.products.find((p) => p.id === item.productId)!;
      const previousBalance = prod.stockQuantity;
      prod.stockQuantity = Number((prod.stockQuantity - item.quantity).toFixed(2));
      prod.processedCount += Math.ceil(item.quantity);
      prod.updatedAt = nowIso;

      db.movements.unshift({
        id: `mov-${Date.now().toString().slice(-4)}-${item.productId}`,
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        type: 'sale',
        quantityChange: -item.quantity,
        previousBalance,
        newBalance: prod.stockQuantity,
        unit: prod.unit,
        reason: `POS Sale ${orderNumber}`,
        performedBy: payload.cashierName,
        createdAt: nowIso,
      });
    }

    const customer =
      db.customers.find((c) => c.id === payload.customerId) ||
      db.customers.find((c) => c.isWalkIn) ||
      db.customers[0];

    customer.totalSpent = addAmounts(customer.totalSpent, grandTotal);
    customer.ordersCount += 1;
    customer.lastTransactionDate = nowIso;

    const newSale: Sale = {
      id: `sale-${nextOrderNumInt}`,
      orderNumber,
      customerId: customer.id,
      customerName: customer.name,
      customerInitials: customer.initials || getInitials(customer.name),
      customerEmail: customer.email,
      customerPhone: customer.phone,
      fulfillmentType: payload.fulfillmentType,
      cashierId: payload.cashierId,
      cashierName: payload.cashierName,
      items: saleItems,
      itemsCount: totalUnitsCount,
      subtotal,
      discountAmount,
      taxAmount,
      total: grandTotal,
      paymentMethod: payload.paymentMethod,
      payments: payload.payments,
      amountReceived,
      changeGiven,
      paymentStatus: 'paid',
      status: 'completed',
      notes: payload.notes,
      createdAt: nowIso,
    };

    db.sales.unshift(newSale);
    db.processedIdempotencyKeys.push(payload.idempotencyKey);

    db.notifications.unshift({
      id: `notif-${Date.now().toString().slice(-5)}`,
      title: `Sale ${orderNumber} Completed (₦${grandTotal.toLocaleString()})`,
      message: `${saleItems.length} line item(s) sold to ${customer.name} by ${payload.cashierName}.`,
      category: 'sale',
      severity: 'success',
      isRead: false,
      createdAt: nowIso,
      actionPath: '/orders',
    });

    saveMockDb(db);

    return {
      success: true,
      data: newSale,
    };
  },
};
