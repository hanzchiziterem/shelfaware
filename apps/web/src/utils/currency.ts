/**
 * Currency utilities for ShelfAware POS & Retail System.
 * Tailored for Nigerian Naira (NGN - ₦) with support for white-label locale overrides.
 */

export interface CurrencyFormatOptions {
  currencySymbol?: string;
  decimals?: number;
  showSymbol?: boolean;
}

/**
 * Format a number or minor unit into a formatted currency string (e.g., ₦12,500.00).
 */
export function formatNaira(
  amount: number | string | null | undefined,
  options: CurrencyFormatOptions = {}
): string {
  const {
    currencySymbol = '₦',
    decimals = 2,
    showSymbol = true,
  } = options;

  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return showSymbol ? `${currencySymbol}0.00` : '0.00';
  }

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Use Intl.NumberFormat for precision and locale formatting
  const formattedNumber = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);

  return showSymbol ? `${currencySymbol}${formattedNumber}` : formattedNumber;
}

/**
 * Safely parse a currency input string (e.g. "₦12,500.50" -> 12500.5)
 */
export function parseCurrency(input: string | number): number {
  if (typeof input === 'number') return isNaN(input) ? 0 : input;
  if (!input) return 0;
  // Strip symbol, commas, and whitespace
  const sanitized = input.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(sanitized);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculate line item total safely
 */
export function calculateLineTotal(quantity: number, unitPrice: number): number {
  const safeQty = Math.max(0, quantity || 0);
  const safePrice = Math.max(0, unitPrice || 0);
  return Math.round(safeQty * safePrice * 100) / 100;
}

/**
 * Calculate discount amount given subtotal and discount config
 */
export function calculateDiscount(
  subtotal: number,
  discountType?: 'percentage' | 'fixed',
  discountValue?: number
): number {
  if (!discountValue || discountValue <= 0) return 0;
  if (discountType === 'percentage') {
    const pct = Math.min(100, Math.max(0, discountValue));
    return Math.round(((subtotal * pct) / 100) * 100) / 100;
  }
  return Math.min(subtotal, discountValue);
}

/**
 * Calculate cash change returned to customer
 */
export function calculateChangeDue(total: number, amountPaid: number): number {
  if (amountPaid < total) return 0;
  return Math.round((amountPaid - total) * 100) / 100;
}

