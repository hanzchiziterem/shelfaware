import React from 'react';
import {
  PanelLeftClose,
  PanelLeft,
  RotateCcw,
  Shield,
  Search,
  Bell,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { Role } from '../../types/domain';
import { mockStorage } from '../../mocks/mockStorage';
import { Button } from '../ui/Button';
import { PATHS } from '../../router/paths';

export const Topbar: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar, setMobileSidebarOpen } = useUiStore();
  const { user, switchRoleForDemo } = useAuthStore();
  const { getUnreadCount } = useNotificationStore();
  const unreadCount = getUnreadCount();

  const handleResetDemo = () => {
    if (window.confirm('Reset all demo products, stock, and sales to initial defaults?')) {
      mockStorage.resetToDefaults();
      window.location.reload();
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-20 shadow-subtle">
      {/* Left section: Sidebar toggle button on navbar (Desktop + Mobile) */}
      <div className="flex items-center gap-3">
        {/* Desktop Sidebar Collapse / Expand Toggle Button */}
        <button
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex items-center justify-center p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
        >
          {isSidebarCollapsed ? (
            <PanelLeft className="w-4 h-4 text-slate-700" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100 border border-slate-200"
        >
          <PanelLeft className="w-4 h-4 text-slate-700" />
        </button>

        {/* Store & Active Register indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 tracking-tight hidden sm:inline">
            Adeola Foods & Provisions
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Register #01
          </span>
        </div>
      </div>

      {/* Right section: Search trigger, Role switcher, Notifications & Demo reset */}
      <div className="flex items-center gap-2.5">
        {/* Search quick button */}
        <Link
          to={PATHS.PRODUCTS}
          className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200 hover:border-slate-300 px-2.5 py-1.5 rounded-[var(--radius-control)] transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Quick search catalog...</span>
          <kbd className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono text-slate-500">
            ⌘K
          </kbd>
        </Link>

        {/* Notifications Icon Button */}
        <Link
          to={PATHS.NOTIFICATIONS}
          className="relative p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </Link>

        {/* Demo Role Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-[var(--radius-control)]">
          <Shield className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">Role:</span>
          <select
            value={user?.role || 'admin'}
            onChange={(e) => switchRoleForDemo(e.target.value as Role)}
            className="text-xs font-semibold text-slate-800 bg-transparent border-0 focus:outline-none cursor-pointer"
          >
            <option value="admin">Admin (All Access)</option>
            <option value="manager">Store Manager</option>
            <option value="cashier">Cashier (POS)</option>
          </select>
        </div>

        {/* Demo reset button */}
        <Button
          variant="outline"
          size="xs"
          onClick={handleResetDemo}
          title="Reset simulated data"
          className="text-slate-600 hover:text-slate-900 border-slate-200"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden xl:inline">Reset</span>
        </Button>
      </div>
    </header>
  );
};
