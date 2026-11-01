/**
 * Shared domain types for ShelfAware POS & Inventory Management SaaS.
 */

export type UserRole =
  | 'platform_admin'
  | 'super_business_admin'
  | 'administrator'
  | 'manager'
  | 'cashier';

export type AccountStatus = 'active' | 'inactive' | 'invited';

export type ProductLifecycleStatus = 'active' | 'draft' | 'archived';

export type UnitOfMeasure =
  | 'bag'
  | 'carton'
  | 'pack'
  | 'piece'
  | 'kg'
  | 'gram'
  | 'litre'
  | 'bottle'
  | 'tin'
  | 'crate';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'split';

export type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'failed';

export type SaleStatus = 'completed' | 'cancelled' | 'refunded';

export type OrderFulfillmentType = 'Walk-in' | 'Pickup' | 'Delivery';

export type PurchaseOrderStatus =
  | 'draft'
  | 'submitted'
  | 'ordered'
  | 'awaiting_delivery'
  | 'partially_received'
  | 'received'
  | 'cancelled';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: AccountStatus;
  businessId: string;
  lastActiveAt: string;
  avatarInitials: string;
}

export interface Business {
  id: string;
  name: string;
  type: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  currency: string;
  locale: string;
  logoText?: string;
  logoUrl?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  categoryName: string;
  description: string;
  unit: UnitOfMeasure;
  allowFractional: boolean;
  costPrice: number; // Stored in Naira (whole or 2-decimal precision)
  sellingPrice: number;
  stockQuantity: number;
  processedCount: number; // Items in active/recent processing as shown in reference UI
  minStockThreshold: number;
  supplierId?: string;
  supplierName?: string;
  trackExpiry: boolean;
  expiryDate?: string;
  batchNumber?: string;
  status: ProductLifecycleStatus;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type:
    | 'sale'
    | 'purchase_receive'
    | 'adjustment_add'
    | 'adjustment_remove'
    | 'void_return'
    | 'stocktake';
  quantityChange: number;
  previousBalance: number;
  newBalance: number;
  unit: UnitOfMeasure;
  reason: string;
  notes?: string;
  batchNumber?: string;
  performedBy: string;
  createdAt: string;
}

export interface StockBatch {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  batchNumber: string;
  expiryDate: string;
  receivedQuantity: number;
  remainingQuantity: number;
  unitCost: number;
  unit: UnitOfMeasure;
  receivedAt: string;
}

export interface StocktakeSession {
  id: string;
  reference: string;
  status: 'completed' | 'draft';
  countedBy: string;
  itemsCounted: number;
  discrepanciesFound: number;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  initials: string;
  phone: string;
  email: string;
  address?: string;
  totalSpent: number;
  ordersCount: number;
  lastTransactionDate?: string;
  notes?: string;
  isWalkIn?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  suppliedCategories: string[];
  totalPurchasesValue: number;
  outstandingPayable: number;
  lastSupplyDate: string;
  status: 'active' | 'inactive';
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  unit: UnitOfMeasure;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  subtotal: number;
}

export interface PaymentRecord {
  method: 'cash' | 'bank_transfer' | 'card';
  amount: number;
  reference?: string;
}

export interface Sale {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerInitials: string;
  customerEmail?: string;
  customerPhone?: string;
  fulfillmentType: OrderFulfillmentType;
  cashierId: string;
  cashierName: string;
  items: SaleItem[];
  itemsCount: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  payments: PaymentRecord[];
  amountReceived: number;
  changeGiven: number;
  paymentStatus: PaymentStatus;
  status: SaleStatus;
  notes?: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  sku: string;
  unit: UnitOfMeasure;
  orderedQuantity: number;
  receivedQuantity: number;
  unitCost: number;
  subtotal: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface PurchaseOrder {
  id: string;
  reference: string;
  supplierId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  items: PurchaseOrderItem[];
  totalCost: number;
  expectedDate: string;
  receivedAt?: string;
  createdBy: string;
  createdAt: string;
  notes?: string;
  discrepancyNotes?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: 'low_stock' | 'out_of_stock' | 'expiry' | 'sale' | 'purchase' | 'system';
  severity: 'info' | 'warning' | 'critical' | 'success';
  isRead: boolean;
  createdAt: string;
  actionPath?: string;
}

export interface BusinessSettings {
  businessName: string;
  productBrandName: string;
  businessType: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  locale: string;
  timezone: string;
  dateFormat: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: 'Plus Jakarta Sans' | 'DM Sans' | 'System Sans';
  themeMode: 'light' | 'dark';
  tableDensity: 'compact' | 'comfortable' | 'spacious';
  borderRadius: 'sharp' | 'standard' | 'rounded';
  receiptHeader: string;
  receiptFooter: string;
  receiptPaperWidth: '58mm' | '80mm';
  defaultPaymentMethod: 'cash' | 'bank_transfer' | 'card';
  taxPercentage: number;
  enableTax: boolean;
  defaultLowStockThreshold: number;
  enableExpiryAlerts: boolean;
  expiryWarningDays: number;
}
