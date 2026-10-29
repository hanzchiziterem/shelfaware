import { describe, it, expect, beforeEach } from 'vitest';
import { usePosStore } from '../posStore';
import { Product } from '../../types/domain';
import { mockStorage } from '../../mocks/mockStorage';

const sampleProduct: Product = {
  id: 'test-rice-01',
  name: 'Mama Gold Rice 50kg',
  sku: 'RICE-MG-50',
  categoryId: 'cat-1',
  categoryName: 'Grains & Rice',
  unit: 'bag',
  costPrice: 70000,
  sellingPrice: 85000,
  currentStock: 10,
  minStockThreshold: 3,
  trackExpiry: false,
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('POS Store Workflow and Business Invariants', () => {
  beforeEach(() => {
    mockStorage.resetToDefaults();
    const prods = mockStorage.getProducts();
    mockStorage.saveProducts([sampleProduct, ...prods]);
    usePosStore.getState().resetPos();
  });

  it('adds an item to cart and calculates subtotal correctly', () => {
    const store = usePosStore.getState();
    store.addToCart(sampleProduct, 2);

    const state = usePosStore.getState();
    expect(state.cart.length).toBe(1);
    expect(state.cart[0].quantity).toBe(2);
    expect(state.cart[0].subtotal).toBe(170000); // 2 * 85,000
    expect(state.getSubtotal()).toBe(170000);
    expect(state.getGrandTotal()).toBe(170000);
  });

  it('never allows cart quantity to exceed available product stock', () => {
    const store = usePosStore.getState();
    // Available stock is 10, attempt to add 15
    store.addToCart(sampleProduct, 15);

    const state = usePosStore.getState();
    expect(state.cart[0].quantity).toBe(10); // Clamped to max stock
  });

  it('recalculates grand total when discount is applied', () => {
    const store = usePosStore.getState();
    store.addToCart(sampleProduct, 1); // ₦85,000

    store.setDiscount('fixed', 5000);
    expect(usePosStore.getState().getDiscountAmount()).toBe(5000);
    expect(usePosStore.getState().getGrandTotal()).toBe(80000);

    store.setDiscount('percentage', 10); // 10% of 85,000 is 8,500
    expect(usePosStore.getState().getDiscountAmount()).toBe(8500);
    expect(usePosStore.getState().getGrandTotal()).toBe(76500);
  });

  it('calculates cash change correctly', () => {
    const store = usePosStore.getState();
    store.addToCart(sampleProduct, 1); // Total ₦85,000
    store.setPaymentMethod('cash');
    store.setAmountReceived(90000);

    expect(usePosStore.getState().getChangeDue()).toBe(5000);
  });

  it('prevents checkout when cart is empty', async () => {
    const store = usePosStore.getState();
    const result = await store.processCheckout();
    expect(result).toBe(false);
    expect(usePosStore.getState().error).toBe('Cart is empty. Add products before checkout.');
  });

  it('prevents cash checkout when amount received is less than total', async () => {
    const store = usePosStore.getState();
    store.addToCart(sampleProduct, 1); // Total ₦85,000
    store.setPaymentMethod('cash');
    store.setAmountReceived(50000); // Underpayment

    const result = await store.processCheckout();
    expect(result).toBe(false);
    expect(usePosStore.getState().error).toContain('Amount received');
  });

  it('successfully completes checkout, clears cart, and creates sale receipt', async () => {
    const store = usePosStore.getState();
    store.addToCart(sampleProduct, 1);
    store.setPaymentMethod('cash');
    store.setAmountReceived(85000);

    const result = await store.processCheckout();
    expect(result).toBe(true);

    const finalState = usePosStore.getState();
    expect(finalState.cart.length).toBe(0); // Cart cleared
    expect(finalState.lastCompletedSale).not.toBeNull();
    expect(finalState.lastCompletedSale?.totalAmount).toBe(85000);
    expect(finalState.isReceiptModalOpen).toBe(true);
  });
});
