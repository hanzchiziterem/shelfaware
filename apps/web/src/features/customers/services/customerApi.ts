import { loadMockDb, saveMockDb } from '@/mocks/mockDb';
import { API_CONFIG } from '@/services/api/apiConfig';
import { API_ENDPOINTS, type ApiResponse } from '@/services/api/apiTypes';
import { axiosInstance } from '@/services/api/axiosInstance';
import type { Customer } from '@/types/common';
import { getInitials } from '@/utils/formatters';

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  email: string;
  address?: string;
  notes?: string;
}

export const customerApi = {
  async getCustomers(): Promise<ApiResponse<Customer[]>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.get<ApiResponse<Customer[]>>(
        API_ENDPOINTS.CUSTOMERS.BASE
      );
      return data;
    }

    const db = loadMockDb();
    return {
      success: true,
      data: [...db.customers],
    };
  },

  async createCustomer(payload: CreateCustomerPayload): Promise<ApiResponse<Customer>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.post<ApiResponse<Customer>>(
        API_ENDPOINTS.CUSTOMERS.BASE,
        payload
      );
      return data;
    }

    const db = loadMockDb();
    const newCustomer: Customer = {
      id: `cust-${Date.now().toString().slice(-4)}`,
      name: payload.name.trim(),
      initials: getInitials(payload.name),
      phone: payload.phone.trim(),
      email: payload.email.trim(),
      address: payload.address?.trim(),
      notes: payload.notes?.trim(),
      totalSpent: 0,
      ordersCount: 0,
    };

    db.customers.push(newCustomer);
    saveMockDb(db);

    return {
      success: true,
      data: newCustomer,
    };
  },

  async updateCustomer(
    customerId: string,
    payload: Partial<CreateCustomerPayload>
  ): Promise<ApiResponse<Customer>> {
    const db = loadMockDb();
    const idx = db.customers.findIndex((c) => c.id === customerId);
    if (idx === -1) throw new Error('Customer not found.');

    db.customers[idx] = {
      ...db.customers[idx],
      ...payload,
      initials: payload.name ? getInitials(payload.name) : db.customers[idx].initials,
    };
    saveMockDb(db);

    return {
      success: true,
      data: { ...db.customers[idx] },
    };
  },
};
