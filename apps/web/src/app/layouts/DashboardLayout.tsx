import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PanelLeftOpen } from 'lucide-react';
import { PATHS } from '@/app/router/paths';
import { Sidebar } from '@/components/layout/Sidebar';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';
import styles from './DashboardLayout.module.css';

export function DashboardLayout() {
  const location = useLocation();
  const status = useAuthStore((s) => s.status);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const mobileDrawerOpen = useUiStore((s) => s.mobileDrawerOpen);
  const setMobileDrawerOpen = useUiStore((s) => s.setMobileDrawerOpen);

  const isPlatformPortal = location.pathname.startsWith('/platform');

  useEffect(() => {
    void fetchSettings();
    void fetchNotifications();
  }, [fetchSettings, fetchNotifications]);

  if (status === 'unauthenticated') {
    return <Navigate to={PATHS.AUTH.LOGIN} state={{ from: location.pathname }} replace />;
  }

  return (
    <div className={styles.shell}>
      <Sidebar />
      {mobileDrawerOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className={styles.mainColumn}>
        <header className={styles.mobileTopbar}>
          <BrandLogo variant="sidebar" showStoreName={!isPlatformPortal} />
          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open navigation menu"
          >
            <PanelLeftOpen size={17} strokeWidth={1.8} />
            <span>Menu</span>
          </button>
        </header>
        <main className={styles.workspace}>
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
