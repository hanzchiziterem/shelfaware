import { useUiStore } from '@/store/uiStore';
import styles from './ToastContainer.module.css';

export function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts);
  const dismissToast = useUiStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.viewport} role="region" aria-label="Notifications">
      {toasts.map((t) => {
        const toneClass = {
          success: styles.toneSuccess,
          error: styles.toneError,
          warning: styles.toneWarning,
          info: styles.toneInfo,
        }[t.tone];

        return (
          <div key={t.id} className={styles.toast}>
            <div>
              <div className={`${styles.title} ${toneClass}`}>{t.title}</div>
              {t.description && <div className={styles.description}>{t.description}</div>}
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
