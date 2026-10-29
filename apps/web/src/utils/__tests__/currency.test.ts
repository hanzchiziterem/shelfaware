import { describe, it, expect } from 'vitest';
import {
  formatNaira,
  parseCurrency,
  calculateLineTotal,
  calculateDiscount,
  calculateChangeDue,
} from '../currency';

describe('Currency and Financial Calculations', () => {
  it('formats Naira currency with commas and 2 decimals by default', () => {
    expect(formatNaira(85000)).toBe('₦85,000.00');
    expect(formatNaira(1250.5)).toBe('₦1,250.50');
    expect(formatNaira(0)).toBe('₦0.00');
  });

  it('handles null, undefined and NaN safely', () => {
    expect(formatNaira(null)).toBe('₦0.00');
    expect(formatNaira(undefined)).toBe('₦0.00');
    expect(formatNaira(NaN)).toBe('₦0.00');
  });

  it('parses formatted currency strings back to numeric values', () => {
    expect(parseCurrency('₦85,000.00')).toBe(85000);
    expect(parseCurrency('12,500.50')).toBe(12500.5);
    expect(parseCurrency('invalid')).toBe(0);
  });

  it('calculates line item total without floating point inaccuracies', () => {
    expect(calculateLineTotal(3, 15800)).toBe(47400);
    expect(calculateLineTotal(0, 50000)).toBe(0);
    expect(calculateLineTotal(2.5, 3600)).toBe(9000);
  });

  it('calculates fixed and percentage discounts accurately', () => {
    // 10% on ₦100,000 is ₦10,000
    expect(calculateDiscount(100000, 'percentage', 10)).toBe(10000);

    // Fixed ₦5,000 discount on ₦50,000 is ₦5,000
    expect(calculateDiscount(50000, 'fixed', 5000)).toBe(5000);

    // Discount cannot exceed subtotal
    expect(calculateDiscount(2000, 'fixed', 5000)).toBe(2000);

    // 0 or negative discount returns 0
    expect(calculateDiscount(50000, 'fixed', 0)).toBe(0);
    expect(calculateDiscount(50000, 'percentage', -5)).toBe(0);
  });

  it('calculates cash change returned accurately', () => {
    // Total ₦48,800, Paid ₦50,000 -> Change ₦1,200
    expect(calculateChangeDue(48800, 50000)).toBe(1200);

    // Exact payment -> Change ₦0
    expect(calculateChangeDue(75000, 75000)).toBe(0);

    // Underpayment -> Returns 0 change
    expect(calculateChangeDue(50000, 40000)).toBe(0);
  });
});

