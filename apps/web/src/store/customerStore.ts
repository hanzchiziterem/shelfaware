import { create } from 'zustand';
import { Customer } from '../types/domain';
import { customerApi } from '../features/customers/services/customerApi';

interface CustomerState {
  customers: Customer[];
  isLoading: boolean;
  isCreateModalOpen: boolean;
  selectedCustomer: Customer | null;

  fetchCustomers: () => Promise<void>;
  createCustomer: (data: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'createdAt'>) => Promise<boolean>;
  setSelectedCustomer: (customer: Customer | null) => void;
  setCreateModalOpen: (open: boolean) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  isLoading: false,
  isCreateModalOpen: false,
  selectedCustomer: null,

  fetchCustomers: async () => {
    set({ isLoading: true });
    try {
      const customers = await customerApi.getCustomers();
      set({ customers, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createCustomer: async (data) => {
    try {
      const created = await customerApi.createCustomer(data);
      set((state) => ({
        customers: [created, ...state.customers],
        isCreateModalOpen: false,
      }));
      return true;
    } catch {
      return false;
    }
  },

  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
}));

