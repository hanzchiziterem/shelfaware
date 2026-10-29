import { apiClient } from '../../../services/api/axiosInstance';
import { API_CONFIG } from '../../../services/api/apiConfig';
import { BusinessSettings } from '../../../types/domain';
import { mockStorage } from '../../../mocks/mockStorage';
import { applyBrandingToCss } from '../../../config/branding';

export const settingsApi = {
  async getSettings(): Promise<BusinessSettings> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 100));
      return mockStorage.getSettings();
    }
    const res = await apiClient.get<BusinessSettings>('/settings');
    return res.data;
  },

  async updateSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 150));
      const current = mockStorage.getSettings();
      const updated: BusinessSettings = {
        ...current,
        ...settings,
        business: { ...current.business, ...(settings.business || {}) },
        branding: { ...current.branding, ...(settings.branding || {}) },
        pos: { ...current.pos, ...(settings.pos || {}) },
        inventory: { ...current.inventory, ...(settings.inventory || {}) },
      };
      mockStorage.saveSettings(updated);

      // Apply branding changes live to document CSS custom variables
      applyBrandingToCss({
        brandColor: updated.branding.brandColor,
        sidebarBg: updated.branding.sidebarBg,
        borderRadius: updated.branding.borderRadius,
        fontFamily: updated.branding.fontFamily,
        tableDensity: updated.branding.tableDensity,
      });

      return updated;
    }
    const res = await apiClient.patch<BusinessSettings>('/settings', settings);
    return res.data;
  },
};

