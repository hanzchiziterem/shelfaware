import { create } from 'zustand';
import { applyBrandingToDocument, DEFAULT_BRANDING_SETTINGS } from '@/app/config/branding';
import { settingsApi } from '@/features/settings/services/settingsApi';
import { normalizeApiError } from '@/services/api/apiErrors';
import type { BusinessSettings } from '@/types/common';

interface SettingsState {
  settings: BusinessSettings;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (partial: Partial<BusinessSettings>) => Promise<boolean>;
  resetDemoEnvironment: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_BRANDING_SETTINGS,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await settingsApi.getSettings();
      applyBrandingToDocument(res.data);
      set({ settings: res.data, isLoading: false });
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message, isLoading: false });
    }
  },

  updateSettings: async (partial) => {
    set({ error: null });
    try {
      const res = await settingsApi.updateSettings(partial);
      applyBrandingToDocument(res.data);
      set({ settings: res.data });
      return true;
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message });
      return false;
    }
  },

  resetDemoEnvironment: async () => {
    const res = await settingsApi.resetDemoData();
    applyBrandingToDocument(res.data);
    set({ settings: res.data, error: null });
  },
}));
