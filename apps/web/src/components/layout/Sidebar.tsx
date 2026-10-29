import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sparkles,
  LayoutDashboard,
  ReceiptText,
  Boxes,
  CreditCard,
  Users,
  Bell,
  HelpCircle,
  Settings,
  Search,
  MoreHorizontal,
  X,
  Package,
  Truck,
  Building2,
  ClockAlert,
  BarChart3,
  UserCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useNotificationStore } from '../../store/notificationStore';
import { hasPermission } from '../../config/permissions';
import { PATHS } from '../../router/paths';
import { cn } from '../../utils/cn';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { isSidebarCollapsed, isMobileSidebarOpen, setMobileSidebarOpen } = useUiStore();
  const { settings } = useSettingsStore();
  const { getUnreadCount } = useNotificationStore();

  const brandName = settings?.branding.productName || 'Mate';
  const unreadCount = getUnreadCount();

  const handleNavClick = () => {
    if (isMobileSidebarOpen) setMobileSidebarOpen(false);
  };

  // Primary navigation group (matching image 1: Dashboard, Orders, Inventory, Payments, Customers)
  const primaryNavItems = [
    {
      label: 'Dashboard',
      path: PATHS.DASHBOARD,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Orders',
      path: PATHS.SALES,
      icon: ReceiptText,
      requiredPermission: 'sales:view' as const,
    },
    {
      label: 'Inventory',
      path: PATHS.INVENTORY,
      icon: Boxes,
      requiredPermission: 'inventory:view' as const,
    },
    {
      label: 'POS & Payments',
      path: PATHS.POS,
      icon: CreditCard,
      requiredPermission: 'pos:operate' as const,
    },
    {
      label: 'Products',
      path: PATHS.PRODUCTS,
      icon: Package,
      requiredPermission: 'products:view' as const,
    },
    {
      label: 'Purchases',
      path: PATHS.PURCHASES,
      icon: Truck,
      requiredPermission: 'purchases:view' as const,
    },
    {
      label: 'Suppliers',
      path: PATHS.SUPPLIERS,
      icon: Building2,
    },
    {
      label: 'Customers',
      path: PATHS.CUSTOMERS,
      icon: Users,
    },
    {
      label: 'Perishables',
      path: PATHS.EXPIRY,
      icon: ClockAlert,
    },
    {
      label: 'Reports',
      path: PATHS.REPORTS,
      icon: BarChart3,
      requiredPermission: 'reports:view' as const,
    },
    {
      label: 'Team & Users',
      path: PATHS.USERS,
      icon: UserCheck,
      requiredPermission: 'users:manage' as const,
    },
  ];

  // Secondary navigation group (matching image 1: Notifications, Help & support, Settings)
  const secondaryNavItems = [
    {
      label: 'Notifications',
      path: PATHS.NOTIFICATIONS,
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : 7,
    },
    {
      label: 'Help & support',
      path: PATHS.SUPPORT,
      icon: HelpCircle,
    },
    {
      label: 'Settings',
      path: PATHS.SETTINGS,
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#070B14] border-r border-[#151D2D] text-slate-300 transition-all duration-300 select-none font-sans',
          isSidebarCollapsed ? 'w-16' : 'w-56',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#151D2D]">
          <div className="flex items-center gap-2 overflow-hidden">
            {/* Asterisk / Star icon matching image 1 */}
            <div className="w-6 h-6 flex items-center justify-center text-slate-100 shrink-0">
              <Sparkles className="w-5 h-5 text-slate-100" />
            </div>
            {!isSidebarCollapsed && (
              <span className="text-sm font-bold text-white tracking-wide">
                {brandName}
              </span>
            )}
          </div>

          {/* Mobile close */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Search inside sidebar (matching image 1) */}
        {!isSidebarCollapsed && (
          <div className="px-3 pt-3.5 pb-2">
            <div className="flex items-center justify-between bg-[#111827] border border-[#1F293D] rounded-md px-2.5 py-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] text-slate-500">Search</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">⌘F</span>
            </div>
          </div>
        )}

        {/* Primary Nav List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-1 scrollbar-none">
          {primaryNavItems.map((item) => {
            if (item.requiredPermission && !hasPermission(user?.role, item.requiredPermission)) {
              return null;
            }

            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                title={isSidebarCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors group relative',
                  isActive
                    ? 'bg-[#192234] text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#121A2A]'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                  )}
                />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}

          {/* Separator before secondary nav */}
          <div className="my-3 border-t border-[#172033]" />

          {/* Secondary Nav List (Notifications, Help, Settings) */}
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                title={isSidebarCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors group relative',
                  isActive
                    ? 'bg-[#192234] text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#121A2A]'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                    )}
                  />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {/* Circular red notification badge matching image 1 */}
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      'w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0',
                      isSidebarCollapsed && 'absolute top-1.5 right-1.5'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Card at bottom matching image 1 (Avatar + Name + '...') */}
        <div className="p-3 border-t border-[#151D2D]">
          <div className="flex items-center justify-between p-1 rounded-md hover:bg-[#121A2A] transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-xs font-semibold text-white shrink-0 overflow-hidden ring-1 ring-slate-500">
                {user?.name?.charAt(0) || 'O'}
              </div>
              {!isSidebarCollapsed && (
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {user?.name || 'Olivia Williams'}
                  </p>
                  <p className="text-[10px] text-slate-500 capitalize truncate">
                    {user?.role || 'Store Admin'}
                  </p>
                </div>
              )}
            </div>

            {!isSidebarCollapsed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Sign out?')) logout();
                }}
                className="text-slate-500 hover:text-slate-300 p-1"
                title="Options / Sign Out"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
