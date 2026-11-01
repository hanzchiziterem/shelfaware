/**
 * Date formatting and expiry window calculation utilities.
 */

export function formatShortDate(isoDate: string): string {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatFullDateTime(isoDate: string): string {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysUntilExpiry(expiryDate: string, referenceDate: Date = new Date()): number {
  const target = new Date(expiryDate);
  if (Number.isNaN(target.getTime())) return 999;
  const diffMs = target.getTime() - referenceDate.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(
  expiryDate?: string,
  warningDays: number = 30,
  referenceDate: Date = new Date()
): 'expired' | 'expiring_soon' | 'healthy' | 'untracked' {
  if (!expiryDate) return 'untracked';
  const days = getDaysUntilExpiry(expiryDate, referenceDate);
  if (days <= 0) return 'expired';
  if (days <= warningDays) return 'expiring_soon';
  return 'healthy';
}
