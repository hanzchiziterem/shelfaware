import { describe, it, expect, beforeEach } from 'vitest';
import { mockStorage } from '../../mocks/mockStorage';
import { posApi } from '../../features/pos/services/posApi';
import { salesApi } from '../../features/sales/services/salesApi';
import { dashboardApi } from '../../features/dashboard/services/dashboardApi';
import { productApi } from '../../features/products/services/productApi';
import { Product } from '../../types/domain';

const testProduct: Product = {
  id: 'prod-integrity-test',
  name: 'Integrity Test Brown Rice 50kg',
  sku: 'TEST-RICE-50',
  categoryId: 'cat-1',
  categoryName: 'Grains & Rice',
  unit: 'bag',
  costPrice: 50000,
  sellingPrice: 65000,
  currentStock: 10,
  minStockThreshold: 2,
  trackExpiry: false,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Data Integrity & Dynamic Relational Cascades', () => {
  beforeEach(() => {
    mockStorage.resetToDefaults();
    const products = mockStorage.getProducts();
    mockStorage.saveProducts([testProduct, ...products]);
  });

  it('cascades stock reduction, stock movement, and customer spend on checkout', async () => {
    const initialCustomer = mockStorage.getCustomers().find((c) => c.id === 'cust-001')!;
    const initialSpent = initialCustomer.totalSpent;
    const initialOrders = initialCustomer.totalOrders;

    // 1. Process sale of 3 bags of testProduct
    const sale = await posApi.processCheckout({
      idempotencyKey: `test-key-${Date.now()}-1`,
      customerId: 'cust-001',
      customerName: initialCustomer.name,
      items: [
        {
          productId: testProduct.id,
          quantity: 3,
          unitPrice: 65000,
        },
      ],
      payments: [{ method: 'bank_transfer', amount: 195000 }],
      amountReceived: 195000,
      changeDue: 0,
    });

    expect(sale).toBeDefined();
    expect(sale.totalAmount).toBe(195000);

    // 2. Verify product currentStock was deducted from 10 to 7
    const updatedProducts = mockStorage.getProducts();
    const targetProd = updatedProducts.find((p) => p.id === testProduct.id)!;
    expect(targetProd.currentStock).toBe(7);

    // 3. Verify auditable StockMovement was logged
    const movements = mockStorage.getMovements();
    const latestMovement = movements[0];
    expect(latestMovement.productId).toBe(testProduct.id);
    expect(latestMovement.type).toBe('sale');
    expect(latestMovement.quantityChange).toBe(-3);
    expect(latestMovement.previousStock).toBe(10);
    expect(latestMovement.newStock).toBe(7);

    // 4. Verify customer aggregates updated
    const updatedCust = mockStorage.getCustomers().find((c) => c.id === 'cust-001')!;
    expect(updatedCust.totalOrders).toBe(initialOrders + 1);
    expect(updatedCust.totalSpent).toBe(initialSpent + 195000);

    // 5. Verify dynamic dashboard overview recalculation
    const overview = await dashboardApi.getOverview();
    expect(overview.todaySales).toBeGreaterThanOrEqual(195000);
    expect(overview.todayGrossProfit).toBeGreaterThan(0);
  });

  it('cascades inventory stock restoration and customer reversal on voidSale', async () => {
    // 1. Make a purchase first
    const sale = await posApi.processCheckout({
      idempotencyKey: `test-key-${Date.now()}-2`,
      customerId: 'cust-001',
      customerName: 'Alhaja Kudirat Balogun',
      items: [
        {
          productId: testProduct.id,
          quantity: 2,
          unitPrice: 65000,
        },
      ],
      payments: [{ method: 'cash', amount: 130000 }],
      amountReceived: 130000,
      changeDue: 0,
    });

    const custAfterSale = mockStorage.getCustomers().find((c) => c.id === 'cust-001')!;
    expect(mockStorage.getProducts().find((p) => p.id === testProduct.id)!.currentStock).toBe(8);

    // 2. Void the sale
    const voided = await salesApi.voidSale(sale.id, 'Customer returned merchandise');
    expect(voided.status).toBe('voided');

    // 3. Verify inventory stock was restored back to 10
    const prodAfterVoid = mockStorage.getProducts().find((p) => p.id === testProduct.id)!;
    expect(prodAfterVoid.currentStock).toBe(10);

    // 4. Verify return movement logged
    const returnMovement = mockStorage.getMovements()[0];
    expect(returnMovement.type).toBe('return');
    expect(returnMovement.quantityChange).toBe(2);
    expect(returnMovement.previousStock).toBe(8);
    expect(returnMovement.newStock).toBe(10);

    // 5. Verify customer total spent was decreased
    const custAfterVoid = mockStorage.getCustomers().find((c) => c.id === 'cust-001')!;
    expect(custAfterVoid.totalSpent).toBe(custAfterSale.totalSpent - 130000);
  });

  it('recalculates inventory value dynamically when products are deleted without crashing sales', async () => {
    const initialOverview = await dashboardApi.getOverview();
    const initialVal = initialOverview.totalInventoryValue;

    // Delete testProduct
    const deleted = await productApi.deleteProduct(testProduct.id);
    expect(deleted).toBe(true);

    // Verify inventory valuation dropped by exactly testProduct's stock * sellingPrice
    const newOverview = await dashboardApi.getOverview();
    expect(newOverview.totalInventoryValue).toBe(initialVal - (10 * 65000));

    // Verify sales API still retrieves historical sales cleanly
    const allSales = await salesApi.getSales();
    expect(allSales.length).toBeGreaterThan(0);
  });

  it('handles empty database states gracefully without NaN or errors', async () => {
    // Clear all sales and products
    mockStorage.saveSales([]);
    mockStorage.saveProducts([]);

    const overview = await dashboardApi.getOverview();
    expect(overview.todaySales).toBe(0);
    expect(overview.todayTransactions).toBe(0);
    expect(overview.todayGrossProfit).toBe(0);
    expect(overview.totalInventoryValue).toBe(0);
    expect(overview.profitMarginPct).toBe(0);
    expect(overview.salesGrowthPct).toBe(0);

    const weekly = await dashboardApi.getWeeklySales();
    expect(weekly.length).toBe(7);
    weekly.forEach((day) => {
      expect(day.revenue).toBe(0);
      expect(day.profit).toBe(0);
    });

    const payments = await dashboardApi.getPaymentBreakdown();
    payments.forEach((p) => {
      expect(p.value).toBe(0);
      expect(p.percentage).toBe(0);
    });

    const top = await dashboardApi.getTopProducts();
    expect(top).toEqual([]);
  });
});
