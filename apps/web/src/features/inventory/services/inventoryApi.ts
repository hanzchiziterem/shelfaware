import { apiClient } from '../../../services/api/axiosInstance';
import { API_CONFIG } from '../../../services/api/apiConfig';
import { StockMovement, StockBatch } from '../../../types/domain';
import { mockStorage } from '../../../mocks/mockStorage';
import { StockAdjustmentPayload } from '../../../services/api/apiTypes';

export const inventoryApi = {
  async getMovements(): Promise<StockMovement[]> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 150));
      return mockStorage.getMovements();
    }
    const res = await apiClient.get<StockMovement[]>('/inventory/movements');
    return res.data;
  },

  async getBatches(): Promise<StockBatch[]> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 150));
      return mockStorage.getBatches();
    }
    const res = await apiClient.get<StockBatch[]>('/inventory/batches');
    return res.data;
  },

  async adjustStock(payload: StockAdjustmentPayload): Promise<StockMovement> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 150));
      return mockStorage.adjustStock(payload);
    }
    const res = await apiClient.post<StockMovement>('/inventory/adjustments', payload);
    return res.data;
  },
};

