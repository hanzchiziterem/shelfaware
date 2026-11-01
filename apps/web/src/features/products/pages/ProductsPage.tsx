import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasPermission } from '@/app/config/permissions';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import type { CreateOrUpdateProductPayload } from '@/features/products/services/productApi';
import { useAuthStore } from '@/store/authStore';
import { useProductStore } from '@/store/productStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSupplierStore } from '@/store/supplierStore';
import { useUiStore } from '@/store/uiStore';
import type { Product, ProductLifecycleStatus, UnitOfMeasure } from '@/types/common';
import { formatCurrency } from '@/utils/currency';
import { formatShortDate } from '@/utils/dates';
import styles from './ProductsPage.module.css';

const SUPPORTED_UNITS: UnitOfMeasure[] = [
  'bag',
  'carton',
  'pack',
  'piece',
  'kg',
  'gram',
  'litre',
  'bottle',
  'tin',
  'crate',
];

export function ProductsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const settings = useSettingsStore((s) => s.settings);
  const pushToast = useUiStore((s) => s.pushToast);

  const products = useProductStore((s) => s.products);
  const categories = useProductStore((s) => s.categories);
  const searchQuery = useProductStore((s) => s.searchQuery);
  const selectedCategoryId = useProductStore((s) => s.selectedCategoryId);
  const selectedLifecycleTab = useProductStore((s) => s.selectedLifecycleTab);
  const selectedProduct = useProductStore((s) => s.selectedProduct);

  const setSearchQuery = useProductStore((s) => s.setSearchQuery);
  const setSelectedCategoryId = useProductStore((s) => s.setSelectedCategoryId);
  const setSelectedLifecycleTab = useProductStore((s) => s.setSelectedLifecycleTab);
  const setSelectedProduct = useProductStore((s) => s.setSelectedProduct);
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const createProduct = useProductStore((s) => s.createProduct);
  const updateProduct = useProductStore((s) => s.updateProduct);
  const archiveProducts = useProductStore((s) => s.archiveProducts);

  const suppliers = useSupplierStore((s) => s.suppliers);
  const fetchSuppliers = useSupplierStore((s) => s.fetchSuppliers);

  const canManageProducts = hasPermission(user?.role, 'manage_products');
  const canViewCostPrice = hasPermission(user?.role, 'view_cost_price');

  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formState, setFormState] = useState<CreateOrUpdateProductPayload>({
    name: '',
    sku: '',
    barcode: '',
    categoryId: 'cat-grains',
    description: '',
    unit: 'bag',
    allowFractional: false,
    costPrice: 15000,
    sellingPrice: 17500,
    stockQuantity: 20,
    minStockThreshold: 8,
    supplierId: 'sup-01',
    trackExpiry: false,
    expiryDate: '',
    batchNumber: '',
    status: 'active',
  });

  useEffect(() => {
    void fetchProducts();
    void fetchSuppliers();
  }, [fetchProducts, fetchSuppliers]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormState({
      name: '',
      sku: `SKU-${Math.floor(100 + Math.random() * 899)}`,
      barcode: `6151100${Math.floor(100000 + Math.random() * 899999)}`,
      categoryId: categories[0]?.id || 'cat-grains',
      description: '',
      unit: 'bag',
      allowFractional: false,
      costPrice: 12000,
      sellingPrice: 14500,
      stockQuantity: 0,
      minStockThreshold: 10,
      supplierId: suppliers[0]?.id || 'sup-01',
      trackExpiry: false,
      expiryDate: '',
      batchNumber: '',
      status: 'active',
    });
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormState({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      categoryId: product.categoryId,
      description: product.description,
      unit: product.unit,
      allowFractional: product.allowFractional,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stockQuantity: product.stockQuantity,
      minStockThreshold: product.minStockThreshold,
      supplierId: product.supplierId || 'sup-01',
      trackExpiry: product.trackExpiry,
      expiryDate: product.expiryDate || '',
      batchNumber: product.batchNumber || '',
      status: product.status,
    });
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.sku.trim()) {
      pushToast({ title: 'Product name and SKU are required', tone: 'error' });
      return;
    }

    if (editingProduct) {
      const updated = await updateProduct(editingProduct.id, formState);
      if (updated) {
        setModalOpen(false);
        pushToast({ title: `Updated ${updated.name}`, tone: 'success' });
      }
    } else {
      const created = await createProduct(formState);
      if (created) {
        setModalOpen(false);
        pushToast({ title: `Added ${created.name} to catalog`, tone: 'success' });
      }
    }
  };

  const handleBulkArchive = async () => {
    if (!selectedIds.length) return;
    const ok = await archiveProducts(selectedIds);
    if (ok) {
      pushToast({
        title: `Archived ${selectedIds.length} product(s)`,
        description: 'Historical transaction references preserved.',
        tone: 'info',
      });
      setSelectedIds([]);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedLifecycleTab !== 'all' && p.status !== selectedLifecycleTab) return false;
    if (selectedCategoryId !== 'all' && p.categoryId !== selectedCategoryId) return false;
    if (selectedSupplierFilter !== 'all' && p.supplierId !== selectedSupplierFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        (p.supplierName || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div
      className={`${styles.productsLayout} ${
        !selectedProduct ? styles.productsLayoutFull : ''
      }`}
    >
      <div className={styles.mainColumn}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Products</h1>
            <p className={styles.pageSubtitle}>
              Product catalog master data — SKUs, barcodes, categories, selling units, pricing, and suppliers
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={() => navigate('/inventory')}>
              Manage Stock in Inventory →
            </Button>
            {canManageProducts && (
              <Button variant="primary" onClick={openCreateModal}>
                + Add Product
              </Button>
            )}
          </div>
        </div>

        <div className={styles.tabsRow}>
          <div className={styles.tabStrip} role="tablist">
            {(
              [
                { id: 'all', label: `All (${products.length})` },
                {
                  id: 'active',
                  label: `Active (${products.filter((p) => p.status === 'active').length})`,
                },
                {
                  id: 'draft',
                  label: `Draft (${products.filter((p) => p.status === 'draft').length})`,
                },
                {
                  id: 'archived',
                  label: `Archived (${products.filter((p) => p.status === 'archived').length})`,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selectedLifecycleTab === tab.id}
                className={`${styles.tabBtn} ${
                  selectedLifecycleTab === tab.id ? styles.tabBtnActive : ''
                }`}
                onClick={() => setSelectedLifecycleTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterRow}>
          <div className={styles.chipsGroup}>
            <select
              aria-label="Filter by category"
              className={styles.chipSelect}
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
            >
              <option value="all">Category: All</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by supplier"
              className={styles.chipSelect}
              value={selectedSupplierFilter}
              onChange={(e) => setSelectedSupplierFilter(e.target.value)}
            >
              <option value="all">Supplier: All</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </select>
          </div>

          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search name, SKU, barcode, supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredProducts.length === 0 ? (
          <EmptyState
            title="No catalog products match your filters"
            description="Clear your active filters or add a new SKU to the product catalog."
            action={
              canManageProducts ? (
                <Button variant="primary" onClick={openCreateModal}>
                  + Add Product
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '34px' }}>
                    <input
                      type="checkbox"
                      aria-label="Select all products"
                      checked={
                        filteredProducts.length > 0 &&
                        selectedIds.length === filteredProducts.length
                      }
                      onChange={(e) =>
                        setSelectedIds(
                          e.target.checked ? filteredProducts.map((p) => p.id) : []
                        )
                      }
                    />
                  </th>
                  <th>Product</th>
                  <th>SKU / Barcode</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th style={{ textAlign: 'right' }}>Selling Price</th>
                  {canViewCostPrice && <th style={{ textAlign: 'right' }}>Cost Price</th>}
                  <th>Supplier</th>
                  <th>Catalog Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => {
                  const isSelected = selectedProduct?.id === prod.id;
                  const isChecked = selectedIds.includes(prod.id);

                  return (
                    <tr
                      key={prod.id}
                      className={isSelected || isChecked ? styles.selectedRow : ''}
                      onClick={() => setSelectedProduct(prod)}
                    >
                      <td
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIds((prev) =>
                            prev.includes(prod.id)
                              ? prev.filter((x) => x !== prod.id)
                              : [...prev, prod.id]
                          );
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          aria-label={`Select ${prod.name}`}
                        />
                      </td>
                      <td style={{ fontWeight: 500 }}>{prod.name}</td>
                      <td>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                          {prod.sku}
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          {prod.barcode}
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{prod.categoryName}</td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{prod.unit}</td>
                      <td
                        className="tabular-nums"
                        style={{ textAlign: 'right', fontWeight: 600 }}
                      >
                        {formatCurrency(prod.sellingPrice, settings.currency, settings.locale)}
                      </td>
                      {canViewCostPrice && (
                        <td
                          className="tabular-nums"
                          style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}
                        >
                          {formatCurrency(prod.costPrice, settings.currency, settings.locale)}
                        </td>
                      )}
                      <td style={{ color: 'var(--color-text-secondary)', fontSize: '12.5px' }}>
                        {prod.supplierName || '—'}
                      </td>
                      <td>
                        {prod.status === 'active' && (
                          <StatusIndicator tone="success" label="Active" appearance="tag" />
                        )}
                        {prod.status === 'draft' && (
                          <StatusIndicator tone="warning" label="Draft" appearance="tag" />
                        )}
                        {prod.status === 'archived' && (
                          <StatusIndicator tone="neutral" label="Archived" appearance="tag" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {selectedIds.length > 0 && canManageProducts && (
          <div className={styles.bulkBar}>
            <button
              type="button"
              style={{ color: '#ffffff' }}
              onClick={() => setSelectedIds([])}
            >
              ✕
            </button>
            <span>Selected: {selectedIds.length}</span>
            <Button variant="danger" size="sm" onClick={() => void handleBulkArchive()}>
              Archive Selected
            </Button>
          </div>
        )}
      </div>

      {/* Right Contextual Product Catalog Inspector */}
      {selectedProduct && (
        <aside className={styles.detailPanel} aria-label="Product Details">
          <div className={styles.detailHeaderRow}>
            <div className={styles.detailTitle}>{selectedProduct.name}</div>
            <button
              type="button"
              className={styles.closePanelBtn}
              aria-label="Close product details"
              onClick={() => setSelectedProduct(null)}
            >
              ✕
            </button>
          </div>

          {canManageProducts && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => openEditModal(selectedProduct)}
              >
                Edit Catalog Info
              </Button>
              {selectedProduct.status !== 'archived' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void archiveProducts([selectedProduct.id])}
                >
                  Archive
                </Button>
              )}
            </div>
          )}

          <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
            {selectedProduct.description || 'Standard foodstuff retail & wholesale catalog item.'}
          </p>

          <div className={styles.kvGrid}>
            <span className={styles.kvLabel}>Catalog Status</span>
            <span className={styles.kvValue} style={{ textTransform: 'capitalize' }}>
              {selectedProduct.status}
            </span>

            <span className={styles.kvLabel}>SKU</span>
            <span className={styles.kvValue} style={{ fontFamily: 'var(--font-mono)' }}>
              {selectedProduct.sku}
            </span>

            <span className={styles.kvLabel}>Barcode</span>
            <span className={styles.kvValue} style={{ fontFamily: 'var(--font-mono)' }}>
              {selectedProduct.barcode}
            </span>

            <span className={styles.kvLabel}>Category</span>
            <span className={styles.kvValue}>{selectedProduct.categoryName}</span>

            <span className={styles.kvLabel}>Unit of Measure</span>
            <span className={styles.kvValue}>
              {selectedProduct.unit}{' '}
              {selectedProduct.allowFractional ? '(Fractional allowed)' : '(Whole units only)'}
            </span>

            <span className={styles.kvLabel}>Selling Price</span>
            <span className={`${styles.kvValue} tabular-nums`}>
              {formatCurrency(selectedProduct.sellingPrice, settings.currency, settings.locale)}
            </span>

            {canViewCostPrice && (
              <>
                <span className={styles.kvLabel}>Cost Price</span>
                <span className={`${styles.kvValue} tabular-nums`}>
                  {formatCurrency(selectedProduct.costPrice, settings.currency, settings.locale)}
                </span>

                <span className={styles.kvLabel}>Unit Margin</span>
                <span
                  className={`${styles.kvValue} tabular-nums`}
                  style={{ color: 'var(--color-success)' }}
                >
                  {formatCurrency(
                    selectedProduct.sellingPrice - selectedProduct.costPrice,
                    settings.currency,
                    settings.locale
                  )}
                </span>
              </>
            )}

            <span className={styles.kvLabel}>Primary Supplier</span>
            <span className={styles.kvValue}>{selectedProduct.supplierName || '—'}</span>

            <span className={styles.kvLabel}>Reorder Alert</span>
            <span className={`${styles.kvValue} tabular-nums`}>
              {selectedProduct.minStockThreshold} {selectedProduct.unit}
            </span>

            <span className={styles.kvLabel}>Expiry Tracking</span>
            <span className={styles.kvValue}>
              {selectedProduct.trackExpiry
                ? `Enabled (${selectedProduct.expiryDate || 'Batch tracked'})`
                : 'Not required'}
            </span>

            <span className={styles.kvLabel}>Last Updated</span>
            <span className={styles.kvValue}>{formatShortDate(selectedProduct.updatedAt)}</span>
          </div>

          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-card)',
              backgroundColor: 'var(--color-surface-muted)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Current stock on hand:{' '}
              <strong style={{ color: 'var(--color-text-primary)' }}>
                {selectedProduct.stockQuantity} {selectedProduct.unit}
              </strong>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/inventory')}
            >
              View Stock Movements & Batches in Inventory
            </Button>
          </div>
        </aside>
      )}

      {/* Add / Edit Product Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? `Edit Product — ${editingProduct.name}` : 'Add Catalog Product'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={(e) => void handleSaveProduct(e)}>
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </>
        }
      >
        <form className={styles.formGrid} onSubmit={handleSaveProduct}>
          <div className={styles.fieldFull}>
            <label htmlFor="prod-name" className={styles.label}>
              Product Name
            </label>
            <input
              id="prod-name"
              type="text"
              className={styles.input}
              placeholder="e.g. Royal Stallion Parboiled Rice 50kg"
              value={formState.name}
              onChange={(e) => setFormState({ ...formState, name: e.target.value })}
            />
          </div>

          <div className={styles.fieldCol}>
            <label htmlFor="prod-sku" className={styles.label}>
              SKU Code
            </label>
            <input
              id="prod-sku"
              type="text"
              className={styles.input}
              value={formState.sku}
              onChange={(e) => setFormState({ ...formState, sku: e.target.value })}
            />
          </div>

          <div className={styles.fieldCol}>
            <label htmlFor="prod-barcode" className={styles.label}>
              Barcode (EAN-13)
            </label>
            <input
              id="prod-barcode"
              type="text"
              className={styles.input}
              value={formState.barcode}
              onChange={(e) => setFormState({ ...formState, barcode: e.target.value })}
            />
          </div>

          <div className={styles.fieldCol}>
            <label htmlFor="prod-cat" className={styles.label}>
              Category
            </label>
            <select
              id="prod-cat"
              className={styles.select}
              value={formState.categoryId}
              onChange={(e) => setFormState({ ...formState, categoryId: e.target.value })}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldCol}>
            <label htmlFor="prod-unit" className={styles.label}>
              Unit of Measurement
            </label>
            <select
              id="prod-unit"
              className={styles.select}
              value={formState.unit}
              onChange={(e) =>
                setFormState({ ...formState, unit: e.target.value as UnitOfMeasure })
              }
            >
              {SUPPORTED_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldCol}>
            <label htmlFor="prod-supplier" className={styles.label}>
              Primary Supplier
            </label>
            <select
              id="prod-supplier"
              className={styles.select}
              value={formState.supplierId || ''}
              onChange={(e) => setFormState({ ...formState, supplierId: e.target.value })}
            >
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldCol}>
            <label htmlFor="prod-status" className={styles.label}>
              Product Status
            </label>
            <select
              id="prod-status"
              className={styles.select}
              value={formState.status || 'active'}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  status: e.target.value as ProductLifecycleStatus,
                })
              }
            >
              <option value="active">Active (Available in POS)</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className={styles.fieldCol}>
            <label htmlFor="prod-cost" className={styles.label}>
              Cost Price (₦)
            </label>
            <input
              id="prod-cost"
              type="number"
              min="0"
              className={styles.input}
              value={formState.costPrice}
              onChange={(e) =>
                setFormState({ ...formState, costPrice: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          <div className={styles.fieldCol}>
            <label htmlFor="prod-sell" className={styles.label}>
              Selling Price (₦)
            </label>
            <input
              id="prod-sell"
              type="number"
              min="0"
              className={styles.input}
              value={formState.sellingPrice}
              onChange={(e) =>
                setFormState({ ...formState, sellingPrice: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          {!editingProduct && (
            <div className={styles.fieldCol}>
              <label htmlFor="prod-stock" className={styles.label}>
                Initial Opening Stock ({formState.unit})
              </label>
              <input
                id="prod-stock"
                type="number"
                min="0"
                className={styles.input}
                value={formState.stockQuantity}
                onChange={(e) =>
                  setFormState({ ...formState, stockQuantity: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          )}

          <div className={styles.fieldCol}>
            <label htmlFor="prod-thresh" className={styles.label}>
              Minimum Stock Alert Threshold ({formState.unit})
            </label>
            <input
              id="prod-thresh"
              type="number"
              min="0"
              className={styles.input}
              value={formState.minStockThreshold}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  minStockThreshold: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className={styles.fieldFull}>
            <label htmlFor="prod-desc" className={styles.label}>
              Catalog Description
            </label>
            <input
              id="prod-desc"
              type="text"
              className={styles.input}
              value={formState.description}
              onChange={(e) => setFormState({ ...formState, description: e.target.value })}
            />
          </div>

          <div className={styles.fieldCol}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12.5px',
              }}
            >
              <input
                type="checkbox"
                checked={formState.allowFractional}
                onChange={(e) =>
                  setFormState({ ...formState, allowFractional: e.target.checked })
                }
              />
              <span>Allow fractional quantities (e.g. 0.5kg)</span>
            </label>
          </div>

          <div className={styles.fieldCol}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12.5px',
              }}
            >
              <input
                type="checkbox"
                checked={formState.trackExpiry}
                onChange={(e) => setFormState({ ...formState, trackExpiry: e.target.checked })}
              />
              <span>Track batch expiry dates</span>
            </label>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
