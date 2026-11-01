/**
 * Centralized monetary calculation and Naira (₦) formatting utilities.
 * Uses integer kobo (minor units) internally for financial arithmetic to prevent
 * IEEE-754 floating-point drift during POS cart and discount calculations.
 */

export function toMinorUnits(amountInMajor: number): number {
  if (!Number.isFinite(amountInMajor)) return 0;
  return Math.round(amountInMajor * 100);
}

export function fromMinorUnits(amountInMinor: number): number {
  if (!Number.isFinite(amountInMinor)) return 0;
  return Math.round(amountInMinor) / 100;
}

export function addAmounts(a: number, b: number): number {
  return fromMinorUnits(toMinorUnits(a) + toMinorUnits(b));
}

export function subtractAmounts(a: number, b: number): number {
  return fromMinorUnits(toMinorUnits(a) - toMinorUnits(b));
}

export function multiplyAmount(unitAmount: number, quantity: number): number {
  if (!Number.isFinite(unitAmount) || !Number.isFinite(quantity) || quantity < 0) {
    return 0;
  }
  return fromMinorUnits(Math.round(toMinorUnits(unitAmount) * quantity));
}

export function calculateDiscountAmount(
  subtotal: number,
  discountType: 'fixed' | 'percentage',
  discountValue: number
): number {
  if (subtotal <= 0 || discountValue <= 0) return 0;
  if (discountType === 'fixed') {
    return Math.min(subtotal, fromMinorUnits(toMinorUnits(discountValue)));
  }
  const boundedPct = Math.min(100, Math.max(0, discountValue));
  const minorDiscount = Math.round((toMinorUnits(subtotal) * boundedPct) / 100);
  return fromMinorUnits(minorDiscount);
}

export function calculateTaxAmount(taxableAmount: number, taxPercentage: number): number {
  if (taxableAmount <= 0 || taxPercentage <= 0) return 0;
  const minorTax = Math.round((toMinorUnits(taxableAmount) * taxPercentage) / 100);
  return fromMinorUnits(minorTax);
}

export function calculateCashChange(totalDue: number, amountTendered: number): number {
  const diff = subtractAmounts(amountTendered, totalDue);
  return diff > 0 ? diff : 0;
}

export function formatCurrency(
  amount: number,
  currency: string = 'NGN',
  locale: string = 'en-NG',
  showDecimals: boolean = false
): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(safeAmount);
  } catch {
    const formatted = safeAmount.toLocaleString('en-US', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    });
    return `₦${formatted}`;
  }
}

export function formatCompactCurrency(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  if (Math.abs(safe) >= 1_000_000) {
    return `₦${(safe / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  }
  if (Math.abs(safe) >= 1_000) {
    return `₦${(safe / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return formatCurrency(safe);
}
