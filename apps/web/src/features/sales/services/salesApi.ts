import { apiClient } from '../../../services/api/axiosInstance';
import { API_CONFIG } from '../../../services/api/apiConfig';
import { Sale } from '../../../types/domain';
import { mockStorage } from '../../../mocks/mockStorage';

/**
 * Sales API Service
 * ============================================================
 * BACKEND INTEGRATION INSTRUCTIONS:
 * When connecting to your production backend:
 * 1. Set VITE_USE_MOCK_API=false in .env.local
 * 2. Implement the corresponding REST endpoints on your server:
 *    - GET /api/v1/sales (supports query params: search, status, paymentMethod)
 *    - GET /api/v1/sales/:id
 *    - POST /api/v1/sales/:id/void (payload: { reason: string })
 *    - DELETE /api/v1/sales/:id
 * ============================================================
 */
export const salesApi = {
  /**
   * Endpoint: GET /api/v1/sales
   */
  async getSales(params?: { search?: string; status?: string; paymentMethod?: string }): Promise<Sale[]> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 100));
      let list = mockStorage.getSales();
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (s) =>
            s.transactionNumber.toLowerCase().includes(q) ||
            s.customerName.toLowerCase().includes(q) ||
            s.cashierName.toLowerCase().includes(q)
        );
      }
      if (params?.status && params.status !== 'all') {
        list = list.filter((s) => s.status === params.status);
      }
      if (params?.paymentMethod && params.paymentMethod !== 'all') {
        list = list.filter((s) => s.paymentMethod === params.paymentMethod);
      }
      return list;
    }
    const res = await apiClient.get<Sale[]>('/sales', { params });
    return res.data;
  },

  /**
   * Endpoint: GET /api/v1/sales/:id
   */
  async getSaleById(id: string): Promise<Sale | undefined> {
    if (API_CONFIG.useMockApi) {
      const sales = mockStorage.getSales();
      return sales.find((s) => s.id === id);
    }
    const res = await apiClient.get<Sale>(`/sales/${id}`);
    return res.data;
  },

  /**
   * Endpoint: POST /api/v1/sales/:id/void
   */
  async voidSale(id: string, reason: string): Promise<Sale> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 150));
      return mockStorage.voidSale(id, reason);
    }
    const res = await apiClient.post<Sale>(`/sales/${id}/void`, { reason });
    return res.data;
  },

  /**
   * Endpoint: DELETE /api/v1/sales/:id
   */
  async deleteSale(id: string): Promise<boolean> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 150));
      return mockStorage.deleteSale(id);
    }
    await apiClient.delete(`/sales/${id}`);
    return true;
  },
};
