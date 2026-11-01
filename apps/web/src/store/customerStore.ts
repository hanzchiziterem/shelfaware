import { create } from 'zustand';
import {
  customerApi,
  type CreateCustomerPayload,
} from '@/features/customers/services/customerApi';
import { normalizeApiError } from '@/services/api/apiErrors';
import type { Customer } from '@/types/common';

interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  isLoading: boolean;
  error: string | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  fetchCustomers: () => Promise<void>;
  createCustomer: (payload: CreateCustomerPayload) => Promise<Customer | null>;
  updateCustomer: (
    customerId: string,
    payload: Partial<CreateCustomerPayload>
  ) => Promise<boolean>;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  selectedCustomer: null,
  isLoading: false,
  error: null,

  setSelectedCustomer: (selectedCustomer) => set({ selectedCustomer }),

  fetchCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await customerApi.getCustomers();
      set({ customers: res.data, isLoading: false });
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message, isLoading: false });
    }
  },

  createCustomer: async (payload) => {
    set({ error: null });
    try {
      const res = await customerApi.createCustomer(payload);
      set((state) => ({
        customers: [...state.customers, res.data],
        selectedCustomer: res.data,
      }));
      return res.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message });
      return null;
    }
  },

  updateCustomer: async (customerId, payload) => {
    set({ error: null });
    try {
      const res = await customerApi.updateCustomer(customerId, payload);
      set((state) => ({
        customers: state.customers.map((c) => (c.id === customerId ? res.data : c)),
        selectedCustomer:
          state.selectedCustomer?.id === customerId ? res.data : state.selectedCustomer,
      }));
      return true;
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message });
      return false;
    }
  },
}));
