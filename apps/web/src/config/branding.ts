/**
 * White-Label Centralized Branding Configuration.
 * Controls visual identity, typography, currency, and enterprise density.
 * Can be previewed and updated live from Settings without page reload.
 */

export interface BrandingConfig {
  productName: string;
  businessName: string;
  tagline: string;
  logoText: string;
  logoIcon: string;
  brandColor: string;
  sidebarBg: string;
  sidebarText: string;
  fontFamily: string;
  borderRadius: string;
  tableDensity: 'compact' | 'normal' | 'relaxed';
  currency: string;
  currencySymbol: string;
  locale: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
}

export const defaultBranding: BrandingConfig = {
  productName: 'ShelfAware',
  businessName: 'Adeola Foods & Provisions',
  tagline: 'Retail POS & Smart Inventory SaaS',
  logoText: 'ShelfAware',
  logoIcon: 'Store',
  brandColor: '#0F172A',
  sidebarBg: '#090D16',
  sidebarText: '#94A3B8',
  fontFamily: 'Inter',
  borderRadius: '6px',
  tableDensity: 'compact',
  currency: 'NGN',
  currencySymbol: '₦',
  locale: 'en-NG',
  supportEmail: 'support@shelfaware.ng',
  supportPhone: '+234 802 345 6789',
  address: '14 Broad Street, Lagos Island, Lagos State, Nigeria',
};

/**
 * Apply branding tokens to CSS custom variables on the document root.
 */
export function applyBrandingToCss(branding: Partial<BrandingConfig>): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (branding.brandColor) {
    root.style.setProperty('--brand-primary', branding.brandColor);
  }
  if (branding.sidebarBg) {
    root.style.setProperty('--sidebar-bg', branding.sidebarBg);
  }
  if (branding.sidebarText) {
    root.style.setProperty('--sidebar-text', branding.sidebarText);
  }
  if (branding.borderRadius) {
    root.style.setProperty('--radius-control', branding.borderRadius);
  }
  if (branding.fontFamily) {
    root.style.setProperty('--font-family', branding.fontFamily);
  }
  if (branding.tableDensity) {
    const height =
      branding.tableDensity === 'compact'
        ? '36px'
        : branding.tableDensity === 'relaxed'
        ? '50px'
        : '42px';
    root.style.setProperty('--table-row-height', height);
  }
}

