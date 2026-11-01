import { loadMockDb, saveMockDb } from '@/mocks/mockDb';
import { API_CONFIG } from '@/services/api/apiConfig';
import { API_ENDPOINTS, type ApiResponse } from '@/services/api/apiTypes';
import { axiosInstance } from '@/services/api/axiosInstance';
import type { Supplier } from '@/types/common';

export interface CreateSupplierPayload {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  suppliedCategories: string[];
  outstandingPayable?: number;
}

export const supplierApi = {
  async getSuppliers(): Promise<ApiResponse<Supplier[]>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.get<ApiResponse<Supplier[]>>(
        API_ENDPOINTS.SUPPLIERS.BASE
      );
      return data;
    }

    const db = loadMockDb();
    return {
      success: true,
      data: [...db.suppliers],
    };
  },

  async createSupplier(payload: CreateSupplierPayload): Promise<ApiResponse<Supplier>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.post<ApiResponse<Supplier>>(
        API_ENDPOINTS.SUPPLIERS.BASE,
        payload
      );
      return data;
    }

    const db = loadMockDb();
    const newSupplier: Supplier = {
      id: `sup-${Date.now().toString().slice(-4)}`,
      name: payload.name.trim(),
      contactPerson: payload.contactPerson.trim(),
      phone: payload.phone.trim(),
      email: payload.email.trim(),
      address: payload.address.trim(),
      suppliedCategories: payload.suppliedCategories.length
        ? payload.suppliedCategories
        : ['Grains & Staples'],
      totalPurchasesValue: 0,
      outstandingPayable: Number(payload.outstandingPayable || 0),
      lastSupplyDate: new Date().toISOString(),
      status: 'active',
    };

    db.suppliers.unshift(newSupplier);
    saveMockDb(db);

    return {
      success: true,
      data: newSupplier,
    };
  },

  async updateSupplier(
    supplierId: string,
    payload: Partial<CreateSupplierPayload> & { status?: 'active' | 'inactive' }
  ): Promise<ApiResponse<Supplier>> {
    const db = loadMockDb();
    const idx = db.suppliers.findIndex((s) => s.id === supplierId);
    if (idx === -1) throw new Error('Supplier not found.');

    db.suppliers[idx] = {
      ...db.suppliers[idx],
      ...payload,
    };
    saveMockDb(db);

    return {
      success: true,
      data: { ...db.suppliers[idx] },
    };
  },
};
