/**
 * Date formatting utilities for enterprise reporting and POS receipts.
 */

export function formatDate(
  dateInput: string | number | Date | null | undefined,
  includeTime: boolean = false
): string {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '—';

  const day = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  if (!includeTime) return day;

  const time = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${day}, ${time}`;
}

export function formatRelativeTime(dateInput: string | number | Date): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(d, false);
}

export function isExpiringSoon(expiryDate: string | Date, daysThreshold: number = 30): boolean {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate).getTime();
  const now = new Date().getTime();
  const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
  return diffDays > 0 && diffDays <= daysThreshold;
}

export function isExpired(expiryDate: string | Date): boolean {
  if (!expiryDate) return false;
  return new Date(expiryDate).getTime() < new Date().getTime();
}

