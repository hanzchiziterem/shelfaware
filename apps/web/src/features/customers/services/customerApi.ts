import { apiClient } from '../../../services/api/axiosInstance';
import { API_CONFIG } from '../../../services/api/apiConfig';
import { Customer } from '../../../types/domain';
import { mockStorage } from '../../../mocks/mockStorage';

export const customerApi = {
  async getCustomers(): Promise<Customer[]> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 100));
      return mockStorage.getCustomers();
    }
    const res = await apiClient.get<Customer[]>('/customers');
    return res.data;
  },

  async createCustomer(data: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'createdAt'>): Promise<Customer> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 150));
      const customers = mockStorage.getCustomers();
      const newCust: Customer = {
        ...data,
        id: `cust-${Date.now()}`,
        totalOrders: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
      };
      customers.push(newCust);
      mockStorage.saveCustomers(customers);
      return newCust;
    }
    const res = await apiClient.post<Customer>('/customers', data);
    return res.data;
  },
};

