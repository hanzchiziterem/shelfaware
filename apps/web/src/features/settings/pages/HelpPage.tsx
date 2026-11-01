import { useState } from 'react';
import { PRODUCT_BRAND_NAME } from '@/app/config/branding';
import styles from '@/styles/SharedPages.module.css';

const HELP_ARTICLES = [
  {
    q: 'How do I sell measured foodstuff items like beans or garri in fractional quantities?',
    a: 'When creating or editing a product in Products Management, enable "Allow fractional quantities". In the Point of Sale, cashiers can then sell 0.5kg, 1.5kg, or any decimal weight.',
  },
  {
    q: 'Why does creating a Purchase Order not immediately increase stock?',
    a: 'Draft and submitted purchase orders represent expected supplier deliveries. Stock balances and batch records only increase when you click "Receive Stock" on the Purchases page and confirm the delivered quantities.',
  },
  {
    q: 'How do I record a partial delivery from a supplier?',
    a: 'On the Purchases & Receiving page, click "Receive Stock" on an awaiting order and enter the exact physical quantity offloaded today. If the delivered quantity is less than the ordered quantity, ShelfAware marks the order as Partially Received and tracks the remaining balance.',
  },
  {
    q: 'How are perishable frozen foods and short-dated groceries tracked?',
    a: 'Navigate to Inventory → Perishable Batches to view lot numbers, expiry dates, days remaining, and stock value at risk.',
  },
  {
    q: 'Can Cashiers see wholesale cost prices or void completed sales?',
    a: 'No. Cost prices, gross/net profit figures, user management, and sale voids/refunds are restricted to Manager and Administrator roles.',
  },
  {
    q: 'How do I connect ShelfAware to my Node.js / TypeScript REST API backend?',
    a: 'Set VITE_USE_MOCK_API="false" and VITE_API_BASE_URL="http://localhost:4000/api/v1" in your .env file. All Zustand stores communicate through src/services/api/axiosInstance.ts.',
  },
];

export function HelpPage() {
  const [query, setQuery] = useState('');

  const filtered = HELP_ARTICLES.filter(
    (item) =>
      item.q.toLowerCase().includes(query.toLowerCase()) ||
      item.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Help & Support</h1>
          <p className={styles.pageSubtitle}>
            Operational guide for {PRODUCT_BRAND_NAME} POS & Inventory Management (v1.0.0).
          </p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          type="search"
          className={styles.searchInput}
          style={{ width: '320px' }}
          placeholder="Search help topics (e.g. fractional, partial delivery, expiry)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '760px' }}>
        {filtered.map((item) => (
          <div key={item.q} className={styles.cardBox}>
            <h2 className={styles.sectionHeading}>{item.q}</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
