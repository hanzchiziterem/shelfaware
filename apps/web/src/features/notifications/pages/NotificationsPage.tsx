import React, { useEffect } from 'react';
import { Bell, CheckCheck, AlertTriangle, ClockAlert, ShoppingCart, Info } from 'lucide-react';
import { useNotificationStore } from '../../../store/notificationStore';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { formatRelativeTime } from '../../../utils/dates';

export const NotificationsPage: React.FC = () => {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'expiring_stock':
        return <ClockAlert className="w-4 h-4 text-rose-500" />;
      case 'new_sale':
        return <ShoppingCart className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <PageHeader
        title="Notification Center"
        description="Alerts for low inventory, expiring foodstuff batches, and system events."
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={markAllAsRead}
            leftIcon={<CheckCheck className="w-4 h-4" />}
          >
            Mark all as read
          </Button>
        }
      />

      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => !n.isRead && markAsRead(n.id)}
            className={`p-3.5 rounded-[var(--radius-card)] border transition-all flex items-start gap-3 cursor-pointer ${
              n.isRead
                ? 'bg-white border-slate-200 opacity-75'
                : 'bg-emerald-50/20 border-emerald-200 shadow-subtle'
            }`}
          >
            <div className="p-2 rounded-md bg-white border border-slate-200 shrink-0">
              {getIcon(n.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatRelativeTime(n.createdAt)}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
            </div>

            {!n.isRead && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="py-12 text-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-[var(--radius-card)]">
            <Bell className="w-6 h-6 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No notifications at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};
