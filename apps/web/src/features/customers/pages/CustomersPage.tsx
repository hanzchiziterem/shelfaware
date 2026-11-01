import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useCustomerStore } from '@/store/customerStore';
import { useSalesStore } from '@/store/salesStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';
import styles from '@/styles/SharedPages.module.css';
import { formatCompactCurrency, formatCurrency } from '@/utils/currency';
import { formatShortDate } from '@/utils/dates';

export function CustomersPage() {
  const settings = useSettingsStore((s) => s.settings);
  const pushToast = useUiStore((s) => s.pushToast);

  const customers = useCustomerStore((s) => s.customers);
  const selectedCustomer = useCustomerStore((s) => s.selectedCustomer);
  const setSelectedCustomer = useCustomerStore((s) => s.setSelectedCustomer);
  const fetchCustomers = useCustomerStore((s) => s.fetchCustomers);
  const createCustomer = useCustomerStore((s) => s.createCustomer);

  const sales = useSalesStore((s) => s.sales);
  const fetchSales = useSalesStore((s) => s.fetchSales);

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+234 803 ');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    void fetchCustomers();
    void fetchSales();
  }, [fetchCustomers, fetchSales]);

  useEffect(() => {
    if (customers.length > 0 && !selectedCustomer) {
      setSelectedCustomer(customers[0]);
    }
  }, [customers, selectedCustomer, setSelectedCustomer]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const created = await createCustomer({ name, phone, email, address, notes });
    if (created) {
      setModalOpen(false);
      setName('');
      setEmail('');
      setAddress('');
      setNotes('');
      pushToast({ title: `Customer ${created.name} added`, tone: 'success' });
    }
  };

  const customerHistory = selectedCustomer
    ? sales.filter((s) => s.customerId === selectedCustomer.id)
    : [];

  return (
    <div className={styles.splitWrap}>
      <div className={styles.pageWrap}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Customers</h1>
            <p className={styles.pageSubtitle}>
              Retail walk-in counter default and registered wholesale foodstuff buyers.
            </p>
          </div>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            + Add Customer
          </Button>
        </div>

        <div className={styles.statStrip3}>
          <div className={styles.statBox}>
            <span className={styles.statBig}>{customers.length}</span>
            <span className={styles.statLabel}>Customer profiles</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statBig}>
              {formatCompactCurrency(customers.reduce((acc, c) => acc + c.totalSpent, 0))}
            </span>
            <span className={styles.statLabel}>Cumulative customer spend</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statBig}>
              {customers.reduce((acc, c) => acc + c.ordersCount, 0)}
            </span>
            <span className={styles.statLabel}>Total recorded orders</span>
          </div>
        </div>

        <div className={styles.toolbar}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search customer name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Email</th>
                <th style={{ textAlign: 'right' }}>Orders</th>
                <th style={{ textAlign: 'right' }}>Total Spent</th>
                <th style={{ textAlign: 'right' }}>Last Order</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor:
                      selectedCustomer?.id === c.id ? 'var(--color-surface-muted)' : undefined,
                  }}
                >
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td className="tabular-nums">{c.phone}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{c.email}</td>
                  <td className="tabular-nums" style={{ textAlign: 'right' }}>
                    {c.ordersCount}
                  </td>
                  <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatCurrency(c.totalSpent, settings.currency, settings.locale)}
                  </td>
                  <td
                    className="tabular-nums"
                    style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}
                  >
                    {c.lastTransactionDate ? formatShortDate(c.lastTransactionDate) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCustomer && (
        <aside className={styles.sideDrawer} aria-label="Selected Customer Profile">
          <div style={{ fontSize: '18px', fontWeight: 600 }}>{selectedCustomer.name}</div>
          <div style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
            <div>Phone: {selectedCustomer.phone}</div>
            <div>Email: {selectedCustomer.email}</div>
            {selectedCustomer.address && <div>Address: {selectedCustomer.address}</div>}
            {selectedCustomer.notes && (
              <div style={{ marginTop: '6px', color: 'var(--color-text-muted)' }}>
                Notes: {selectedCustomer.notes}
              </div>
            )}
          </div>

          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--color-surface-muted)',
              borderRadius: 'var(--radius-card)',
            }}
          >
            <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
              Lifetime Spend ({selectedCustomer.ordersCount} orders)
            </div>
            <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 700 }}>
              {formatCurrency(selectedCustomer.totalSpent, settings.currency, settings.locale)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
              Recent Purchase History ({customerHistory.length})
            </div>
            {customerHistory.map((sale) => (
              <div
                key={sale.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  fontSize: '12.5px',
                }}
              >
                <span>
                  {sale.orderNumber} · {formatShortDate(sale.createdAt)}
                </span>
                <span className="tabular-nums" style={{ fontWeight: 600 }}>
                  {formatCurrency(sale.total, settings.currency, settings.locale)}
                </span>
              </div>
            ))}
          </div>
        </aside>
      )}

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Store Customer"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={(e) => void handleAddCustomer(e)}>
              Save Customer
            </Button>
          </>
        }
      >
        <form className={styles.formStack} onSubmit={handleAddCustomer}>
          <div className={styles.fieldGroup}>
            <label htmlFor="cust-name" className={styles.label}>
              Full Name or Business Name
            </label>
            <input
              id="cust-name"
              className={styles.input}
              placeholder="e.g. Mama Chinedu Catering"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="cust-phone" className={styles.label}>
              Phone Number
            </label>
            <input
              id="cust-phone"
              className={styles.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="cust-email" className={styles.label}>
              Email Address
            </label>
            <input
              id="cust-email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="cust-addr" className={styles.label}>
              Address
            </label>
            <input
              id="cust-addr"
              className={styles.input}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="cust-notes" className={styles.label}>
              Notes
            </label>
            <input
              id="cust-notes"
              className={styles.input}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
