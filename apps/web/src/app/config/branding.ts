import type { BusinessSettings } from '@/types/common';

/**
 * Immutable platform product name.
 * ShelfAware is the SaaS product identity; individual businesses configure their own
 * store profile (businessName, address, contact details, logo) without renaming ShelfAware.
 */
export const PRODUCT_BRAND_NAME = 'ShelfAware' as const;

export const DEFAULT_BRANDING_SETTINGS: BusinessSettings = {
  businessName: 'Oluwa & Sons Foodstuff Mart',
  productBrandName: PRODUCT_BRAND_NAME,
  businessType: 'Grocery & Foodstuff Retail',
  phone: '+234 803 482 9104',
  email: 'operations@oluwafoodmart.ng',
  address: '42 Daleko Market Road, Mushin, Lagos',
  currency: 'NGN',
  locale: 'en-NG',
  timezone: 'Africa/Lagos',
  dateFormat: 'DD MMM YYYY',
  primaryColor: '#12161f',
  accentColor: '#16a34a',
  fontFamily: 'Plus Jakarta Sans',
  themeMode: 'light',
  tableDensity: 'comfortable',
  borderRadius: 'standard',
  receiptHeader: 'Oluwa & Sons Foodstuff Mart — Wholesalers & Retailers of Quality Grains & Provisions',
  receiptFooter: 'Thank you for shopping with us. Powered by ShelfAware Retail POS.',
  receiptPaperWidth: '80mm',
  defaultPaymentMethod: 'cash',
  taxPercentage: 0,
  enableTax: false,
  defaultLowStockThreshold: 10,
  enableExpiryAlerts: true,
  expiryWarningDays: 30,
};

/**
 * Synchronizes active BusinessSettings into root CSS Custom Properties (`tokens.css`)
 * while preserving ShelfAware as the platform identity.
 */
export function applyBrandingToDocument(settings: BusinessSettings): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  root.setAttribute('data-theme', settings.themeMode);
  root.setAttribute('data-density', settings.tableDensity);

  const fontMap: Record<BusinessSettings['fontFamily'], string> = {
    'Plus Jakarta Sans': "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    'DM Sans': "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    'System Sans': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  };
  root.style.setProperty('--font-family', fontMap[settings.fontFamily] || fontMap['Plus Jakarta Sans']);

  if (settings.themeMode === 'light') {
    root.style.setProperty('--color-primary', settings.primaryColor || '#12161f');
  }
  root.style.setProperty('--color-accent', settings.accentColor || '#16a34a');

  const radiusMap: Record<BusinessSettings['borderRadius'], { sm: string; control: string; card: string }> = {
    sharp: { sm: '2px', control: '3px', card: '4px' },
    standard: { sm: '4px', control: '6px', card: '8px' },
    rounded: { sm: '6px', control: '9px', card: '12px' },
  };
  const r = radiusMap[settings.borderRadius] || radiusMap.standard;
  root.style.setProperty('--radius-sm', r.sm);
  root.style.setProperty('--radius-control', r.control);
  root.style.setProperty('--radius-card', r.card);

  if (settings.businessName) {
    document.title = `${settings.businessName} · ${PRODUCT_BRAND_NAME}`;
  } else {
    document.title = `${PRODUCT_BRAND_NAME} — Retail POS & Inventory Management`;
  }
}
