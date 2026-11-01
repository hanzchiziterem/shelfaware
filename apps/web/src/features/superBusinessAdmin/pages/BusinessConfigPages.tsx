import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCT_BRAND_NAME } from '@/app/config/branding';
import { PATHS } from '@/app/router/paths';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useAuthStore } from '@/store/authStore';
import { usePlatformAdminStore } from '@/store/platformAdminStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSuperBusinessAdminStore } from '@/store/superBusinessAdminStore';
import { useUiStore } from '@/store/uiStore';
import type { BusinessBranch, OperatingDaySchedule } from '@/types/adminPortals';
import { formatCurrency } from '@/utils/currency';
import { formatFullDateTime, formatShortDate } from '@/utils/dates';
import styles from '@/features/platformAdmin/pages/PlatformAdmin.module.css';

/**
 * 1. Business Overview (`/business-admin/overview`)
 */
export function BusinessOverviewPage() {
  const settings = useSettingsStore((s) => s.settings);
  const activeTenantId = useSuperBusinessAdminStore((s) => s.activeTenantId);
  const branches = useSuperBusinessAdminStore((s) => s.branches);
  const employees = useSuperBusinessAdminStore((s) => s.employees);
  const enabledModuleKeys = useSuperBusinessAdminStore((s) => s.enabledModuleKeys);
  const accessHistory = useSuperBusinessAdminStore((s) => s.accessHistory);
  const registrationNumber = useSuperBusinessAdminStore((s) => s.registrationNumber);

  const subscriptions = usePlatformAdminStore((s) => s.subscriptions);
  const tenantSub = subscriptions.find((sub) => sub.tenantId === activeTenantId);

  const activeBranches = branches.filter((b) => b.status === 'active').length;
  const activeEmployees = employees.filter((e) => e.status === 'active').length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>Super Business Admin • Tenant Control Centre</div>
          <h1 className={styles.title}>{settings.businessName}</h1>
          <p className={styles.subtitle}>
            High-level configuration, branch structure, module governance, and access control for your{' '}
            {PRODUCT_BRAND_NAME} business account.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link to={PATHS.APP.DASHBOARD}>
            <Button variant="secondary" size="sm">
              Open Retail Operations Workspace
            </Button>
          </Link>
          <Link to={PATHS.BUSINESS_ADMIN.ROLES}>
            <Button variant="primary" size="sm">
              Roles & Permission Matrix
            </Button>
          </Link>
        </div>
      </header>

      <div className={styles.bannerInfo}>
        <strong>Tenant Boundary Active ({activeTenantId})</strong> — All settings, custom roles, and
        employees configured here apply exclusively to <strong>{settings.businessName}</strong> ({registrationNumber}).
      </div>

      <section className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Business Type</span>
          <span className={styles.kpiValue} style={{ fontSize: '18px' }}>
            {settings.businessType}
          </span>
          <span className={styles.kpiSub}>CAC: {registrationNumber}</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Subscription Plan</span>
          <span className={styles.kpiValue} style={{ fontSize: '18px' }}>
            {tenantSub?.planName || 'Supermarket Growth'}
          </span>
          <span className={styles.kpiSub}>
            Status: <strong>{tenantSub?.status.toUpperCase() || 'ACTIVE'}</strong> • Renews{' '}
            {tenantSub ? formatShortDate(tenantSub.renewalDate) : '12 Nov 2026'}
          </span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Enabled Modules</span>
          <span className={styles.kpiValue}>{enabledModuleKeys.length}</span>
          <span className={styles.kpiSub}>Permitted by {tenantSub?.planName || 'Growth'} plan</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Store Branches</span>
          <span className={styles.kpiValue}>{branches.length}</span>
          <span className={styles.kpiSub}>
            {activeBranches} active • {branches.length - activeBranches} closed/inactive
          </span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Staff Accounts</span>
          <span className={styles.kpiValue}>{employees.length}</span>
          <span className={styles.kpiSub}>
            {activeEmployees} active • {employees.length - activeEmployees} invited/inactive
          </span>
        </div>
      </section>

      <div className={styles.twoColGrid}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Store Branches & Locations</h2>
              <p className={styles.cardSubtitle}>
                Physical retail outlets and depots managed under {settings.businessName}
              </p>
            </div>
            <Link to={PATHS.BUSINESS_ADMIN.BRANCHES}>
              <Button variant="secondary" size="sm">
                Manage Branches
              </Button>
            </Link>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Branch Name</th>
                  <th>Code</th>
                  <th>Staff</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => (
                  <tr key={branch.id}>
                    <td>
                      <div className={styles.primaryText}>{branch.name}</div>
                      <div className={styles.secondaryText}>{branch.city}</div>
                    </td>
                    <td>
                      <span className={styles.codePill}>{branch.code}</span>
                    </td>
                    <td className={styles.mono}>{branch.assignedEmployeesCount}</td>
                    <td>
                      <StatusIndicator
                        tone={
                          branch.status === 'active'
                            ? 'success'
                            : branch.status === 'temporary_closure'
                              ? 'warning'
                              : 'neutral'
                        }
                        label={branch.status.replace('_', ' ')}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Recent Administrative Activities</h2>
              <p className={styles.cardSubtitle}>
                Configuration changes and access updates inside your tenant
              </p>
            </div>
            <Link to={PATHS.BUSINESS_ADMIN.ACCESS_HISTORY}>
              <Button variant="ghost" size="sm">
                Full Access Log →
              </Button>
            </Link>
          </div>
          <div className={styles.feedList}>
            {accessHistory.slice(0, 5).map((item) => (
              <div key={item.id} className={styles.feedItem}>
                <div className={styles.feedContent}>
                  <span className={styles.feedTitle}>{item.activity}</span>
                  <span className={styles.feedMeta}>
                    {item.userName} ({item.userRole}) • {item.resource}
                  </span>
                </div>
                <span className={styles.feedTime}>{formatFullDateTime(item.timestamp)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * 2. Business Profile (`/business-admin/profile`)
 */
export function BusinessProfilePage() {
  const user = useAuthStore((s) => s.user);
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const businessDescription = useSuperBusinessAdminStore((s) => s.businessDescription);
  const registrationNumber = useSuperBusinessAdminStore((s) => s.registrationNumber);
  const taxIdNumber = useSuperBusinessAdminStore((s) => s.taxIdNumber);
  const updateBusinessExtendedProfile = useSuperBusinessAdminStore(
    (s) => s.updateBusinessExtendedProfile
  );
  const pushToast = useUiStore((s) => s.pushToast);

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [businessType, setBusinessType] = useState(settings.businessType);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [description, setDescription] = useState(businessDescription);
  const [cacNumber, setCacNumber] = useState(registrationNumber);
  const [tinNumber, setTinNumber] = useState(taxIdNumber);

  const handleSave = async () => {
    await updateSettings({
      businessName: businessName.trim() || settings.businessName,
      businessType,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
    });
    updateBusinessExtendedProfile(
      {
        businessDescription: description.trim(),
        registrationNumber: cacNumber.trim(),
        taxIdNumber: tinNumber.trim(),
      },
      user?.fullName || 'Adebayo Ogunlesi'
    );
    pushToast({
      title: 'Business profile saved',
      description: `Updated identity and corporate registration details for ${businessName}.`,
      tone: 'success',
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>Super Business Admin • Business Configuration</div>
          <h1 className={styles.title}>Business Profile</h1>
          <p className={styles.subtitle}>
            Manage your registered business name, contact details, and corporate tax identifiers.
          </p>
        </div>
      </header>

      <div className={styles.bannerInfo}>
        <strong>Product Identity Notice:</strong> Updating your business profile changes how your
        store is identified on customer receipts and branch headers while preserving{' '}
        <strong>{PRODUCT_BRAND_NAME}</strong> as the core retail management platform.
      </div>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Legal & Store Identity</h2>
            <p className={styles.cardSubtitle}>
              Displayed on thermal receipts, purchase orders, and branch headers
            </p>
          </div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Business / Supermarket Name</label>
              <input
                type="text"
                className={styles.input}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Business Category</label>
              <select
                className={styles.select}
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
              >
                <option value="Foodstuff & Coldroom Supermarket">
                  Foodstuff & Coldroom Supermarket
                </option>
                <option value="Multi-Branch Supermarket">Multi-Branch Supermarket</option>
                <option value="Wholesale Cash & Carry">Wholesale Cash & Carry</option>
                <option value="Neighborhood Grocery & Mini-Mart">
                  Neighborhood Grocery & Mini-Mart
                </option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Primary Contact Email</label>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Primary Contact Phone</label>
              <input
                type="text"
                className={styles.input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>CAC Registration Number</label>
              <input
                type="text"
                className={styles.input}
                value={cacNumber}
                onChange={(e) => setCacNumber(e.target.value)}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>FIRS Tax Identification Number (TIN)</label>
              <input
                type="text"
                className={styles.input}
                value={tinNumber}
                onChange={(e) => setTinNumber(e.target.value)}
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
              <label className={styles.label}>Headquarters / Main Depot Address</label>
              <input
                type="text"
                className={styles.input}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
              <label className={styles.label}>Business Description</label>
              <textarea
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <Button variant="primary" size="md" onClick={() => void handleSave()}>
              Save Business Profile
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * 3. Branch / Store Management (`/business-admin/branches`)
 */
export function BranchManagementPage() {
  const user = useAuthStore((s) => s.user);
  const branches = useSuperBusinessAdminStore((s) => s.branches);
  const saveBranch = useSuperBusinessAdminStore((s) => s.saveBranch);
  const setBranchStatus = useSuperBusinessAdminStore((s) => s.setBranchStatus);
  const pushToast = useUiStore((s) => s.pushToast);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BusinessBranch | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Lagos');
  const [phone, setPhone] = useState('+234 803 ');
  const [managerName, setManagerName] = useState('');

  const openModal = (branch?: BusinessBranch) => {
    if (branch) {
      setEditingBranch(branch);
      setName(branch.name);
      setCode(branch.code);
      setAddress(branch.address);
      setCity(branch.city);
      setPhone(branch.phone);
      setManagerName(branch.managerName);
    } else {
      setEditingBranch(null);
      setName('');
      setCode(`LAG-0${branches.length + 1}`);
      setAddress('');
      setCity('Lagos');
      setPhone('+234 803 ');
      setManagerName('Ngozi Eze');
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim() || !code.trim() || !address.trim()) return;
    if (!editingBranch && branches.length >= 5) {
      pushToast({
        title: 'Plan branch limit reached (5 branches)',
        description: 'Upgrade to Enterprise Chain to provision more than 5 store branches.',
        tone: 'error',
      });
      return;
    }
    saveBranch(
      {
        id: editingBranch?.id,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        address: address.trim(),
        city: city.trim(),
        phone: phone.trim(),
        managerName: managerName.trim() || 'Store Manager',
        status: editingBranch?.status || 'active',
        isPrimary: editingBranch?.isPrimary || false,
      },
      user?.fullName || 'Adebayo Ogunlesi'
    );
    pushToast({
      title: editingBranch ? 'Branch updated' : 'Branch created',
      description: `${name.trim()} (${code.trim().toUpperCase()}) saved.`,
      tone: 'success',
    });
    setModalOpen(false);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>Super Business Admin • Business Configuration</div>
          <h1 className={styles.title}>Branch / Store Management</h1>
          <p className={styles.subtitle}>
            Configure physical store branches, warehouse depots, and operational statuses ({branches.length}{' '}
            of 5 branches used on Supermarket Growth plan).
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" size="md" onClick={() => openModal()}>
            + Add Branch
          </Button>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Branch Name</th>
                <th>Branch Code</th>
                <th>Address</th>
                <th>Branch Manager</th>
                <th>Assigned Staff</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch.id}>
                  <td>
                    <div className={styles.primaryText}>
                      {branch.name} {branch.isPrimary ? '(HQ)' : ''}
                    </div>
                    <div className={styles.secondaryText}>{branch.phone}</div>
                  </td>
                  <td>
                    <span className={styles.codePill}>{branch.code}</span>
                  </td>
                  <td>
                    <div className={styles.primaryText}>{branch.address}</div>
                    <div className={styles.secondaryText}>{branch.city}</div>
                  </td>
                  <td>{branch.managerName}</td>
                  <td className={styles.mono}>{branch.assignedEmployeesCount} staff</td>
                  <td>
                    <StatusIndicator
                      tone={
                        branch.status === 'active'
                          ? 'success'
                          : branch.status === 'temporary_closure'
                            ? 'warning'
                            : 'neutral'
                      }
                      label={branch.status.replace('_', ' ')}
                    />
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Button variant="secondary" size="sm" onClick={() => openModal(branch)}>
                        Edit
                      </Button>
                      {!branch.isPrimary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const nextStatus: BusinessBranch['status'] =
                              branch.status === 'active' ? 'temporary_closure' : 'active';
                            setBranchStatus(
                              branch.id,
                              nextStatus,
                              user?.fullName || 'Adebayo Ogunlesi'
                            );
                            pushToast({
                              title: `Branch status updated`,
                              description: `${branch.name} is now ${nextStatus.replace('_', ' ')}.`,
                              tone: 'info',
                            });
                          }}
                        >
                          {branch.status === 'active' ? 'Close Temporarily' : 'Activate'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBranch ? `Edit Branch — ${editingBranch.name}` : 'Create Store Branch'}
        size="md"
      >
        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Branch Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Surulere Express Outlet"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Branch Code</label>
            <input
              type="text"
              className={styles.input}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
            <label className={styles.label}>Street Address</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Full physical location"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>City / State</label>
            <input
              type="text"
              className={styles.input}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Branch Phone</label>
            <input
              type="text"
              className={styles.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
            <label className={styles.label}>Assigned Branch Manager</label>
            <input
              type="text"
              className={styles.input}
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            {editingBranch ? 'Save Branch Changes' : 'Create Branch'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

/**
 * 4. Business Hours (`/business-admin/hours`)
 */
export function BusinessHoursPage() {
  const user = useAuthStore((s) => s.user);
  const operatingHours = useSuperBusinessAdminStore((s) => s.operatingHours);
  const holidays = useSuperBusinessAdminStore((s) => s.holidays);
  const branches = useSuperBusinessAdminStore((s) => s.branches);
  const updateOperatingDay = useSuperBusinessAdminStore((s) => s.updateOperatingDay);
  const addHolidayClosure = useSuperBusinessAdminStore((s) => s.addHolidayClosure);
  const removeHolidayClosure = useSuperBusinessAdminStore((s) => s.removeHolidayClosure);
  const pushToast = useUiStore((s) => s.pushToast);

  const [holTitle, setHolTitle] = useState('');
  const [holDate, setHolDate] = useState('2026-12-26');
  const [holScope, setHolScope] = useState('All Branches');

  const handleToggleDay = (dayItem: OperatingDaySchedule) => {
    updateOperatingDay(
      dayItem.day,
      { isOpen: !dayItem.isOpen },
      user?.fullName || 'Adebayo Ogunlesi'
    );
    pushToast({
      title: `${dayItem.day} schedule updated`,
      description: `${dayItem.day} is now marked as ${!dayItem.isOpen ? 'Open' : 'Closed'}.`,
      tone: 'info',
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>Super Business Admin • Business Configuration</div>
          <h1 className={styles.title}>Business Operating Hours</h1>
          <p className={styles.subtitle}>
            Configure standard weekly opening/closing times and scheduled holiday or stocktake closures.
          </p>
        </div>
      </header>

      <div className={styles.twoColGrid}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Weekly Operating Schedule</h2>
              <p className={styles.cardSubtitle}>
                Controls POS shift warnings and automated end-of-day closing reports
              </p>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Day of Week</th>
                  <th>Status</th>
                  <th>Opening Time</th>
                  <th>Closing Time</th>
                </tr>
              </thead>
              <tbody>
                {operatingHours.map((item) => (
                  <tr key={item.day}>
                    <td className={styles.primaryText}>{item.day}</td>
                    <td>
                      <button
                        type="button"
                        className={`${styles.switchBtn} ${item.isOpen ? styles.switchBtnOn : ''}`}
                        onClick={() => handleToggleDay(item)}
                        aria-label={`Toggle ${item.day}`}
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        className={styles.input}
                        style={{ height: '32px', width: '124px' }}
                        disabled={!item.isOpen}
                        value={item.openTime}
                        onChange={(e) =>
                          updateOperatingDay(
                            item.day,
                            { openTime: e.target.value },
                            user?.fullName || 'Adebayo Ogunlesi'
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        className={styles.input}
                        style={{ height: '32px', width: '124px' }}
                        disabled={!item.isOpen}
                        value={item.closeTime}
                        onChange={(e) =>
                          updateOperatingDay(
                            item.day,
                            { closeTime: e.target.value },
                            user?.fullName || 'Adebayo Ogunlesi'
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Holidays & Temporary Closures</h2>
              <p className={styles.cardSubtitle}>
                Planned public holidays, stocktake days, or branch maintenance windows
              </p>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.formGrid} style={{ marginBottom: '16px' }}>
              <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                <label className={styles.label}>Closure Title / Reason</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Boxing Day / Annual Coldroom Maintenance"
                  value={holTitle}
                  onChange={(e) => setHolTitle(e.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Date</label>
                <input
                  type="date"
                  className={styles.input}
                  value={holDate}
                  onChange={(e) => setHolDate(e.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Branch Scope</label>
                <select
                  className={styles.select}
                  value={holScope}
                  onChange={(e) => setHolScope(e.target.value)}
                >
                  <option value="All Branches">All Branches</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (!holTitle.trim()) return;
                addHolidayClosure(
                  { title: holTitle.trim(), date: holDate, branchScope: holScope },
                  user?.fullName || 'Adebayo Ogunlesi'
                );
                setHolTitle('');
                pushToast({
                  title: 'Holiday / closure scheduled',
                  tone: 'success',
                });
              }}
            >
              + Add Scheduled Closure
            </Button>

            <div className={styles.feedList} style={{ marginTop: '16px' }}>
              {holidays.map((h) => (
                <div key={h.id} className={styles.feedItem}>
                  <div className={styles.feedContent}>
                    <span className={styles.feedTitle}>{h.title}</span>
                    <span className={styles.feedMeta}>
                      Date: {h.date} • Scope: {h.branchScope}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      removeHolidayClosure(h.id, user?.fullName || 'Adebayo Ogunlesi')
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * 5. Branding & Receipt Settings (`/business-admin/receipt-settings`)
 */
export function BrandingReceiptSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const taxIdNumber = useSuperBusinessAdminStore((s) => s.taxIdNumber);
  const logAdminActivity = useSuperBusinessAdminStore((s) => s.logAdminActivity);
  const pushToast = useUiStore((s) => s.pushToast);

  const [receiptHeader, setReceiptHeader] = useState(settings.receiptHeader);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);
  const [receiptPaperWidth, setReceiptPaperWidth] = useState<'58mm' | '80mm'>(
    settings.receiptPaperWidth
  );
  const [showTinOnReceipt, setShowTinOnReceipt] = useState(true);

  const handleSave = async () => {
    await updateSettings({
      receiptHeader: receiptHeader.trim(),
      receiptFooter: receiptFooter.trim(),
      receiptPaperWidth,
    });
    logAdminActivity(
      user?.fullName || 'Adebayo Ogunlesi',
      'Updated Thermal Receipt Template & Format',
      `Paper: ${receiptPaperWidth}`
    );
    pushToast({
      title: 'Receipt branding updated',
      description: 'Thermal POS print layout updated across all store terminals.',
      tone: 'success',
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>Super Business Admin • Business Configuration</div>
          <h1 className={styles.title}>Branding & Receipt Settings</h1>
          <p className={styles.subtitle}>
            Customize how {settings.businessName} appears on thermal POS receipts while preserving{' '}
            {PRODUCT_BRAND_NAME} platform standards.
          </p>
        </div>
      </header>

      <div className={styles.twoColGrid}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Receipt Layout Configuration</h2>
              <p className={styles.cardSubtitle}>
                Applies to 58mm and 80mm thermal printers at checkout
              </p>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Store Name on Receipt</label>
                <input
                  type="text"
                  className={styles.input}
                  value={settings.businessName}
                  disabled
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Thermal Printer Paper Width</label>
                <select
                  className={styles.select}
                  value={receiptPaperWidth}
                  onChange={(e) => setReceiptPaperWidth(e.target.value as '58mm' | '80mm')}
                >
                  <option value="80mm">80mm Standard Thermal Roll</option>
                  <option value="58mm">58mm Compact Handheld / Mini POS</option>
                </select>
              </div>

              <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                <label className={styles.label}>Receipt Header Announcement</label>
                <input
                  type="text"
                  className={styles.input}
                  value={receiptHeader}
                  onChange={(e) => setReceiptHeader(e.target.value)}
                />
              </div>

              <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                <label className={styles.label}>Receipt Footer / Return Policy Note</label>
                <textarea
                  className={styles.textarea}
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.toggleRow}>
              <div className={styles.toggleMeta}>
                <span className={styles.toggleTitle}>Display FIRS Tax ID (TIN) on Receipt</span>
                <span className={styles.toggleDesc}>
                  Prints {taxIdNumber} below the store address for corporate wholesale buyers.
                </span>
              </div>
              <button
                type="button"
                className={`${styles.switchBtn} ${showTinOnReceipt ? styles.switchBtnOn : ''}`}
                onClick={() => setShowTinOnReceipt((v) => !v)}
              />
            </div>

            <div className={styles.modalFooter}>
              <Button variant="primary" size="md" onClick={() => void handleSave()}>
                Save Receipt Settings
              </Button>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Live Thermal Receipt Preview ({receiptPaperWidth})</h2>
              <p className={styles.cardSubtitle}>
                Real-time preview of customer checkout slip
              </p>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div
              className={styles.receiptPreview}
              style={{ maxWidth: receiptPaperWidth === '58mm' ? '260px' : '320px' }}
            >
              <div className={styles.receiptCenter}>
                <div className={styles.receiptStoreTitle}>{settings.businessName}</div>
                <div>{settings.address}</div>
                <div>Tel: {settings.phone}</div>
                {showTinOnReceipt && <div>TIN: {taxIdNumber}</div>}
                <div style={{ marginTop: '4px', fontStyle: 'italic' }}>{receiptHeader}</div>
              </div>

              <div className={styles.receiptDivider} />
              <div className={styles.receiptRow}>
                <span>Order: #192541</span>
                <span>30 Oct 2026 14:22</span>
              </div>
              <div className={styles.receiptRow}>
                <span>Branch: Mushin HQ</span>
                <span>Cashier: Zainab B.</span>
              </div>
              <div className={styles.receiptDivider} />

              <div className={styles.receiptRow}>
                <span>2x Royal Stallion Rice 50kg</span>
                <span>₦157,000</span>
              </div>
              <div className={styles.receiptRow}>
                <span>1x Mamador Veg Oil 25L</span>
                <span>₦61,500</span>
              </div>

              <div className={styles.receiptDivider} />
              <div className={styles.receiptRow} style={{ fontWeight: 700, fontSize: '13px' }}>
                <span>TOTAL PAID (TRANSFER)</span>
                <span>₦218,500</span>
              </div>
              <div className={styles.receiptDivider} />

              <div className={styles.receiptCenter}>
                <div>{receiptFooter}</div>
                <div style={{ marginTop: '6px', opacity: 0.7 }}>
                  Powered by {PRODUCT_BRAND_NAME} POS
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * 6. Currency & Tax Settings (`/business-admin/currency-tax`)
 */
export function CurrencyTaxSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const taxInclusivePricing = useSuperBusinessAdminStore((s) => s.taxInclusivePricing);
  const updateBusinessExtendedProfile = useSuperBusinessAdminStore(
    (s) => s.updateBusinessExtendedProfile
  );
  const pushToast = useUiStore((s) => s.pushToast);

  const [currency, setCurrency] = useState(settings.currency);
  const [enableTax, setEnableTax] = useState(settings.enableTax);
  const [taxPercentage, setTaxPercentage] = useState(String(settings.taxPercentage));
  const [inclusive, setInclusive] = useState(taxInclusivePricing);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const applyConfirmedChanges = async () => {
    const parsedTax = Number(taxPercentage) || 0;
    await updateSettings({
      currency,
      enableTax,
      taxPercentage: parsedTax,
    });
    updateBusinessExtendedProfile(
      { taxInclusivePricing: inclusive },
      user?.fullName || 'Adebayo Ogunlesi'
    );
    pushToast({
      title: 'Currency & Tax rules updated',
      description: `Active POS terminals will now apply ${enableTax ? `${parsedTax}% VAT` : '0% VAT'}.`,
      tone: 'success',
    });
    setConfirmOpen(false);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>Super Business Admin • Business Configuration</div>
          <h1 className={styles.title}>Currency & Tax Settings</h1>
          <p className={styles.subtitle}>
            Configure your primary operating currency, VAT rate, and tax-inclusive vs tax-exclusive pricing rules.
          </p>
        </div>
      </header>

      <div className={styles.bannerWarn}>
        <strong>Operational Impact Warning:</strong> Modifying currency or VAT calculation rules
        immediately affects active Point of Sale checkouts and financial P&L reports across all
        branches.
      </div>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Financial & VAT Rules</h2>
            <p className={styles.cardSubtitle}>
              Standardized across all branches of {settings.businessName}
            </p>
          </div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Business Operating Currency</label>
              <select
                className={styles.select}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="NGN">Nigerian Naira (₦ / NGN)</option>
                <option value="USD">US Dollar ($ / USD)</option>
                <option value="GBP">British Pound (£ / GBP)</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Value Added Tax (VAT %)</label>
              <input
                type="number"
                step="0.5"
                className={styles.input}
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.toggleRow} style={{ marginTop: '14px' }}>
            <div className={styles.toggleMeta}>
              <span className={styles.toggleTitle}>Enable VAT Calculation at POS Checkout</span>
              <span className={styles.toggleDesc}>
                Many basic foodstuff grains in Nigeria are VAT-exempt; enable if your supermarket charges VAT on taxable items.
              </span>
            </div>
            <button
              type="button"
              className={`${styles.switchBtn} ${enableTax ? styles.switchBtnOn : ''}`}
              onClick={() => setEnableTax((v) => !v)}
            />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleMeta}>
              <span className={styles.toggleTitle}>Tax-Inclusive Shelf Pricing</span>
              <span className={styles.toggleDesc}>
                When enabled, product selling prices already include VAT ({taxPercentage}%) rather than adding VAT on top of the subtotal.
              </span>
            </div>
            <button
              type="button"
              className={`${styles.switchBtn} ${inclusive ? styles.switchBtnOn : ''}`}
              onClick={() => setInclusive((v) => !v)}
            />
          </div>

          <div className={styles.modalFooter}>
            <Button variant="primary" size="md" onClick={() => setConfirmOpen(true)}>
              Review & Apply Tax Configuration
            </Button>
          </div>
        </div>
      </section>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Currency & Tax Change"
        size="sm"
      >
        <div className={styles.bannerWarn}>
          Are you sure you want to update the tax configuration for{' '}
          <strong>{settings.businessName}</strong>?
        </div>
        <div className={styles.kvGrid}>
          <div className={styles.kvItem}>
            <span className={styles.kvLabel}>Currency</span>
            <span className={styles.kvValue}>{currency}</span>
          </div>
          <div className={styles.kvItem}>
            <span className={styles.kvLabel}>VAT Status</span>
            <span className={styles.kvValue}>
              {enableTax ? `Enabled (${taxPercentage}%)` : 'Exempt / Disabled (0%)'}
            </span>
          </div>
          <div className={styles.kvItem}>
            <span className={styles.kvLabel}>Pricing Mode</span>
            <span className={styles.kvValue}>
              {inclusive ? 'Tax-Inclusive' : 'Tax-Exclusive'}
            </span>
          </div>
          <div className={styles.kvItem}>
            <span className={styles.kvLabel}>Sample ₦10,000 Item</span>
            <span className={styles.kvValue}>
              {enableTax && !inclusive
                ? formatCurrency(10000 + (10000 * (Number(taxPercentage) || 0)) / 100)
                : formatCurrency(10000)}
            </span>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={() => void applyConfirmedChanges()}>
            Confirm & Apply to All Terminals
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
