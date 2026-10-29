import { ApiResponse, PaginatedResponse } from '../../types/common';
import { User, Business } from '../../types/domain';

// Re-export standard response types
export type { ApiResponse, PaginatedResponse };

// Auth API types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  businessName: string;
  businessType: string;
}

export interface AuthResponse {
  user: User;
  business: Business;
  accessToken?: string;
}

export interface OnboardingRequest {
  businessName: string;
  businessType: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  locale: string;
}

// Product API types
export interface ProductFilterParams {
  search?: string;
  categoryId?: string;
  stockStatus?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateProductPayload {
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  categoryName: string;
  description?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStockThreshold: number;
  supplierId?: string;
  trackExpiry: boolean;
  expiryDate?: string;
  batchNumber?: string;
}

// POS Checkout types
export interface CheckoutRequestItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CheckoutPayment {
  method: 'cash' | 'card' | 'bank_transfer';
  amount: number;
  reference?: string;
}

export interface CheckoutRequest {
  customerId?: string;
  customerName?: string;
  items: CheckoutRequestItem[];
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  payments: CheckoutPayment[];
  amountReceived: number;
  changeDue: number;
  notes?: string;
  idempotencyKey: string;
}

// Inventory Adjustment types
export interface StockAdjustmentPayload {
  productId: string;
  quantityChange: number;
  reason: string;
  type: 'adjustment_in' | 'adjustment_out' | 'damage' | 'expiry_writeoff' | 'stocktake_adjustment';
  notes?: string;
}

// Purchase Order types
export interface CreatePurchasePayload {
  supplierId: string;
  items: Array<{
    productId: string;
    orderedQuantity: number;
    unitCost: number;
  }>;
  expectedDate?: string;
  notes?: string;
}
