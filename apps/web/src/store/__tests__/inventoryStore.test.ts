import { describe, it, expect, beforeEach } from 'vitest';
import { useInventoryStore } from '../inventoryStore';
import { mockStorage } from '../../mocks/mockStorage';

describe('Inventory Adjustments and Movements', () => {
  beforeEach(() => {
    mockStorage.resetToDefaults();
  });

  it('adjusts product stock and creates an auditable movement record', async () => {
    const store = useInventoryStore.getState();
    const products = mockStorage.getProducts();
    const initialProduct = products[0]; // Mama Gold 50kg, currentStock: 24

    const result = await store.adjustStock({
      productId: initialProduct.id,
      quantityChange: 5,
      type: 'adjustment_in',
      reason: 'Physical recount found 5 extra bags',
    });

    expect(result).toBe(true);

    // Verify stock updated in storage
    const updatedProducts = mockStorage.getProducts();
    const targetProduct = updatedProducts.find((p) => p.id === initialProduct.id);
    expect(targetProduct?.currentStock).toBe(29); // 24 + 5

    // Verify movement record was appended
    const movements = mockStorage.getMovements();
    const latestMovement = movements[0];
    expect(latestMovement.productId).toBe(initialProduct.id);
    expect(latestMovement.quantityChange).toBe(5);
    expect(latestMovement.newStock).toBe(29);
    expect(latestMovement.reason).toBe('Physical recount found 5 extra bags');
  });
});

