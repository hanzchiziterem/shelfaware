import { create } from 'zustand';
import { BusinessSettings } from '../types/domain';
import { settingsApi } from '../features/settings/services/settingsApi';
import { applyBrandingToCss } from '../config/branding';

interface SettingsState {
  settings: BusinessSettings | null;
  isLoading: boolean;
  error: string | null;

  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<BusinessSettings>) => Promise<boolean>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const settings = await settingsApi.getSettings();
      set({ settings, isLoading: false });
      // Apply initial branding tokens to CSS
      applyBrandingToCss({
        brandColor: settings.branding.brandColor,
        sidebarBg: settings.branding.sidebarBg,
        borderRadius: settings.branding.borderRadius,
        fontFamily: settings.branding.fontFamily,
        tableDensity: settings.branding.tableDensity,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  updateSettings: async (newSettings) => {
    try {
      const updated = await settingsApi.updateSettings(newSettings);
      set({ settings: updated });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to update settings' });
      return false;
    }
  },
}));

