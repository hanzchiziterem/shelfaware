import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useSettingsStore } from '@/store/settingsStore';
import { useSupplierStore } from '@/store/supplierStore';
import { useUiStore } from '@/store/uiStore';
import styles from '@/styles/SharedPages.module.css';
import { formatCompactCurrency, formatCurrency } from '@/utils/currency';
import { formatShortDate } from '@/utils/dates';

export function SuppliersPage() {
  const settings = useSettingsStore((s) => s.settings);
  const pushToast = useUiStore((s) => s.pushToast);

  const suppliers = useSupplierStore((s) => s.suppliers);
  const fetchSuppliers = useSupplierStore((s) => s.fetchSuppliers);
  const createSupplier = useSupplierStore((s) => s.createSupplier);

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('+234 803 ');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    void fetchSuppliers();
  }, [fetchSuppliers]);

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  const totalPayables = suppliers.reduce((acc, s) => acc + s.outstandingPayable, 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const created = await createSupplier({
      name,
      contactPerson,
      phone,
      email,
      address,
      suppliedCategories: ['Grains & Staples'],
    });
    if (created) {
      setModalOpen(false);
      setName('');
      setContactPerson('');
      setEmail('');
      setAddress('');
      pushToast({ title: `Supplier ${created.name} added`, tone: 'success' });
    }
  };

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Suppliers</h1>
          <p className={styles.pageSubtitle}>
            Manage wholesale foodstuff distributors, coldrooms, and agro-merchants.
          </p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          + Add Supplier
        </Button>
      </div>

      <div className={styles.statStrip3}>
        <div className={styles.statBox}>
          <span className={styles.statBig}>{suppliers.length}</span>
          <span className={styles.statLabel}>Active foodstuff suppliers</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statBig}>
            {formatCompactCurrency(
              suppliers.reduce((acc, s) => acc + s.totalPurchasesValue, 0)
            )}
          </span>
          <span className={styles.statLabel}>Total procurement volume</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statBig}>{formatCompactCurrency(totalPayables)}</span>
          <span className={styles.statLabel}>Outstanding supplier payables</span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search supplier or contact person..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Supplied Categories</th>
              <th style={{ textAlign: 'right' }}>Total Purchases</th>
              <th style={{ textAlign: 'right' }}>Outstanding Payable</th>
              <th>Last Supply</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sup) => (
              <tr key={sup.id}>
                <td style={{ fontWeight: 500 }}>{sup.name}</td>
                <td>{sup.contactPerson}</td>
                <td className="tabular-nums">{sup.phone}</td>
                <td style={{ color: 'var(--color-text-secondary)' }}>
                  {sup.suppliedCategories.join(', ')}
                </td>
                <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(sup.totalPurchasesValue, settings.currency, settings.locale)}
                </td>
                <td
                  className="tabular-nums"
                  style={{
                    textAlign: 'right',
                    fontWeight: 600,
                    color:
                      sup.outstandingPayable > 0
                        ? 'var(--color-warning)'
                        : 'var(--color-text-secondary)',
                  }}
                >
                  {formatCurrency(sup.outstandingPayable, settings.currency, settings.locale)}
                </td>
                <td className="tabular-nums">{formatShortDate(sup.lastSupplyDate)}</td>
                <td>
                  <StatusIndicator tone="success" label="Active" appearance="tag" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Foodstuff Supplier"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={(e) => void handleCreate(e)}>
              Save Supplier
            </Button>
          </>
        }
      >
        <form className={styles.formStack} onSubmit={handleCreate}>
          <div className={styles.fieldGroup}>
            <label htmlFor="sup-name" className={styles.label}>
              Company / Depot Name
            </label>
            <input
              id="sup-name"
              className={styles.input}
              placeholder="e.g. Mile 12 Grains Syndicate"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="sup-contact" className={styles.label}>
              Contact Person
            </label>
            <input
              id="sup-contact"
              className={styles.input}
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="sup-phone" className={styles.label}>
              Phone Number
            </label>
            <input
              id="sup-phone"
              className={styles.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="sup-email" className={styles.label}>
              Email
            </label>
            <input
              id="sup-email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="sup-addr" className={styles.label}>
              Depot Address
            </label>
            <input
              id="sup-addr"
              className={styles.input}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
