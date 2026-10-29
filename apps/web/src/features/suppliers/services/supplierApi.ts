import { apiClient } from '../../../services/api/axiosInstance';
import { API_CONFIG } from '../../../services/api/apiConfig';
import { Supplier } from '../../../types/domain';
import { mockStorage } from '../../../mocks/mockStorage';

export const supplierApi = {
  async getSuppliers(): Promise<Supplier[]> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 100));
      return mockStorage.getSuppliers();
    }
    const res = await apiClient.get<Supplier[]>('/suppliers');
    return res.data;
  },

  async createSupplier(data: Omit<Supplier, 'id' | 'totalPurchases' | 'balancePayable' | 'createdAt'>): Promise<Supplier> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 150));
      const suppliers = mockStorage.getSuppliers();
      const newSupplier: Supplier = {
        ...data,
        id: `sup-${Date.now()}`,
        totalPurchases: 0,
        balancePayable: 0,
        createdAt: new Date().toISOString(),
      };
      suppliers.unshift(newSupplier);
      mockStorage.saveSuppliers(suppliers);
      return newSupplier;
    }
    const res = await apiClient.post<Supplier>('/suppliers', data);
    return res.data;
  },

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    if (API_CONFIG.useMockApi) {
      const suppliers = mockStorage.getSuppliers();
      const idx = suppliers.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error('Supplier not found');
      const updated = { ...suppliers[idx], ...data };
      suppliers[idx] = updated;
      mockStorage.saveSuppliers(suppliers);
      return updated;
    }
    const res = await apiClient.patch<Supplier>(`/suppliers/${id}`, data);
    return res.data;
  },
};

