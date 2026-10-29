import { Product, Sale, Customer, Supplier, StockMovement, PurchaseOrder, StockBatch, AppNotification, BusinessSettings } from '../types/domain';
import { MOCK_PRODUCTS } from './products';
import { MOCK_SALES, generateMockSales } from './sales';
import { MOCK_CUSTOMERS } from './customers';
import { MOCK_SUPPLIERS } from './suppliers';
import { MOCK_MOVEMENTS, MOCK_BATCHES, MOCK_PURCHASE_ORDERS } from './inventory';
import { defaultBranding } from '../config/branding';

const STORAGE_KEYS = {
  PRODUCTS: 'shelfaware_products_v1',
  SALES: 'shelfaware_sales_v1',
  CUSTOMERS: 'shelfaware_customers_v1',
  SUPPLIERS: 'shelfaware_suppliers_v1',
  MOVEMENTS: 'shelfaware_movements_v1',
  BATCHES: 'shelfaware_batches_v1',
  PURCHASES: 'shelfaware_purchases_v1',
  NOTIFICATIONS: 'shelfaware_notifications_v1',
  SETTINGS: 'shelfaware_settings_v1',
};

const DEFAULT_SETTINGS: BusinessSettings = {
  business: {
    id: 'biz-001',
    name: 'Adeola Foods & Provisions',
    type: 'Retail Foodstuff & Provisions',
    email: 'info@adeolafoods.ng',
    phone: '+234 802 345 6789',
    address: '14 Broad Street, Lagos Island',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    currency: 'NGN',
    currencySymbol: '₦',
    locale: 'en-NG',
  },
  branding: {
    productName: defaultBranding.productName,
    brandColor: defaultBranding.brandColor,
    sidebarBg: defaultBranding.sidebarBg,
    tableDensity: defaultBranding.tableDensity,
    fontFamily: defaultBranding.fontFamily,
    borderRadius: defaultBranding.borderRadius,
  },
  pos: {
    allowNegativeStock: false,
    defaultPaymentMethod: 'cash',
    printReceiptAutomatically: false,
    receiptHeader: 'Adeola Foods & Provisions\nDealers in Rice, Oil, Grains & Groceries',
    receiptFooter: 'Thank you for your patronage!\nGoods sold in good condition are not returnable.',
    taxRate: 7.5,
    enableTax: false,
  },
  inventory: {
    defaultLowStockThreshold: 5,
    expiryAlertDays: 30,
    enableExpiryTracking: true,
  },
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: 'Titus Sardines (Pack of 50) has only 2 units remaining (below threshold 5).',
    isRead: false,
    link: '/inventory',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'notif-2',
    type: 'expiring_stock',
    title: 'Expiry Warning',
    message: 'Frozen Chicken Wings Batch CHK-2026-11 expires in 23 days.',
    isRead: false,
    link: '/inventory/expiry',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'notif-3',
    type: 'new_sale',
    title: 'High-Value Sale Completed',
    message: 'Alhaja Kudirat Balogun purchased items worth ₦266,000 via Bank Transfer.',
    isRead: true,
    link: '/sales',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
];

class MockStorageService {
  private isBrowser = typeof window !== 'undefined';

  private get<T>(key: string, fallback: T): T {
    if (!this.isBrowser) return fallback;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Mock storage set error:', e);
    }
  }

  public init() {
    if (!this.isBrowser) return;
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.set(STORAGE_KEYS.PRODUCTS, MOCK_PRODUCTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
      this.set(STORAGE_KEYS.SALES, MOCK_SALES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      this.set(STORAGE_KEYS.CUSTOMERS, MOCK_CUSTOMERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
      this.set(STORAGE_KEYS.SUPPLIERS, MOCK_SUPPLIERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MOVEMENTS)) {
      this.set(STORAGE_KEYS.MOVEMENTS, MOCK_MOVEMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BATCHES)) {
      this.set(STORAGE_KEYS.BATCHES, MOCK_BATCHES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PURCHASES)) {
      this.set(STORAGE_KEYS.PURCHASES, MOCK_PURCHASE_ORDERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.set(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
  }

  public getProducts(): Product[] {
    return this.get<Product[]>(STORAGE_KEYS.PRODUCTS, MOCK_PRODUCTS);
  }

  public saveProducts(products: Product[]): void {
    this.set(STORAGE_KEYS.PRODUCTS, products);
  }

  public getSales(): Sale[] {
    return this.get<Sale[]>(STORAGE_KEYS.SALES, MOCK_SALES);
  }

  public saveSales(sales: Sale[]): void {
    this.set(STORAGE_KEYS.SALES, sales);
  }

  public getCustomers(): Customer[] {
    return this.get<Customer[]>(STORAGE_KEYS.CUSTOMERS, MOCK_CUSTOMERS);
  }

  public saveCustomers(customers: Customer[]): void {
    this.set(STORAGE_KEYS.CUSTOMERS, customers);
  }

  public getSuppliers(): Supplier[] {
    return this.get<Supplier[]>(STORAGE_KEYS.SUPPLIERS, MOCK_SUPPLIERS);
  }

  public saveSuppliers(suppliers: Supplier[]): void {
    this.set(STORAGE_KEYS.SUPPLIERS, suppliers);
  }

  public getMovements(): StockMovement[] {
    return this.get<StockMovement[]>(STORAGE_KEYS.MOVEMENTS, MOCK_MOVEMENTS);
  }

  public saveMovements(movements: StockMovement[]): void {
    this.set(STORAGE_KEYS.MOVEMENTS, movements);
  }

  public getBatches(): StockBatch[] {
    return this.get<StockBatch[]>(STORAGE_KEYS.BATCHES, MOCK_BATCHES);
  }

  public saveBatches(batches: StockBatch[]): void {
    this.set(STORAGE_KEYS.BATCHES, batches);
  }

  public getPurchases(): PurchaseOrder[] {
    return this.get<PurchaseOrder[]>(STORAGE_KEYS.PURCHASES, MOCK_PURCHASE_ORDERS);
  }

  public savePurchases(purchases: PurchaseOrder[]): void {
    this.set(STORAGE_KEYS.PURCHASES, purchases);
  }

  public getNotifications(): AppNotification[] {
    return this.get<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  public saveNotifications(notifications: AppNotification[]): void {
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  public getSettings(): BusinessSettings {
    return this.get<BusinessSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  public saveSettings(settings: BusinessSettings): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
  }

  // =========================================================================
  // RELATIONAL TRANSACTION METHODS (Full In-Memory / LocalStorage Data Integrity)
  // =========================================================================

  /**
   * Records a sale atomically with cascading data integrity:
   * 1. Deducts product stock for every item purchased
   * 2. Logs auditable StockMovements of type 'sale'
   * 3. Updates Customer aggregate stats (totalOrders, totalSpent, lastPurchaseDate)
   * 4. Prepends the Sale entity to sales storage
   */
  public recordSale(sale: Sale): Sale {
    const products = this.getProducts();
    const movements = this.getMovements();
    const customers = this.getCustomers();
    const sales = this.getSales();

    // 1. Deduct product current stock & log movements
    sale.items.forEach((item) => {
      const prodIdx = products.findIndex((p) => p.id === item.productId);
      if (prodIdx !== -1) {
        const prod = products[prodIdx];
        const prevStock = prod.currentStock;
        const newStock = Math.max(0, prevStock - item.quantity);
        products[prodIdx] = {
          ...prod,
          currentStock: newStock,
          updatedAt: new Date().toISOString(),
        };

        const movement: StockMovement = {
          id: `mov-${Date.now()}-${item.productId}`,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: 'sale',
          quantityChange: -item.quantity,
          previousStock: prevStock,
          newStock,
          reason: `Customer Sale ${sale.transactionNumber}`,
          referenceId: sale.transactionNumber,
          performedByUserId: sale.cashierId || 'usr-001',
          performedByUserName: sale.cashierName || 'Cashier',
          createdAt: sale.createdAt || new Date().toISOString(),
        };
        movements.unshift(movement);
      }
    });

    // 2. Update Customer totals
    if (sale.customerId) {
      const custIdx = customers.findIndex((c) => c.id === sale.customerId);
      if (custIdx !== -1) {
        customers[custIdx] = {
          ...customers[custIdx],
          totalOrders: customers[custIdx].totalOrders + 1,
          totalSpent: customers[custIdx].totalSpent + sale.totalAmount,
          lastPurchaseDate: sale.createdAt || new Date().toISOString(),
        };
      }
    }

    // 3. Prepend Sale
    sales.unshift(sale);

    // 4. Persist all tables atomically
    this.saveProducts(products);
    this.saveMovements(movements);
    this.saveCustomers(customers);
    this.saveSales(sales);

    return sale;
  }

  /**
   * Voids a sale atomically with cascading inventory and customer reversal:
   * 1. Restores product currentStock for each returned item
   * 2. Logs auditable StockMovements of type 'return'
   * 3. Decrements Customer totalSpent and totalOrders
   * 4. Updates Sale status to 'voided' and records reason notes
   */
  public voidSale(saleId: string, reason: string): Sale {
    const sales = this.getSales();
    const saleIdx = sales.findIndex((s) => s.id === saleId);
    if (saleIdx === -1) {
      throw new Error(`Sale not found: ${saleId}`);
    }

    const sale = sales[saleIdx];
    if (sale.status === 'voided') {
      return sale; // Already voided
    }

    const products = this.getProducts();
    const movements = this.getMovements();
    const customers = this.getCustomers();

    // 1. Restore product stock & log return movements if it was completed
    if (sale.status === 'completed') {
      sale.items.forEach((item) => {
        const prodIdx = products.findIndex((p) => p.id === item.productId);
        if (prodIdx !== -1) {
          const prod = products[prodIdx];
          const prevStock = prod.currentStock;
          const newStock = prevStock + item.quantity;
          products[prodIdx] = {
            ...prod,
            currentStock: newStock,
            updatedAt: new Date().toISOString(),
          };

          const movement: StockMovement = {
            id: `mov-${Date.now()}-${item.productId}`,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            type: 'return',
            quantityChange: item.quantity,
            previousStock: prevStock,
            newStock,
            reason: `Voided Sale ${sale.transactionNumber}: ${reason}`,
            referenceId: sale.transactionNumber,
            performedByUserId: 'usr-001',
            performedByUserName: 'Adeola Adeleke (Admin)',
            createdAt: new Date().toISOString(),
          };
          movements.unshift(movement);
        }
      });

      // 2. Revert customer aggregates
      if (sale.customerId) {
        const custIdx = customers.findIndex((c) => c.id === sale.customerId);
        if (custIdx !== -1) {
          customers[custIdx] = {
            ...customers[custIdx],
            totalSpent: Math.max(0, customers[custIdx].totalSpent - sale.totalAmount),
            totalOrders: Math.max(0, customers[custIdx].totalOrders - 1),
          };
        }
      }
    }

    // 3. Mark voided
    const updatedSale: Sale = {
      ...sale,
      status: 'voided',
      notes: reason ? `${sale.notes ? sale.notes + ' | ' : ''}Voided: ${reason}` : sale.notes,
    };
    sales[saleIdx] = updatedSale;

    // 4. Persist
    this.saveProducts(products);
    this.saveMovements(movements);
    this.saveCustomers(customers);
    this.saveSales(sales);

    return updatedSale;
  }

  /**
   * Deletes a sale with cascading reversal if it was active
   */
  public deleteSale(saleId: string): boolean {
    const sales = this.getSales();
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return false;

    // If active completed sale, void it first to safely restore stock and customer stats
    if (sale.status === 'completed') {
      this.voidSale(saleId, 'Sale deleted by administrative action');
    }

    // Remove from array
    const remainingSales = this.getSales().filter((s) => s.id !== saleId);
    this.saveSales(remainingSales);
    return true;
  }

  /**
   * Deletes a product cleanly from inventory
   */
  public deleteProduct(productId: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== productId);
    if (filtered.length === products.length) return false;
    this.saveProducts(filtered);
    return true;
  }

  /**
   * Receives a Purchase Order, adding items to stock and updating supplier totals
   */
  public receivePurchase(poId: string): PurchaseOrder {
    const purchases = this.getPurchases();
    const poIdx = purchases.findIndex((p) => p.id === poId);
    if (poIdx === -1) throw new Error('Purchase order not found');

    const po = purchases[poIdx];
    if (po.status === 'received') return po;

    const products = this.getProducts();
    const movements = this.getMovements();
    const suppliers = this.getSuppliers();

    // 1. Add to stock
    const updatedItems = po.items.map((it) => {
      const prodIdx = products.findIndex((p) => p.id === it.productId);
      if (prodIdx !== -1) {
        const prod = products[prodIdx];
        const prev = prod.currentStock;
        const newQty = prev + it.orderedQuantity;
        products[prodIdx] = {
          ...prod,
          currentStock: newQty,
          updatedAt: new Date().toISOString(),
        };

        const mov: StockMovement = {
          id: `mov-${Date.now()}-${it.productId}`,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: 'purchase_received',
          quantityChange: it.orderedQuantity,
          previousStock: prev,
          newStock: newQty,
          reason: `Received PO ${po.poNumber}`,
          referenceId: po.poNumber,
          performedByUserId: 'usr-001',
          performedByUserName: 'Adeola Adeleke (Admin)',
          createdAt: new Date().toISOString(),
        };
        movements.unshift(mov);
      }
      return { ...it, receivedQuantity: it.orderedQuantity };
    });

    // 2. Update Supplier totalPurchases
    if (po.supplierId) {
      const supIdx = suppliers.findIndex((s) => s.id === po.supplierId);
      if (supIdx !== -1) {
        suppliers[supIdx] = {
          ...suppliers[supIdx],
          totalPurchases: suppliers[supIdx].totalPurchases + po.totalCost,
        };
      }
    }

    // 3. Mark PO received
    const updatedPO: PurchaseOrder = {
      ...po,
      items: updatedItems,
      status: 'received',
      paymentStatus: 'paid',
      receivedDate: new Date().toISOString(),
    };
    purchases[poIdx] = updatedPO;

    this.savePurchases(purchases);
    this.saveProducts(products);
    this.saveMovements(movements);
    this.saveSuppliers(suppliers);

    return updatedPO;
  }

  /**
   * Adjusts stock manually and logs movement
   */
  public adjustStock(payload: {
    productId: string;
    quantityChange: number;
    type: any;
    reason: string;
    notes?: string;
  }): StockMovement {
    const products = this.getProducts();
    const movements = this.getMovements();

    const prodIdx = products.findIndex((p) => p.id === payload.productId);
    if (prodIdx === -1) throw new Error('Product not found for adjustment.');

    const product = products[prodIdx];
    const prevStock = product.currentStock;
    const newStock = Math.max(0, prevStock + payload.quantityChange);

    products[prodIdx] = {
      ...product,
      currentStock: newStock,
      updatedAt: new Date().toISOString(),
    };

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: payload.type,
      quantityChange: payload.quantityChange,
      previousStock: prevStock,
      newStock,
      reason: payload.reason,
      notes: payload.notes,
      performedByUserId: 'usr-001',
      performedByUserName: 'Adeola Adeleke (Admin)',
      createdAt: new Date().toISOString(),
    };

    movements.unshift(movement);
    this.saveProducts(products);
    this.saveMovements(movements);

    return movement;
  }

  public resetToDefaults(): void {
    if (!this.isBrowser) return;
    this.set(STORAGE_KEYS.PRODUCTS, MOCK_PRODUCTS);
    this.set(STORAGE_KEYS.SALES, generateMockSales());
    this.set(STORAGE_KEYS.CUSTOMERS, MOCK_CUSTOMERS);
    this.set(STORAGE_KEYS.SUPPLIERS, MOCK_SUPPLIERS);
    this.set(STORAGE_KEYS.MOVEMENTS, MOCK_MOVEMENTS);
    this.set(STORAGE_KEYS.BATCHES, MOCK_BATCHES);
    this.set(STORAGE_KEYS.PURCHASES, MOCK_PURCHASE_ORDERS);
    this.set(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }
}

export const mockStorage = new MockStorageService();
mockStorage.init();

