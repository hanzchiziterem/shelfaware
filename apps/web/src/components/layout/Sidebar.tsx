import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Database,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  HelpCircle,
  History,
  KeyRound,
  Layers,
  LayoutDashboard,
  LogOut,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Scale,
  Search,
  Server,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Sparkles,
  Store,
  Truck,
  UserCheck,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';
import {
  NAVIGATION_ITEMS,
  PLATFORM_ADMIN_NAV_GROUPS,
  SUPER_BUSINESS_ADMIN_NAV_GROUPS,
} from '@/app/config/navigation';
import { hasPermission } from '@/app/config/permissions';
import { PATHS } from '@/app/router/paths';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Dialog } from '@/components/ui/Dialog';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useUiStore } from '@/store/uiStore';
import type { UserRole } from '@/types/common';
import styles from './Sidebar.module.css';

const NAV_ICON_MAP: Record<string, ReactNode> = {
  // Store Operations (Business Admin)
  dashboard: <LayoutDashboard size={16} strokeWidth={1.8} />,
  pos: <ShoppingBag size={16} strokeWidth={1.8} />,
  orders: <Receipt size={16} strokeWidth={1.8} />,
  inventory: <Boxes size={16} strokeWidth={1.8} />,
  products: <Package size={16} strokeWidth={1.8} />,
  purchases: <Truck size={16} strokeWidth={1.8} />,
  customers: <Users size={16} strokeWidth={1.8} />,
  suppliers: <Building2 size={16} strokeWidth={1.8} />,
  reports: <BarChart3 size={16} strokeWidth={1.8} />,
  users: <UserCog size={16} strokeWidth={1.8} />,
  notifications: <Bell size={16} strokeWidth={1.8} />,
  help: <HelpCircle size={16} strokeWidth={1.8} />,
  settings: <Settings size={16} strokeWidth={1.8} />,

  // Platform Admin
  'plat-dashboard': <LayoutDashboard size={16} strokeWidth={1.8} />,
  'plat-businesses': <Building2 size={16} strokeWidth={1.8} />,
  'plat-verification': <CheckCircle2 size={16} strokeWidth={1.8} />,
  'plat-onboarding': <UserCheck size={16} strokeWidth={1.8} />,
  'plat-provisioning': <Database size={16} strokeWidth={1.8} />,
  'plat-plans': <Layers size={16} strokeWidth={1.8} />,
  'plat-subscriptions': <CreditCard size={16} strokeWidth={1.8} />,
  'plat-payments': <Wallet size={16} strokeWidth={1.8} />,
  'plat-failed-payments': <AlertTriangle size={16} strokeWidth={1.8} />,
  'plat-role-templates': <KeyRound size={16} strokeWidth={1.8} />,
  'plat-features': <Sparkles size={16} strokeWidth={1.8} />,
  'plat-settings': <Settings size={16} strokeWidth={1.8} />,
  'plat-support': <HelpCircle size={16} strokeWidth={1.8} />,
  'plat-audit-logs': <FileText size={16} strokeWidth={1.8} />,
  'plat-activity': <Activity size={16} strokeWidth={1.8} />,
  'plat-system-health': <Server size={16} strokeWidth={1.8} />,

  // Super Business Admin
  'sba-overview': <LayoutDashboard size={16} strokeWidth={1.8} />,
  'sba-profile': <Building2 size={16} strokeWidth={1.8} />,
  'sba-branches': <Store size={16} strokeWidth={1.8} />,
  'sba-hours': <Clock size={16} strokeWidth={1.8} />,
  'sba-receipt-settings': <Receipt size={16} strokeWidth={1.8} />,
  'sba-currency-tax': <Wallet size={16} strokeWidth={1.8} />,
  'sba-modules': <Layers size={16} strokeWidth={1.8} />,
  'sba-categories': <FolderKanban size={16} strokeWidth={1.8} />,
  'sba-units': <Scale size={16} strokeWidth={1.8} />,
  'sba-inventory-settings': <Boxes size={16} strokeWidth={1.8} />,
  'sba-sales-settings': <Sliders size={16} strokeWidth={1.8} />,
  'sba-notification-settings': <Bell size={16} strokeWidth={1.8} />,
  'sba-employees': <Users size={16} strokeWidth={1.8} />,
  'sba-roles': <ShieldCheck size={16} strokeWidth={1.8} />,
  'sba-access-history': <History size={16} strokeWidth={1.8} />,
  'sba-subscription': <CreditCard size={16} strokeWidth={1.8} />,
  'sba-billing-history': <FileSpreadsheet size={16} strokeWidth={1.8} />,
  'sba-account-settings': <Settings size={16} strokeWidth={1.8} />,
};

function formatShortRoleLabel(role?: UserRole): string {
  switch (role) {
    case 'administrator':
    case 'super_business_admin':
      return 'Admin';
    case 'platform_admin':
      return 'Platform Admin';
    case 'manager':
      return 'Manager';
    case 'cashier':
      return 'Cashier';
    default:
      return 'Admin';
  }
}

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const mobileDrawerOpen = useUiStore((s) => s.mobileDrawerOpen);
  const setMobileDrawerOpen = useUiStore((s) => s.setMobileDrawerOpen);
  const quickSearchOpen = useUiStore((s) => s.quickSearchOpen);
  const setQuickSearchOpen = useUiStore((s) => s.setQuickSearchOpen);

  const [quickFilter, setQuickFilter] = useState('');

  const isPlatformPortal = location.pathname.startsWith('/platform');
  const isSuperBusinessPortal = location.pathname.startsWith('/business-admin');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQuickSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setQuickSearchOpen]);

  const permittedItems = NAVIGATION_ITEMS.filter((item) => {
    if (!item.requiredPermission) return true;
    return hasPermission(user?.role, item.requiredPermission);
  });

  const primaryItems = permittedItems.filter((i) => i.section === 'primary');
  const operationsItems = permittedItems.filter((i) => i.section === 'operations');
  const systemItems = permittedItems.filter((i) => i.section === 'system');

  const quickJumpList = isPlatformPortal
    ? PLATFORM_ADMIN_NAV_GROUPS.flatMap((g) => g.items)
    : isSuperBusinessPortal
      ? SUPER_BUSINESS_ADMIN_NAV_GROUPS.flatMap((g) => g.items)
      : permittedItems.map((i) => ({ id: i.id, label: i.label, path: i.path }));

  const renderNavIcon = (id: string) =>
    NAV_ICON_MAP[id] || <LayoutDashboard size={16} strokeWidth={1.8} />;

  return (
    <>
      <aside
        className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''} ${
          mobileDrawerOpen ? styles.sidebarMobileOpen : ''
        }`.trim()}
        aria-label="Primary Navigation"
      >
        <div className={styles.topHeader}>
          <BrandLogo
            variant="sidebar"
            collapsed={sidebarCollapsed}
            showStoreName={!isPlatformPortal}
          />
          <button
            type="button"
            className={styles.collapseButton}
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={17} strokeWidth={1.8} />
            ) : (
              <PanelLeftClose size={17} strokeWidth={1.8} />
            )}
          </button>
        </div>

        <div className={styles.searchWrapper}>
          <button
            type="button"
            className={styles.searchTrigger}
            onClick={() => setQuickSearchOpen(true)}
            title="Quick jump (⌘K)"
            aria-label="Quick jump (⌘K)"
          >
            <span className={styles.searchLabelGroup}>
              <Search size={14} strokeWidth={1.8} />
              {!sidebarCollapsed && <span>Quick jump</span>}
            </span>
            {!sidebarCollapsed && <span className={styles.shortcutHint}>⌘K</span>}
          </button>
        </div>

        <nav className={styles.navScroll}>
          {isPlatformPortal ? (
            PLATFORM_ADMIN_NAV_GROUPS.map((group) => (
              <div key={group.groupTitle} className={styles.navGroup}>
                {!sidebarCollapsed && (
                  <div className={styles.navGroupHeading}>{group.groupTitle}</div>
                )}
                {group.items.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={({ isActive }) =>
                      `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`.trim()
                    }
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <span className={styles.navLabelWrap}>
                      <span className={styles.navIcon} aria-hidden="true">
                        {renderNavIcon(item.id)}
                      </span>
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </span>
                  </NavLink>
                ))}
              </div>
            ))
          ) : isSuperBusinessPortal ? (
            SUPER_BUSINESS_ADMIN_NAV_GROUPS.map((group) => (
              <div key={group.groupTitle} className={styles.navGroup}>
                {!sidebarCollapsed && (
                  <div className={styles.navGroupHeading}>{group.groupTitle}</div>
                )}
                {group.items.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={({ isActive }) =>
                      `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`.trim()
                    }
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <span className={styles.navLabelWrap}>
                      <span className={styles.navIcon} aria-hidden="true">
                        {renderNavIcon(item.id)}
                      </span>
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </span>
                  </NavLink>
                ))}
              </div>
            ))
          ) : (
            <>
              <div className={styles.navGroup}>
                {primaryItems.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={({ isActive }) =>
                      `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`.trim()
                    }
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <span className={styles.navLabelWrap}>
                      <span className={styles.navIcon} aria-hidden="true">
                        {renderNavIcon(item.id)}
                      </span>
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </span>
                  </NavLink>
                ))}
              </div>

              {operationsItems.length > 0 && (
                <>
                  <div className={styles.groupDivider} />
                  <div className={styles.navGroup}>
                    {operationsItems.map((item) => (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={({ isActive }) =>
                          `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`.trim()
                        }
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <span className={styles.navLabelWrap}>
                          <span className={styles.navIcon} aria-hidden="true">
                            {renderNavIcon(item.id)}
                          </span>
                          {!sidebarCollapsed && <span>{item.label}</span>}
                        </span>
                      </NavLink>
                    ))}
                  </div>
                </>
              )}

              <div className={styles.groupDivider} />

              <div className={styles.navGroup}>
                {systemItems.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={({ isActive }) =>
                      `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`.trim()
                    }
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <span className={styles.navLabelWrap}>
                      <span className={styles.navIcon} aria-hidden="true">
                        {renderNavIcon(item.id)}
                      </span>
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </span>
                    {!sidebarCollapsed &&
                      item.badgeType === 'notifications' &&
                      unreadCount > 0 && (
                        <span className={styles.unreadBadge}>{unreadCount}</span>
                      )}
                  </NavLink>
                ))}
              </div>
            </>
          )}
        </nav>

        <div className={styles.footerProfile}>
          <div className={styles.userRow}>
            <div className={styles.userIdentity}>
              <span className={styles.avatarCircle} title={user?.fullName || 'Store Staff'}>
                {user?.avatarInitials || 'AO'}
              </span>
              {!sidebarCollapsed && (
                <div className={styles.userMeta}>
                  <div className={styles.userName}>
                    {(user?.fullName || 'Store Staff').replace(' (Store Ops)', '')}
                  </div>
                  <div className={styles.userRole}>{formatShortRoleLabel(user?.role)}</div>
                </div>
              )}
            </div>
            <button
              type="button"
              className={styles.logoutBtn}
              onClick={() => {
                logout();
                navigate(PATHS.AUTH.LOGIN);
              }}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={16} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </aside>

      <Dialog
        open={quickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
        title="ShelfAware Quick Navigation"
        size="sm"
      >
        <input
          type="search"
          className={styles.quickInput}
          placeholder="Jump to page..."
          value={quickFilter}
          onChange={(e) => setQuickFilter(e.target.value)}
          autoFocus
        />
        <div className={styles.quickModalList}>
          {quickJumpList
            .filter((i) => i.label.toLowerCase().includes(quickFilter.toLowerCase()))
            .map((item) => (
              <button
                key={item.id}
                type="button"
                className={styles.quickModalItem}
                onClick={() => {
                  setQuickSearchOpen(false);
                  setQuickFilter('');
                  navigate(item.path);
                }}
              >
                <span>{item.label}</span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                  {item.path}
                </span>
              </button>
            ))}
        </div>
      </Dialog>
    </>
  );
}
