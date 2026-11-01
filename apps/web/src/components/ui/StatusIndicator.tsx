import styles from './StatusIndicator.module.css';

interface StatusIndicatorProps {
  tone: 'success' | 'warning' | 'danger' | 'neutral';
  label: string;
  appearance?: 'inline' | 'tag';
}

/**
 * Matches the reference images' status styling:
 * - 'inline': clean unboxed text with typographic symbol (`✓ Paid`, `↺ Refunded`, `✕ Cancelled`)
 * - 'tag': subtle low-contrast rectangle used in the reference detail panel (`Active`)
 */
export function StatusIndicator({
  tone,
  label,
  appearance = 'inline',
}: StatusIndicatorProps) {
  if (appearance === 'tag') {
    const tagClass = {
      success: styles.tagSuccess,
      warning: styles.tagWarning,
      danger: styles.tagDanger,
      neutral: styles.tagNeutral,
    }[tone];
    return <span className={`${styles.subtleTag} ${tagClass}`}>{label}</span>;
  }

  const toneClass = {
    success: styles.toneSuccess,
    warning: styles.toneWarning,
    danger: styles.toneDanger,
    neutral: styles.toneNeutral,
  }[tone];

  const symbol = {
    success: '✓',
    warning: '!',
    danger: '✕',
    neutral: '↺',
  }[tone];

  return (
    <span className={`${styles.statusInline} ${toneClass}`}>
      <span className={styles.symbol} aria-hidden="true">
        {symbol}
      </span>
      <span>{label}</span>
    </span>
  );
}
