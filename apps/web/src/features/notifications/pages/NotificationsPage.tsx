import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useNotificationStore } from '@/store/notificationStore';
import styles from '@/styles/SharedPages.module.css';
import { formatFullDateTime } from '@/utils/dates';

export function NotificationsPage() {
  const navigate = useNavigate();
  const notifications = useNotificationStore((s) => s.notifications);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.isRead : true));

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Notifications</h1>
          <p className={styles.pageSubtitle}>
            Stock alerts, perishable batch expiry warnings, and completed sale events.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread ({notifications.filter((n) => !n.isRead).length})
          </Button>
          <Button variant="secondary" size="sm" onClick={() => void markAllAsRead()}>
            Mark all as read
          </Button>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Severity</th>
              <th>Alert & Details</th>
              <th>Timestamp</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((notif) => (
              <tr
                key={notif.id}
                style={{
                  backgroundColor: !notif.isRead ? 'var(--color-surface-muted)' : undefined,
                }}
              >
                <td style={{ width: '110px' }}>
                  {notif.severity === 'critical' && (
                    <StatusIndicator tone="danger" label="Critical" appearance="tag" />
                  )}
                  {notif.severity === 'warning' && (
                    <StatusIndicator tone="warning" label="Warning" appearance="tag" />
                  )}
                  {notif.severity === 'success' && (
                    <StatusIndicator tone="success" label="Sale" appearance="tag" />
                  )}
                  {notif.severity === 'info' && (
                    <StatusIndicator tone="neutral" label="Info" appearance="tag" />
                  )}
                </td>
                <td style={{ whiteSpace: 'normal', maxWidth: '580px' }}>
                  <div style={{ fontWeight: notif.isRead ? 500 : 700 }}>{notif.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {notif.message}
                  </div>
                </td>
                <td className="tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                  {formatFullDateTime(notif.createdAt)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                    {notif.actionPath && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(notif.actionPath!)}
                      >
                        Inspect
                      </Button>
                    )}
                    {!notif.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void markAsRead(notif.id)}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
