import { beforeEach, describe, expect, it } from 'vitest';
import { posApi } from '@/features/pos/services/posApi';
import { loadMockDb, resetMockDb } from '@/mocks/mockDb';
import { useInventoryStore } from '@/store/inventoryStore';
import { usePosStore } from '@/store/posStore';
import { usePurchaseStore } from '@/store/purchaseStore';
import { useSalesStore } from '@/store/salesStore';

describe('Critical POS, Inventory & Purchase Receiving Invariants', () => {
  beforeEach(() => {
    resetMockDb();
    usePosStore.getState().clearCart();
  });

  it('prevents adding quantities exceeding available stock to the POS cart', () => {
    const db = loadMockDb();
    const rice = db.products.find((p) => p.id === 'prod-101')!;
    const res = usePosStore.getState().addToCart(rice, rice.stockQuantity + 5);
    expect(res.ok).toBe(false);
    expect(usePosStore.getState().cart.length).toBe(0);
  });

  it('completes a POS sale atomically, clears the cart, deducts stock, and prevents duplicate idempotency keys', async () => {
    const dbBefore = loadMockDb();
    const riceBefore = dbBefore.products.find((p) => p.id === 'prod-101')!;
    const initialStock = riceBefore.stockQuantity;

    usePosStore.getState().addToCart(riceBefore, 2);
    usePosStore.getState().setPaymentMethod('cash');
    usePosStore.getState().setCashTendered(160000);

    const totals = usePosStore.getState().getTotals();
    expect(totals.grandTotal).toBe(78500 * 2);
    expect(totals.changeDue).toBe(160000 - 157000);

    const completedSale = await usePosStore.getState().submitSale({
      cashierId: 'usr-01',
      cashierName: 'Adebayo Ogunlesi',
    });

    expect(completedSale).not.toBeNull();
    expect(usePosStore.getState().cart.length).toBe(0);

    const dbAfter = loadMockDb();
    const riceAfter = dbAfter.products.find((p) => p.id === 'prod-101')!;
    expect(riceAfter.stockQuantity).toBe(initialStock - 2);

    // Verify duplicate checkout with the same idempotencyKey is rejected
    await expect(
      posApi.submitCheckout({
        customerId: 'cust-walkin',
        fulfillmentType: 'Walk-in',
        cashierId: 'usr-01',
        cashierName: 'Adebayo Ogunlesi',
        items: [{ productId: 'prod-101', quantity: 1 }],
        paymentMethod: 'cash',
        payments: [{ method: 'cash', amount: 78500 }],
        idempotencyKey: dbAfter.processedIdempotencyKeys[0],
      })
    ).rejects.toThrow(/Duplicate checkout prevented/);
  });

  it('does NOT increase inventory when creating a purchase order, and supports both partial and full receiving', async () => {
    const dbInitial = loadMockDb();
    const garriInitial = dbInitial.products.find((p) => p.id === 'prod-105')!.stockQuantity;

    const createdPo = await usePurchaseStore.getState().createPurchase({
      supplierId: 'sup-04',
      expectedDate: '2026-11-10',
      status: 'ordered',
      paymentStatus: 'unpaid',
      createdBy: 'Adebayo Ogunlesi',
      items: [
        {
          productId: 'prod-105',
          orderedQuantity: 10,
          unitCost: 36500,
        },
      ],
    });

    expect(createdPo).not.toBeNull();
    expect(loadMockDb().products.find((p) => p.id === 'prod-105')!.stockQuantity).toBe(
      garriInitial
    );

    // Receive partial delivery (4 of 10 bags)
    const partialOk = await usePurchaseStore
      .getState()
      .receivePurchase(createdPo!.id, 'Ngozi Eze', { 'prod-105': 4 }, '6 bags pending second truck');
    expect(partialOk).toBe(true);
    expect(loadMockDb().products.find((p) => p.id === 'prod-105')!.stockQuantity).toBe(
      garriInitial + 4
    );
    expect(loadMockDb().purchases.find((p) => p.id === createdPo!.id)!.status).toBe(
      'partially_received'
    );

    // Receive remaining 6 bags
    const finalOk = await usePurchaseStore
      .getState()
      .receivePurchase(createdPo!.id, 'Ngozi Eze');
    expect(finalOk).toBe(true);
    expect(loadMockDb().products.find((p) => p.id === 'prod-105')!.stockQuantity).toBe(
      garriInitial + 10
    );
    expect(loadMockDb().purchases.find((p) => p.id === createdPo!.id)!.status).toBe('received');
  });

  it('records auditable stock movements on manual stock adjustments and restores stock on sale void', async () => {
    await useInventoryStore.getState().fetchInventory();
    const movementsBefore = useInventoryStore.getState().movements.length;

    const adjOk = await useInventoryStore.getState().adjustStock({
      productId: 'prod-106',
      adjustmentType: 'add',
      quantity: 5,
      reason: 'Supplier bonus cartons',
      performedBy: 'Ngozi Eze',
    });

    expect(adjOk).toBe(true);
    expect(useInventoryStore.getState().movements.length).toBe(movementsBefore + 1);

    // Void an existing completed sale and verify stock restoration
    await useSalesStore.getState().fetchSales();
    const riceStockBeforeVoid = loadMockDb().products.find(
      (p) => p.id === 'prod-101'
    )!.stockQuantity;

    const voidOk = await useSalesStore
      .getState()
      .voidOrRefundSale('sale-192541', 'void', 'Customer cancelled', 'Adebayo Ogunlesi');
    expect(voidOk).toBe(true);

    const riceStockAfterVoid = loadMockDb().products.find(
      (p) => p.id === 'prod-101'
    )!.stockQuantity;
    expect(riceStockAfterVoid).toBe(riceStockBeforeVoid + 3);
  });
});
