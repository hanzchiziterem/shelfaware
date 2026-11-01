import type { StockStatus, UnitOfMeasure } from '@/types/common';

export function getStockStatus(quantity: number, minThreshold: number): StockStatus {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity <= minThreshold) return 'low_stock';
  return 'in_stock';
}

export function formatUnitLabel(unit: UnitOfMeasure, quantity: number = 1): string {
  const map: Record<UnitOfMeasure, [string, string]> = {
    bag: ['bag', 'bags'],
    carton: ['carton', 'cartons'],
    pack: ['pack', 'packs'],
    piece: ['pc', 'pcs'],
    kg: ['kg', 'kg'],
    gram: ['g', 'g'],
    litre: ['L', 'L'],
    bottle: ['bottle', 'bottles'],
    tin: ['tin', 'tins'],
    crate: ['crate', 'crates'],
  };
  const pair = map[unit] || [unit, `${unit}s`];
  return quantity === 1 ? pair[0] : pair[1];
}

export function getInitials(name: string): string {
  if (!name || !name.trim()) return 'WK';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
