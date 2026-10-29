/**
 * Domain entity types for ShelfAware POS & Inventory Management SaaS.
 * High-fidelity, strictly typed domain models.
 */

export type Role = 'admin' | 'manager' | 'cashier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  avatarUrl?: string;
  phone?: string;
  lastActive?: string;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  legalName?: string;
  type: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  currency: string;
  currencySymbol: string;
  locale: string;
  logoUrl?: string;
  taxNumber?: string;
}

export type UnitOfMeasure =
  | 'bag'
  | 'carton'
  | 'paint'
  | 'kg'
  | 'gram'
  | 'litre'
  | 'bottle'
  | 'pack'
  | 'piece'
  | 'roll';

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  productCount: number;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  categoryName: string;
  description?: string;
  unit: UnitOfMeasure;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStockThreshold: number;
  supplierId?: string;
  supplierName?: string;
  trackExpiry: boolean;
  expiryDate?: string; // Next expiring batch date
  batchNumber?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType =
  | 'sale'
  | 'purchase_received'
  | 'adjustment_in'
  | 'adjustment_out'
  | 'damage'
  | 'expiry_writeoff'
  | 'stocktake_adjustment'
  | 'return';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: StockMovementType;
  quantityChange: number; // positive or negative
  previousStock: number;
  newStock: number;
  reason: string;
  referenceId?: string; // sale ID, purchase ID, or adjustment ID
  notes?: string;
  performedByUserId: string;
  performedByUserName: string;
  createdAt: string;
}

export interface StockBatch {
  id: string;
  productId: string;
  productName: string;
  batchNumber: string;
  receivedDate: string;
  expiryDate: string;
  initialQuantity: number;
  remainingQuantity: number;
  costPrice: number;
  status: 'active' | 'expiring_soon' | 'expired' | 'depleted';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  lastPurchaseDate?: string;
  createdAt: string;
  isWalkIn?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  suppliedCategories: string[];
  totalPurchases: number;
  balancePayable: number;
  isActive: boolean;
  createdAt: string;
}

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'split';
export type SaleStatus = 'completed' | 'voided' | 'refunded' | 'pending';

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unit: UnitOfMeasure;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PaymentBreakdown {
  method: 'cash' | 'card' | 'bank_transfer';
  amount: number;
  reference?: string;
}

export interface Sale {
  id: string;
  transactionNumber: string;
  cashierId: string;
  cashierName: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountReceived: number;
  changeDue: number;
  paymentMethod: PaymentMethod;
  paymentDetails: PaymentBreakdown[];
  orderType?: 'delivery' | 'store_pickup';
  status: SaleStatus;
  createdAt: string;
  notes?: string;
}

export type PurchaseOrderStatus = 'draft' | 'pending' | 'received' | 'partial' | 'cancelled';

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unit: UnitOfMeasure;
  orderedQuantity: number;
  receivedQuantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalCost: number;
  status: PurchaseOrderStatus;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  expectedDate?: string;
  receivedDate?: string;
  notes?: string;
  createdAt: string;
}

export type NotificationType =
  | 'low_stock'
  | 'out_of_stock'
  | 'expiring_stock'
  | 'new_sale'
  | 'purchase_received'
  | 'adjustment'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface BusinessSettings {
  business: Business;
  branding: {
    productName: string;
    brandColor: string;
    sidebarBg: string;
    tableDensity: 'compact' | 'normal' | 'relaxed';
    fontFamily: string;
    borderRadius: string;
  };
  pos: {
    allowNegativeStock: boolean;
    defaultPaymentMethod: PaymentMethod;
    printReceiptAutomatically: boolean;
    receiptHeader: string;
    receiptFooter: string;
    taxRate: number;
    enableTax: boolean;
  };
  inventory: {
    defaultLowStockThreshold: number;
    expiryAlertDays: number;
    enableExpiryTracking: boolean;
  };
}

