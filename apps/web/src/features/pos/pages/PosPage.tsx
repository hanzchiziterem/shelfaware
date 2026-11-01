import { useEffect, useRef, useState } from 'react';
import { hasPermission } from '@/app/config/permissions';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useAuthStore } from '@/store/authStore';
import { useCustomerStore } from '@/store/customerStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { usePosStore } from '@/store/posStore';
import { useProductStore } from '@/store/productStore';
import { useSalesStore } from '@/store/salesStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';
import type { OrderFulfillmentType, PaymentMethod } from '@/types/common';
import { addAmounts, formatCurrency } from '@/utils/currency';
import { formatFullDateTime } from '@/utils/dates';
import { formatUnitLabel, getStockStatus } from '@/utils/formatters';
import styles from './PosPage.module.css';

export function PosPage() {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const user = useAuthStore((s) => s.user);
  const settings = useSettingsStore((s) => s.settings);
  const pushToast = useUiStore((s) => s.pushToast);

  const products = useProductStore((s) => s.products);
  const categories = useProductStore((s) => s.categories);
  const fetchProducts = useProductStore((s) => s.fetchProducts);

  const customers = useCustomerStore((s) => s.customers);
  const fetchCustomers = useCustomerStore((s) => s.fetchCustomers);

  const fetchInventory = useInventoryStore((s) => s.fetchInventory);
  const fetchSales = useSalesStore((s) => s.fetchSales);
  const fetchDashboard = useDashboardStore((s) => s.fetchDashboard);

  const cart = usePosStore((s) => s.cart);
  const selectedCustomerId = usePosStore((s) => s.selectedCustomerId);
  const fulfillmentType = usePosStore((s) => s.fulfillmentType);
  const discountType = usePosStore((s) => s.discountType);
  const discountValue = usePosStore((s) => s.discountValue);
  const paymentMethod = usePosStore((s) => s.paymentMethod);
  const cashTendered = usePosStore((s) => s.cashTendered);
  const splitCashAmount = usePosStore((s) => s.splitCashAmount);
  const splitTransferOrCardAmount = usePosStore((s) => s.splitTransferOrCardAmount);
  const paymentReference = usePosStore((s) => s.paymentReference);
  const isSubmitting = usePosStore((s) => s.isSubmitting);
  const lastCompletedSale = usePosStore((s) => s.lastCompletedSale);
  const posError = usePosStore((s) => s.error);

  const addToCart = usePosStore((s) => s.addToCart);
  const updateItemQuantity = usePosStore((s) => s.updateItemQuantity);
  const removeFromCart = usePosStore((s) => s.removeFromCart);
  const clearCart = usePosStore((s) => s.clearCart);
  const setSelectedCustomerId = usePosStore((s) => s.setSelectedCustomerId);
  const setFulfillmentType = usePosStore((s) => s.setFulfillmentType);
  const setDiscount = usePosStore((s) => s.setDiscount);
  const setPaymentMethod = usePosStore((s) => s.setPaymentMethod);
  const setCashTendered = usePosStore((s) => s.setCashTendered);
  const setSplitAmounts = usePosStore((s) => s.setSplitAmounts);
  const setPaymentReference = usePosStore((s) => s.setPaymentReference);
  const getTotals = usePosStore((s) => s.getTotals);
  const submitSale = usePosStore((s) => s.submitSale);
  const clearCompletedSale = usePosStore((s) => s.clearCompletedSale);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Managers and Administrators can apply arbitrary discounts; cashiers can apply up to 5% or ₦2,000
  const isSupervisor = hasPermission(user?.role, 'manage_products');

  useEffect(() => {
    void fetchProducts();
    void fetchCustomers();
  }, [fetchProducts, fetchCustomers]);

  const totals = getTotals(settings.taxPercentage, settings.enableTax);

  // Validate payment readiness to prevent invalid checkouts
  const isCashInsufficient =
    paymentMethod === 'cash' && cashTendered > 0 && cashTendered < totals.grandTotal;
  const splitSum = addAmounts(splitCashAmount, splitTransferOrCardAmount);
  const isSplitInvalid = paymentMethod === 'split' && splitSum < totals.grandTotal;
  const isCheckoutDisabled =
    cart.length === 0 || isSubmitting || isCashInsufficient || isSplitInvalid;

  const handleCompleteSale = async () => {
    if (isCheckoutDisabled) return;
    const sale = await submitSale({
      cashierId: user?.id || 'usr-01',
      cashierName: user?.fullName || 'Store Cashier',
      taxPercentage: settings.taxPercentage,
      enableTax: settings.enableTax,
    });

    if (sale) {
      await Promise.all([fetchProducts(), fetchInventory(), fetchSales(), fetchDashboard()]);
      pushToast({
        title: `Sale ${sale.orderNumber} completed (${formatCurrency(sale.total)})`,
        description: 'Inventory balances and sales ledger updated.',
        tone: 'success',
      });
    }
  };

  // Barcode scan & exact SKU enter-key handler
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchTerm('');
      return;
    }
    if (e.key === 'Enter' && searchTerm.trim() !== '') {
      e.preventDefault();
      const q = searchTerm.trim().toLowerCase();
      const exactMatch = products.find(
        (p) =>
          p.status === 'active' &&
          (p.barcode === q || p.sku.toLowerCase() === q || p.name.toLowerCase() === q)
      );
      const target = exactMatch || activeProducts[0];
      if (target) {
        const res = addToCart(target, 1);
        if (res.ok) {
          setSearchTerm('');
          pushToast({
            title: `Scanned: ${target.name}`,
            description: `1 ${target.unit} added to cart (${formatCurrency(target.sellingPrice)})`,
            tone: 'success',
          });
        } else if (res.message) {
          pushToast({ title: res.message, tone: 'warning' });
        }
      } else {
        pushToast({
          title: `No product found for barcode/SKU "${searchTerm}"`,
          tone: 'error',
        });
      }
    }
  };

  // Cashier keyboard shortcuts (F2 focus search/barcode, F4 cycle payment method, F9 complete sale)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        const order: PaymentMethod[] = ['cash', 'bank_transfer', 'card', 'split'];
        const next = order[(order.indexOf(paymentMethod) + 1) % order.length];
        setPaymentMethod(next);
      } else if (e.key === 'F9') {
        e.preventDefault();
        if (!isCheckoutDisabled) {
          void handleCompleteSale();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const activeProducts = products.filter((p) => {
    if (p.status !== 'active') return false;
    if (activeCategory !== 'all' && p.categoryId !== activeCategory) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q)
      );
    }
    return true;
  });

  const handleSimulateBarcodeScan = () => {
    const inStockItems = products.filter((p) => p.status === 'active' && p.stockQuantity > 0);
    if (!inStockItems.length) return;
    const sample = inStockItems[0];
    const res = addToCart(sample, 1);
    if (res.ok) {
      pushToast({
        title: `Barcode ${sample.barcode} scanned`,
        description: `Added 1 ${sample.unit} of ${sample.name}`,
        tone: 'info',
      });
    }
  };

  return (
    <div className={styles.posSplit}>
      {/* Left Product Catalog & Barcode Scanner Column */}
      <div className={styles.catalogColumn}>
        <div className={styles.catalogHeader}>
          <div>
            <h1 className={styles.pageTitle}>Point of Sale</h1>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
              {settings.businessName} · Cashier: {user?.fullName} ({user?.role})
            </p>
          </div>

          <div className={styles.shortcutBar} aria-label="Cashier keyboard shortcuts">
            <span>
              <kbd className={styles.kbdTag}>F2</kbd> Scan / Search
            </span>
            <span>
              <kbd className={styles.kbdTag}>Enter</kbd> Add Match
            </span>
            <span>
              <kbd className={styles.kbdTag}>F4</kbd> Payment Mode
            </span>
            <span>
              <kbd className={styles.kbdTag}>F9</kbd> Complete Sale
            </span>
          </div>
        </div>

        <div className={styles.searchBar}>
          <input
            ref={searchInputRef}
            type="search"
            className={styles.searchInput}
            placeholder="Scan barcode (e.g. 6151100010124) or search name / SKU and press Enter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <Button variant="secondary" onClick={handleSimulateBarcodeScan}>
            Simulate Scan
          </Button>
        </div>

        <div className={styles.categoryStrip}>
          <button
            type="button"
            className={`${styles.catChip} ${activeCategory === 'all' ? styles.catChipActive : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All items ({products.filter((p) => p.status === 'active').length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.catChip} ${
                activeCategory === cat.id ? styles.catChipActive : ''
              }`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className={styles.productGrid}>
          {activeProducts.map((product) => {
            const stockState = getStockStatus(product.stockQuantity, product.minStockThreshold);
            const isOutOfStock = stockState === 'out_of_stock';
            const inCartItem = cart.find((c) => c.product.id === product.id);

            return (
              <button
                key={product.id}
                type="button"
                disabled={isOutOfStock}
                className={`${styles.productCard} ${
                  isOutOfStock ? styles.productCardDisabled : ''
                } ${inCartItem ? styles.productCardInCart : ''}`}
                onClick={() => {
                  const res = addToCart(product, 1);
                  if (!res.ok && res.message) {
                    pushToast({ title: res.message, tone: 'warning' });
                  }
                }}
              >
                <div className={styles.cardTop}>
                  <div className={styles.skuRow}>
                    <span>{product.sku}</span>
                    {inCartItem && (
                      <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                        {inCartItem.quantity} {product.unit} in cart
                      </span>
                    )}
                  </div>
                  <div className={styles.productName}>{product.name}</div>
                </div>

                <div className={styles.cardBottom}>
                  <div>
                    <div className={styles.priceValue}>
                      {formatCurrency(product.sellingPrice, settings.currency, settings.locale)}
                    </div>
                    <div className={styles.unitLabel}>
                      per {product.unit}
                      {product.allowFractional ? ' (decimal ok)' : ''}
                    </div>
                  </div>
                  <span
                    className={`${styles.stockCounter} ${
                      stockState === 'in_stock'
                        ? styles.stockHealthy
                        : stockState === 'low_stock'
                          ? styles.stockLow
                          : styles.stockOut
                    }`}
                  >
                    {isOutOfStock
                      ? 'Out of stock'
                      : `${product.stockQuantity} ${formatUnitLabel(
                          product.unit,
                          product.stockQuantity
                        )}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Cart & Checkout Column */}
      <aside className={styles.cartColumn} aria-label="Active Cart and Checkout">
        <div className={styles.cartHeader}>
          <div className={styles.cartTitleRow}>
            <h2 className={styles.cartTitle}>Current Sale ({cart.length} line items)</h2>
            {cart.length > 0 && (
              <button
                type="button"
                style={{ fontSize: '12px', color: 'var(--color-danger)', fontWeight: 500 }}
                onClick={clearCart}
              >
                Clear cart
              </button>
            )}
          </div>

          <div className={styles.customerRow}>
            <select
              aria-label="Select customer"
              className={styles.compactSelect}
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Select order fulfillment type"
              className={styles.compactSelect}
              value={fulfillmentType}
              onChange={(e) => setFulfillmentType(e.target.value as OrderFulfillmentType)}
            >
              <option value="Walk-in">Walk-in</option>
              <option value="Pickup">Pickup</option>
              <option value="Delivery">Delivery</option>
            </select>
          </div>
        </div>

        <div className={styles.cartItemsScroll}>
          {cart.length === 0 ? (
            <div className={styles.emptyCartMsg}>
              Scan a product barcode or click any foodstuff item on the left to start a sale.
            </div>
          ) : (
            cart.map((item) => {
              const stepVal = item.product.allowFractional ? 0.5 : 1;
              return (
                <div key={item.product.id} className={styles.cartLine}>
                  <div className={styles.cartLineTop}>
                    <span className={styles.cartItemName}>{item.product.name}</span>
                    <span className={styles.cartItemSubtotal}>
                      {formatCurrency(item.subtotal, settings.currency, settings.locale)}
                    </span>
                  </div>
                  <div className={styles.cartLineControls}>
                    <span className="tabular-nums">
                      {formatCurrency(item.product.sellingPrice)} × {item.quantity}{' '}
                      {item.product.unit}
                    </span>

                    <div className={styles.qtyStepper}>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        aria-label={`Decrease quantity for ${item.product.name}`}
                        onClick={() =>
                          updateItemQuantity(
                            item.product.id,
                            Number((item.quantity - stepVal).toFixed(2))
                          )
                        }
                      >
                        −
                      </button>
                      <input
                        type="number"
                        step={stepVal}
                        min={stepVal}
                        max={item.product.stockQuantity}
                        aria-label={`Quantity for ${item.product.name}`}
                        className={styles.qtyInput}
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!Number.isNaN(val)) {
                            updateItemQuantity(item.product.id, val);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        aria-label={`Increase quantity for ${item.product.name}`}
                        onClick={() =>
                          updateItemQuantity(
                            item.product.id,
                            Number((item.quantity + stepVal).toFixed(2))
                          )
                        }
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeFromCart(item.product.id)}
                        aria-label={`Remove ${item.product.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className={styles.checkoutSection}>
          {posError && <div className={styles.errorBanner}>{posError}</div>}

          <div className={styles.discountRow}>
            <select
              aria-label="Discount type"
              className={styles.compactSelect}
              value={discountType}
              onChange={(e) =>
                setDiscount(e.target.value as 'fixed' | 'percentage', discountValue)
              }
            >
              <option value="fixed">Disc (₦)</option>
              <option value="percentage">Disc (%)</option>
            </select>
            <input
              type="number"
              min="0"
              aria-label="Discount value"
              className={styles.compactInput}
              placeholder={
                isSupervisor ? 'Authorised discount (0)' : 'Cashier discount (Max ₦2,000 / 5%)'
              }
              value={discountValue || ''}
              onChange={(e) => {
                const raw = parseFloat(e.target.value) || 0;
                if (!isSupervisor) {
                  const maxAllowed = discountType === 'fixed' ? 2000 : 5;
                  if (raw > maxAllowed) {
                    pushToast({
                      title: 'Manager approval required for higher discounts',
                      description: `Cashier role is capped at ${
                        discountType === 'fixed' ? '₦2,000' : '5%'
                      }.`,
                      tone: 'warning',
                    });
                    setDiscount(discountType, maxAllowed);
                    return;
                  }
                }
                setDiscount(discountType, raw);
              }}
            />
          </div>

          <div className={styles.paymentTabs} role="group" aria-label="Payment method">
            {(
              [
                { id: 'cash', label: 'Cash' },
                { id: 'bank_transfer', label: 'Transfer' },
                { id: 'card', label: 'POS Card' },
                { id: 'split', label: 'Split' },
              ] as Array<{ id: PaymentMethod; label: string }>
            ).map((pm) => (
              <button
                key={pm.id}
                type="button"
                className={`${styles.payTab} ${paymentMethod === pm.id ? styles.payTabActive : ''}`}
                onClick={() => setPaymentMethod(pm.id)}
              >
                {pm.label}
              </button>
            ))}
          </div>

          {paymentMethod === 'cash' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  min="0"
                  aria-label="Cash received from customer"
                  className={styles.compactInput}
                  style={{ flex: 1 }}
                  placeholder={`Cash tendered (Exact: ₦${totals.grandTotal.toLocaleString()})`}
                  value={cashTendered || ''}
                  onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                />
                {totals.changeDue > 0 && (
                  <span
                    className="tabular-nums"
                    style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-success)' }}
                  >
                    Change: {formatCurrency(totals.changeDue)}
                  </span>
                )}
              </div>
              {cart.length > 0 && (
                <div className={styles.quickCashStrip}>
                  <button
                    type="button"
                    className={styles.quickCashBtn}
                    onClick={() => setCashTendered(totals.grandTotal)}
                  >
                    Exact ({formatCurrency(totals.grandTotal)})
                  </button>
                  {[5000, 10000, 50000, 100000]
                    .filter((amt) => amt >= totals.grandTotal)
                    .slice(0, 3)
                    .map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        className={styles.quickCashBtn}
                        onClick={() => setCashTendered(amt)}
                      >
                        {formatCurrency(amt)}
                      </button>
                    ))}
                </div>
              )}
              {isCashInsufficient && (
                <div className={styles.validationHint}>
                  Cash tendered is ₦{(totals.grandTotal - cashTendered).toLocaleString()} short of
                  the total due.
                </div>
              )}
            </>
          )}

          {(paymentMethod === 'bank_transfer' || paymentMethod === 'card') && (
            <input
              type="text"
              aria-label="Payment reference"
              className={styles.compactInput}
              placeholder="NIP Session ID / POS Terminal Stan Ref (optional)"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
            />
          )}

          {paymentMethod === 'split' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <input
                  type="number"
                  min="0"
                  aria-label="Split cash amount"
                  className={styles.compactInput}
                  placeholder="Cash portion (₦)"
                  value={splitCashAmount || ''}
                  onChange={(e) => {
                    const cashVal = parseFloat(e.target.value) || 0;
                    const remainder = Math.max(0, totals.grandTotal - cashVal);
                    setSplitAmounts(cashVal, remainder);
                  }}
                />
                <input
                  type="number"
                  min="0"
                  aria-label="Split transfer or card amount"
                  className={styles.compactInput}
                  placeholder="Transfer / POS (₦)"
                  value={splitTransferOrCardAmount || ''}
                  onChange={(e) =>
                    setSplitAmounts(splitCashAmount, parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              {isSplitInvalid && cart.length > 0 && (
                <div className={styles.validationHint}>
                  Split total ({formatCurrency(splitSum)}) must cover {formatCurrency(totals.grandTotal)}.
                </div>
              )}
            </>
          )}

          <div className={styles.summaryLines}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span className="tabular-nums">
                {formatCurrency(totals.subtotal, settings.currency, settings.locale)}
              </span>
            </div>
            {totals.discountAmount > 0 && (
              <div className={styles.summaryRow}>
                <span>Discount</span>
                <span className="tabular-nums" style={{ color: 'var(--color-success)' }}>
                  −{formatCurrency(totals.discountAmount, settings.currency, settings.locale)}
                </span>
              </div>
            )}
            {settings.enableTax && (
              <div className={styles.summaryRow}>
                <span>VAT ({settings.taxPercentage}%)</span>
                <span className="tabular-nums">
                  {formatCurrency(totals.taxAmount, settings.currency, settings.locale)}
                </span>
              </div>
            )}
            <div className={styles.grandTotalRow}>
              <span>Total Due</span>
              <span className="tabular-nums">
                {formatCurrency(totals.grandTotal, settings.currency, settings.locale)}
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            disabled={isCheckoutDisabled}
            onClick={() => void handleCompleteSale()}
          >
            {isSubmitting
              ? 'Recording transaction...'
              : `Complete Sale · ${formatCurrency(
                  totals.grandTotal,
                  settings.currency,
                  settings.locale
                )}`}
          </Button>
        </div>
      </aside>

      {/* Receipt Preview Dialog upon Completed Sale */}
      <Dialog
        open={lastCompletedSale !== null}
        onClose={clearCompletedSale}
        title={`Sale ${lastCompletedSale?.orderNumber} Confirmed`}
        size="sm"
        darkHeader
        footer={
          <>
            <Button variant="secondary" onClick={clearCompletedSale}>
              New Sale
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                window.print();
              }}
            >
              Print Receipt
            </Button>
          </>
        }
      >
        {lastCompletedSale && (
          <div className={styles.receiptPaper}>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>{settings.businessName}</div>
            <div>{settings.address}</div>
            <div>Tel: {settings.phone}</div>
            <div>
              Receipt: {lastCompletedSale.orderNumber} ·{' '}
              {formatFullDateTime(lastCompletedSale.createdAt)}
            </div>
            <div>Customer: {lastCompletedSale.customerName}</div>
            <div>Cashier: {lastCompletedSale.cashierName}</div>
            <hr style={{ border: 'none', borderTop: '1px dashed var(--color-border-strong)' }} />
            {lastCompletedSale.items.map((item) => (
              <div
                key={item.productId}
                style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}
              >
                <span>
                  {item.quantity} {item.unit} × {item.productName}
                </span>
                <span className="tabular-nums">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
            <hr style={{ border: 'none', borderTop: '1px dashed var(--color-border-strong)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(lastCompletedSale.subtotal)}</span>
            </div>
            {lastCompletedSale.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Discount</span>
                <span className="tabular-nums">
                  −{formatCurrency(lastCompletedSale.discountAmount)}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>GRAND TOTAL</span>
              <span className="tabular-nums">{formatCurrency(lastCompletedSale.total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Paid ({lastCompletedSale.paymentMethod.toUpperCase()})</span>
              <span className="tabular-nums">
                {formatCurrency(lastCompletedSale.amountReceived)}
              </span>
            </div>
            {lastCompletedSale.changeGiven > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>Change Given</span>
                <span className="tabular-nums">{formatCurrency(lastCompletedSale.changeGiven)}</span>
              </div>
            )}
            <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
              {settings.receiptFooter}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
