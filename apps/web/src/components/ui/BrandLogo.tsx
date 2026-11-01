import { PRODUCT_BRAND_NAME } from '@/app/config/branding';
import { useSettingsStore } from '@/store/settingsStore';
import styles from './BrandLogo.module.css';

interface BrandLogoProps {
  variant?: 'sidebar' | 'auth' | 'receipt';
  collapsed?: boolean;
  showStoreName?: boolean;
}

/**
 * Centralized ShelfAware brand & workspace identity component.
 * In the sidebar, displays the ShelfAware mark side-by-side with the active
 * business name (or ShelfAware in Platform Admin), collapsing cleanly to the mark.
 */
export function BrandLogo({
  variant = 'sidebar',
  collapsed = false,
  showStoreName = false,
}: BrandLogoProps) {
  const settings = useSettingsStore((s) => s.settings);

  const displayTitle =
    variant === 'sidebar' && showStoreName && settings.businessName
      ? settings.businessName
      : PRODUCT_BRAND_NAME;

  return (
    <div
      className={`${styles.brandContainer} ${collapsed ? styles.brandCollapsed : ''}`.trim()}
      style={{
        color:
          variant === 'sidebar'
            ? 'var(--color-sidebar-text-active)'
            : 'var(--color-text-primary)',
      }}
      title={displayTitle}
    >
      <span className={styles.logoMarkWrap} aria-hidden="true">
        <svg
          className={styles.markSvg}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Isometric Shelf Cube left face */}
          <path
            d="M5 9.5L17 4.5V13.5L5 18.5V9.5Z"
            fill={variant === 'sidebar' ? '#FFFFFF' : '#101935'}
          />
          <path
            d="M5 20.5L17 15.5V24.5L5 29.5V20.5Z"
            fill={variant === 'sidebar' ? '#CBD5E1' : '#1E293B'}
          />
          {/* Teal right shelf matrix */}
          <path d="M19 4.5L27 8V15L19 11.5V4.5Z" fill="#14B8A6" />
          <path d="M19 13.5L27 17V24L19 20.5V13.5Z" fill="#0D9488" />
          <path d="M19 22.5L27 26V31.5L19 28V22.5Z" fill="#2DD4BF" />
          {/* Signal nodes depicting speed & execution */}
          <line x1="27" y1="11.5" x2="32" y2="11.5" stroke="#2DD4BF" strokeWidth="1.8" />
          <circle cx="33" cy="11.5" r="1.8" fill="#2DD4BF" />
          <line x1="27" y1="20.5" x2="32" y2="20.5" stroke="#14B8A6" strokeWidth="1.8" />
          <circle cx="33" cy="20.5" r="1.8" fill="#14B8A6" />
          <line x1="27" y1="28.5" x2="32" y2="28.5" stroke="#2DD4BF" strokeWidth="1.8" />
          <circle cx="33" cy="28.5" r="1.8" fill="#2DD4BF" />
        </svg>
      </span>
      {!collapsed && <span className={styles.businessName}>{displayTitle}</span>}
    </div>
  );
}
