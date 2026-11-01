import { create } from 'zustand';
import { posApi } from '@/features/pos/services/posApi';
import { normalizeApiError } from '@/services/api/apiErrors';
import type {
  OrderFulfillmentType,
  PaymentMethod,
  PaymentRecord,
  Product,
  Sale,
} from '@/types/common';
import {
  addAmounts,
  calculateCashChange,
  calculateDiscountAmount,
  calculateTaxAmount,
  multiplyAmount,
  subtractAmounts,
} from '@/utils/currency';
import { isValidSaleQuantity } from '@/utils/validation';

export interface PosCartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

interface PosState {
  cart: PosCartItem[];
  selectedCustomerId: string;
  fulfillmentType: OrderFulfillmentType;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  paymentMethod: PaymentMethod;
  cashTendered: number;
  splitCashAmount: number;
  splitTransferOrCardAmount: number;
  paymentReference: string;
  orderNotes: string;
  isSubmitting: boolean;
  lastCompletedSale: Sale | null;
  error: string | null;
  activeIdempotencyKey: string;

  addToCart: (product: Product, increment?: number) => { ok: boolean; message?: string };
  updateItemQuantity: (productId: string, nextQuantity: number) => { ok: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setSelectedCustomerId: (customerId: string) => void;
  setFulfillmentType: (type: OrderFulfillmentType) => void;
  setDiscount: (type: 'fixed' | 'percentage', value: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setCashTendered: (amount: number) => void;
  setSplitAmounts: (cash: number, other: number) => void;
  setPaymentReference: (ref: string) => void;
  setOrderNotes: (notes: string) => void;
  getTotals: (taxPercentage?: number, enableTax?: boolean) => {
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    grandTotal: number;
    amountTendered: number;
    changeDue: number;
  };
  submitSale: (params: {
    cashierId: string;
    cashierName: string;
    taxPercentage?: number;
    enableTax?: boolean;
  }) => Promise<Sale | null>;
  clearCompletedSale: () => void;
  clearError: () => void;
}

function generateIdempotencyKey(): string {
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  selectedCustomerId: 'cust-walkin',
  fulfillmentType: 'Walk-in',
  discountType: 'fixed',
  discountValue: 0,
  paymentMethod: 'cash',
  cashTendered: 0,
  splitCashAmount: 0,
  splitTransferOrCardAmount: 0,
  paymentReference: '',
  orderNotes: '',
  isSubmitting: false,
  lastCompletedSale: null,
  error: null,
  activeIdempotencyKey: generateIdempotencyKey(),

  addToCart: (product, increment = 1) => {
    const state = get();
    const existing = state.cart.find((item) => item.product.id === product.id);
    const nextQty = existing
      ? Number((existing.quantity + increment).toFixed(2))
      : increment;

    const validation = isValidSaleQuantity(
      nextQty,
      product.stockQuantity,
      product.allowFractional
    );
    if (!validation.valid) {
      set({ error: `${product.name}: ${validation.reason}` });
      return { ok: false, message: validation.reason };
    }

    const nextCart = existing
      ? state.cart.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                product,
                quantity: nextQty,
                subtotal: multiplyAmount(product.sellingPrice, nextQty),
              }
            : item
        )
      : [
          ...state.cart,
          {
            product,
            quantity: nextQty,
            subtotal: multiplyAmount(product.sellingPrice, nextQty),
          },
        ];

    set({
      cart: nextCart,
      error: null,
      activeIdempotencyKey: generateIdempotencyKey(),
    });
    return { ok: true };
  },

  updateItemQuantity: (productId, nextQuantity) => {
    const state = get();
    const existing = state.cart.find((item) => item.product.id === productId);
    if (!existing) return { ok: false, message: 'Item not in cart.' };

    if (nextQuantity <= 0) {
      get().removeFromCart(productId);
      return { ok: true };
    }

    const validation = isValidSaleQuantity(
      nextQuantity,
      existing.product.stockQuantity,
      existing.product.allowFractional
    );
    if (!validation.valid) {
      set({ error: `${existing.product.name}: ${validation.reason}` });
      return { ok: false, message: validation.reason };
    }

    set({
      cart: state.cart.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: nextQuantity,
              subtotal: multiplyAmount(item.product.sellingPrice, nextQuantity),
            }
          : item
      ),
      error: null,
      activeIdempotencyKey: generateIdempotencyKey(),
    });
    return { ok: true };
  },

  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
      error: null,
      activeIdempotencyKey: generateIdempotencyKey(),
    })),

  clearCart: () =>
    set({
      cart: [],
      discountValue: 0,
      cashTendered: 0,
      splitCashAmount: 0,
      splitTransferOrCardAmount: 0,
      paymentReference: '',
      orderNotes: '',
      error: null,
      activeIdempotencyKey: generateIdempotencyKey(),
    }),

  setSelectedCustomerId: (selectedCustomerId) => set({ selectedCustomerId }),
  setFulfillmentType: (fulfillmentType) => set({ fulfillmentType }),
  setDiscount: (discountType, discountValue) =>
    set({ discountType, discountValue: Math.max(0, discountValue) }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setCashTendered: (cashTendered) => set({ cashTendered: Math.max(0, cashTendered) }),
  setSplitAmounts: (splitCashAmount, splitTransferOrCardAmount) =>
    set({
      splitCashAmount: Math.max(0, splitCashAmount),
      splitTransferOrCardAmount: Math.max(0, splitTransferOrCardAmount),
    }),
  setPaymentReference: (paymentReference) => set({ paymentReference }),
  setOrderNotes: (orderNotes) => set({ orderNotes }),

  getTotals: (taxPercentage = 0, enableTax = false) => {
    const state = get();
    const subtotal = state.cart.reduce((acc, item) => addAmounts(acc, item.subtotal), 0);
    const discountAmount = calculateDiscountAmount(
      subtotal,
      state.discountType,
      state.discountValue
    );
    const afterDiscount = subtractAmounts(subtotal, discountAmount);
    const taxAmount = enableTax ? calculateTaxAmount(afterDiscount, taxPercentage) : 0;
    const grandTotal = addAmounts(afterDiscount, taxAmount);

    let amountTendered = grandTotal;
    if (state.paymentMethod === 'cash') {
      amountTendered = state.cashTendered > 0 ? state.cashTendered : grandTotal;
    } else if (state.paymentMethod === 'split') {
      amountTendered = addAmounts(state.splitCashAmount, state.splitTransferOrCardAmount);
    }

    const changeDue =
      state.paymentMethod === 'cash' ? calculateCashChange(grandTotal, amountTendered) : 0;

    return {
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal,
      amountTendered,
      changeDue,
    };
  },

  submitSale: async ({ cashierId, cashierName, taxPercentage = 0, enableTax = false }) => {
    const state = get();
    if (state.isSubmitting) return null;

    if (state.cart.length === 0) {
      set({ error: 'Cannot complete checkout with an empty cart.' });
      return null;
    }

    const totals = state.getTotals(taxPercentage, enableTax);

    let payments: PaymentRecord[] = [];
    if (state.paymentMethod === 'cash') {
      const cashAmt = state.cashTendered > 0 ? state.cashTendered : totals.grandTotal;
      if (cashAmt < totals.grandTotal) {
        set({
          error: `Cash received (₦${cashAmt.toLocaleString()}) is less than the grand total (₦${totals.grandTotal.toLocaleString()}).`,
        });
        return null;
      }
      payments = [{ method: 'cash', amount: cashAmt }];
    } else if (state.paymentMethod === 'bank_transfer') {
      payments = [
        {
          method: 'bank_transfer',
          amount: totals.grandTotal,
          reference: state.paymentReference || `NIP-${Date.now().toString().slice(-6)}`,
        },
      ];
    } else if (state.paymentMethod === 'card') {
      payments = [
        {
          method: 'card',
          amount: totals.grandTotal,
          reference: state.paymentReference || `POS-${Date.now().toString().slice(-6)}`,
        },
      ];
    } else if (state.paymentMethod === 'split') {
      const combined = addAmounts(state.splitCashAmount, state.splitTransferOrCardAmount);
      if (combined < totals.grandTotal) {
        set({
          error: `Split payment total (₦${combined.toLocaleString()}) must cover grand total (₦${totals.grandTotal.toLocaleString()}).`,
        });
        return null;
      }
      payments = [
        { method: 'cash', amount: state.splitCashAmount },
        {
          method: 'bank_transfer',
          amount: state.splitTransferOrCardAmount,
          reference: state.paymentReference || `SPL-${Date.now().toString().slice(-6)}`,
        },
      ];
    }

    set({ isSubmitting: true, error: null });
    try {
      const res = await posApi.submitCheckout({
        customerId: state.selectedCustomerId,
        fulfillmentType: state.fulfillmentType,
        cashierId,
        cashierName,
        items: state.cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        discount:
          state.discountValue > 0
            ? { type: state.discountType, value: state.discountValue }
            : undefined,
        paymentMethod: state.paymentMethod,
        payments,
        notes: state.orderNotes || undefined,
        idempotencyKey: state.activeIdempotencyKey,
      });

      // Clear cart only after authoritative checkout success
      set({
        cart: [],
        discountValue: 0,
        cashTendered: 0,
        splitCashAmount: 0,
        splitTransferOrCardAmount: 0,
        paymentReference: '',
        orderNotes: '',
        isSubmitting: false,
        lastCompletedSale: res.data,
        error: null,
        activeIdempotencyKey: generateIdempotencyKey(),
      });
      return res.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      // Preserve cart contents when checkout fails
      set({
        isSubmitting: false,
        error: normalized.message,
      });
      return null;
    }
  },

  clearCompletedSale: () => set({ lastCompletedSale: null }),
  clearError: () => set({ error: null }),
}));
