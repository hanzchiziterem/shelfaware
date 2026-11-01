import { loadMockDb, resetMockDb, saveMockDb } from '@/mocks/mockDb';
import { API_CONFIG } from '@/services/api/apiConfig';
import { API_ENDPOINTS, type ApiResponse } from '@/services/api/apiTypes';
import { axiosInstance } from '@/services/api/axiosInstance';
import type { BusinessSettings } from '@/types/common';

export const settingsApi = {
  async getSettings(): Promise<ApiResponse<BusinessSettings>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.get<ApiResponse<BusinessSettings>>(
        API_ENDPOINTS.SETTINGS.BASE
      );
      return data;
    }

    const db = loadMockDb();
    return {
      success: true,
      data: { ...db.settings },
    };
  },

  async updateSettings(
    partial: Partial<BusinessSettings>
  ): Promise<ApiResponse<BusinessSettings>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.patch<ApiResponse<BusinessSettings>>(
        API_ENDPOINTS.SETTINGS.BASE,
        partial
      );
      return data;
    }

    const db = loadMockDb();
    db.settings = {
      ...db.settings,
      ...partial,
    };
    saveMockDb(db);

    return {
      success: true,
      data: { ...db.settings },
    };
  },

  async resetDemoData(): Promise<ApiResponse<BusinessSettings>> {
    const fresh = resetMockDb();
    return {
      success: true,
      data: { ...fresh.settings },
    };
  },
};
