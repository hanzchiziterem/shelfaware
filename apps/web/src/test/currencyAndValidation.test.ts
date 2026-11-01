import { describe, expect, it } from 'vitest';
import {
  addAmounts,
  calculateCashChange,
  calculateDiscountAmount,
  formatCompactCurrency,
  formatCurrency,
  multiplyAmount,
} from '@/utils/currency';
import { getStockStatus } from '@/utils/formatters';
import { isValidNigerianPhone, isValidSaleQuantity } from '@/utils/validation';

describe('Financial & Currency Calculations (Kobo-safe)', () => {
  it('avoids floating-point drift when adding and multiplying decimal prices', () => {
    expect(addAmounts(0.1, 0.2)).toBe(0.3);
    expect(multiplyAmount(2100, 1.5)).toBe(3150);
  });

  it('calculates fixed and percentage discounts accurately and caps at subtotal', () => {
    expect(calculateDiscountAmount(100000, 'fixed', 2500)).toBe(2500);
    expect(calculateDiscountAmount(100000, 'fixed', 250000)).toBe(100000);
    expect(calculateDiscountAmount(50000, 'percentage', 10)).toBe(5000);
  });

  it('calculates cash change due accurately', () => {
    expect(calculateCashChange(14200, 15000)).toBe(800);
    expect(calculateCashChange(15000, 14200)).toBe(0);
  });

  it('formats Naira currency and compact currency labels', () => {
    expect(formatCurrency(78500)).toContain('78,500');
    expect(formatCompactCurrency(1900000)).toBe('₦1.9M');
  });
});

describe('Inventory & POS Quantity Validation Rules', () => {
  it('enforces whole units vs fractional units per product configuration', () => {
    // 50kg Rice bag does not allow fractional quantities
    const bagCheck = isValidSaleQuantity(1.5, 20, false);
    expect(bagCheck.valid).toBe(false);

    // Measured beans (kg) allows fractional quantities
    const kgCheck = isValidSaleQuantity(1.5, 20, true);
    expect(kgCheck.valid).toBe(true);
  });

  it('rejects quantities exceeding available stock', () => {
    const overStock = isValidSaleQuantity(15, 10, false);
    expect(overStock.valid).toBe(false);
    expect(overStock.reason).toContain('Cannot exceed available stock');
  });

  it('computes stock status thresholds accurately', () => {
    expect(getStockStatus(0, 10)).toBe('out_of_stock');
    expect(getStockStatus(8, 10)).toBe('low_stock');
    expect(getStockStatus(25, 10)).toBe('in_stock');
  });

  it('validates Nigerian phone numbers', () => {
    expect(isValidNigerianPhone('+234 803 482 9104')).toBe(true);
    expect(isValidNigerianPhone('08095528103')).toBe(true);
    expect(isValidNigerianPhone('12345')).toBe(false);
  });
});
