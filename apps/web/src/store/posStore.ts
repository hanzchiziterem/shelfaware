import { create } from 'zustand';
import { Product, Customer, PaymentMethod, Sale } from '../types/domain';
import { posApi } from '../features/pos/services/posApi';
import { CheckoutPayment } from '../services/api/apiTypes';
import { calculateChangeDue } from '../utils/currency';

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface PosState {
  cart: CartItem[];
  selectedCustomer: Customer | null;
  searchQuery: string;
  selectedCategory: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  paymentMethod: PaymentMethod;
  amountReceived: number;
  notes: string;
  isProcessing: boolean;
  error: string | null;
  lastCompletedSale: Sale | null;
  isReceiptModalOpen: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  setDiscount: (type: 'percentage' | 'fixed', value: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setAmountReceived: (amount: number) => void;
  setNotes: (notes: string) => void;
  processCheckout: () => Promise<boolean>;
  openReceiptModal: (sale: Sale) => void;
  closeReceiptModal: () => void;
  resetPos: () => void;

  // Computed helpers
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getGrandTotal: () => number;
  getChangeDue: () => number;
}

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  selectedCustomer: null,
  searchQuery: '',
  selectedCategory: 'all',
  discountType: 'fixed',
  discountValue: 0,
  paymentMethod: 'cash',
  amountReceived: 0,
  notes: '',
  isProcessing: false,
  error: null,
  lastCompletedSale: null,
  isReceiptModalOpen: false,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  addToCart: (product: Product, qty = 1) => {
    if (product.currentStock <= 0) return;
    const { cart } = get();
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      const existing = cart[existingIndex];
      const newQty = Math.min(product.currentStock, existing.quantity + qty);
      const updated = [...cart];
      updated[existingIndex] = {
        ...existing,
        quantity: newQty,
        subtotal: newQty * existing.unitPrice,
      };
      set({ cart: updated, error: null });
    } else {
      const initialQty = Math.min(product.currentStock, Math.max(1, qty));
      set({
        cart: [
          ...cart,
          {
            product,
            quantity: initialQty,
            unitPrice: product.sellingPrice,
            subtotal: initialQty * product.sellingPrice,
          },
        ],
        error: null,
      });
    }
  },

  updateQuantity: (productId: string, quantity: number) => {
    const { cart } = get();
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    const updated = cart.map((item) => {
      if (item.product.id === productId) {
        const safeQty = Math.min(item.product.currentStock, quantity);
        return {
          ...item,
          quantity: safeQty,
          subtotal: safeQty * item.unitPrice,
        };
      }
      return item;
    });
    set({ cart: updated });
  },

  removeFromCart: (productId: string) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    }));
  },

  clearCart: () => {
    set({
      cart: [],
      discountValue: 0,
      amountReceived: 0,
      notes: '',
      error: null,
    });
  },

  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  setDiscount: (discountType, discountValue) => set({ discountType, discountValue }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setAmountReceived: (amountReceived) => set({ amountReceived }),
  setNotes: (notes) => set({ notes }),

  getSubtotal: () => {
    return get().cart.reduce((acc, item) => acc + item.subtotal, 0);
  },

  getDiscountAmount: () => {
    const subtotal = get().getSubtotal();
    const { discountType, discountValue } = get();
    if (!discountValue || discountValue <= 0) return 0;
    if (discountType === 'percentage') {
      return (subtotal * Math.min(100, discountValue)) / 100;
    }
    return Math.min(subtotal, discountValue);
  },

  getGrandTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    return Math.max(0, subtotal - discount);
  },

  getChangeDue: () => {
    const total = get().getGrandTotal();
    const received = get().amountReceived;
    if (get().paymentMethod !== 'cash') return 0;
    return calculateChangeDue(total, received);
  },

  processCheckout: async () => {
    const { cart, paymentMethod, amountReceived, notes, selectedCustomer, discountType, discountValue } = get();
    const grandTotal = get().getGrandTotal();

    if (cart.length === 0) {
      set({ error: 'Cart is empty. Add products before checkout.' });
      return false;
    }

    if (paymentMethod === 'cash' && amountReceived < grandTotal) {
      set({ error: `Amount received (₦${amountReceived.toLocaleString()}) is less than total (₦${grandTotal.toLocaleString()}).` });
      return false;
    }

    try {
      set({ isProcessing: true, error: null });

      const payments: CheckoutPayment[] = [
        {
          method: paymentMethod === 'split' ? 'cash' : (paymentMethod as 'cash' | 'card' | 'bank_transfer'),
          amount: grandTotal,
        },
      ];

      const idempotencyKey = `pos-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const completedSale = await posApi.processCheckout({
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        discount: discountValue > 0 ? { type: discountType, value: discountValue } : undefined,
        payments,
        amountReceived: paymentMethod === 'cash' ? amountReceived : grandTotal,
        changeDue: paymentMethod === 'cash' ? calculateChangeDue(grandTotal, amountReceived) : 0,
        notes,
        idempotencyKey,
      });

      // Clear cart on success & open receipt preview modal
      set({
        cart: [],
        amountReceived: 0,
        discountValue: 0,
        notes: '',
        isProcessing: false,
        lastCompletedSale: completedSale,
        isReceiptModalOpen: true,
      });

      return true;
    } catch (err: any) {
      set({
        isProcessing: false,
        error: err.message || 'Checkout failed. Please try again.',
      });
      return false;
    }
  },

  openReceiptModal: (sale: Sale) => set({ lastCompletedSale: sale, isReceiptModalOpen: true }),
  closeReceiptModal: () => set({ isReceiptModalOpen: false }),

  resetPos: () => {
    set({
      cart: [],
      selectedCustomer: null,
      discountValue: 0,
      amountReceived: 0,
      notes: '',
      error: null,
      isReceiptModalOpen: false,
      lastCompletedSale: null,
    });
  },
}));

