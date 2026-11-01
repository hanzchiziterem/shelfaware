import { Outlet } from 'react-router-dom';
import { PRODUCT_BRAND_NAME } from '@/app/config/branding';
import { ToastContainer } from '@/components/ui/ToastContainer';
import styles from './AuthLayout.module.css';

export function AuthLayout() {
  return (
    <div className={styles.authContainer}>
      <aside className={styles.brandPanel} aria-hidden="true" />

      <div className={styles.formWorkspace}>
        <div className={styles.formCard}>
          <div className={styles.logoHeader}>
            <img
              src="/assets/shelfaware-logo.svg"
              alt={PRODUCT_BRAND_NAME}
              className={styles.authLogoImg}
            />
          </div>
          <Outlet />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
