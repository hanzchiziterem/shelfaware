import { useLocation, useNavigate } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { API_CONFIG } from '@/services/api/apiConfig';
import { useAuthStore } from '@/store/authStore';
import styles from '@/styles/SharedPages.module.css';

export function NotFoundPage({ unauthorized = false }: { unauthorized?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const switchRoleForDemo = useAuthStore((s) => s.switchRoleForDemo);

  const isPlatformRoute = location.pathname.startsWith('/platform');
  const isSuperBusinessRoute = location.pathname.startsWith('/business-admin');

  return (
    <div className={styles.pageWrap}>
      <EmptyState
        title={unauthorized ? 'Access Restricted for Current Role' : '404 — Page Not Found'}
        description={
          unauthorized
            ? isPlatformRoute
              ? 'This route belongs to the internal ShelfAware Platform Admin portal. Business tenants and store staff cannot access platform-wide controls.'
              : isSuperBusinessRoute
                ? 'This route requires Super Business Admin permissions for this tenant.'
                : 'Your current staff role does not have permission to view this administrative module.'
            : 'The requested route does not exist in this workspace.'
        }
        action={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button variant="secondary" onClick={() => navigate(PATHS.APP.DASHBOARD)}>
              Return to Store Dashboard
            </Button>
            {unauthorized && API_CONFIG.useMockApi && isPlatformRoute && (
              <Button
                variant="primary"
                onClick={() => {
                  void switchRoleForDemo('platform_admin');
                }}
              >
                Switch Demo Role to Platform Admin
              </Button>
            )}
            {unauthorized && API_CONFIG.useMockApi && isSuperBusinessRoute && (
              <Button
                variant="primary"
                onClick={() => {
                  void switchRoleForDemo('super_business_admin');
                }}
              >
                Switch Demo Role to Super Business Admin
              </Button>
            )}
          </div>
        }
      />
    </div>
  );
}
