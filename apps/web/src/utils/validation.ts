/**
 * Validation utilities for Nigerian phone numbers, quantities, and barcodes.
 */

export function isValidNigerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, '');
  return /^(\+?234|0)[789][01]\d{8}$/.test(cleaned);
}

export function isValidSaleQuantity(
  requestedQty: number,
  availableStock: number,
  allowFractional: boolean
): { valid: boolean; reason?: string } {
  if (!Number.isFinite(requestedQty) || requestedQty <= 0) {
    return { valid: false, reason: 'Quantity must be greater than zero.' };
  }
  if (!allowFractional && !Number.isInteger(requestedQty)) {
    return { valid: false, reason: 'This item is sold in whole units only.' };
  }
  if (requestedQty > availableStock) {
    return { valid: false, reason: `Cannot exceed available stock (${availableStock}).` };
  }
  return { valid: true };
}
