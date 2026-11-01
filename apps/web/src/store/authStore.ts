import { create } from 'zustand';
import {
  authApi,
  type LoginPayload,
  type OnboardingPayload,
  type RegisterPayload,
} from '@/features/auth/services/authApi';
import { INITIAL_USERS } from '@/mocks/inventory';
import { normalizeApiError } from '@/services/api/apiErrors';
import { registerUnauthorizedHandler, setInMemoryAccessToken } from '@/services/api/interceptors';
import type { User, UserRole } from '@/types/common';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  isInitialized: boolean;
  pendingVerificationEmail: string | null;
  needsOnboarding: boolean;
  error: string | null;
  initializeSession: () => void;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  verifyEmail: (code: string) => Promise<boolean>;
  completeOnboarding: (payload: OnboardingPayload) => Promise<boolean>;
  logout: () => void;
  switchRoleForDemo: (role: UserRole) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  registerUnauthorizedHandler(() => {
    setInMemoryAccessToken(null);
    set({
      user: null,
      status: 'unauthenticated',
      error: 'Session expired. Please sign in again.',
    });
  });

  return {
    user: INITIAL_USERS[0],
    status: 'authenticated',
    isInitialized: true,
    pendingVerificationEmail: null,
    needsOnboarding: false,
    error: null,

    initializeSession: () => {
      set((state) => ({
        isInitialized: true,
        status: state.user ? 'authenticated' : 'unauthenticated',
      }));
    },

    login: async (payload) => {
      set({ status: 'loading', error: null });
      try {
        const res = await authApi.login(payload);
        setInMemoryAccessToken(res.data.accessToken);
        set({
          user: res.data.user,
          status: 'authenticated',
          needsOnboarding: Boolean(res.data.needsOnboarding),
          error: null,
        });
        return true;
      } catch (err) {
        const normalized = normalizeApiError(err);
        set({
          status: 'unauthenticated',
          error: normalized.message,
        });
        return false;
      }
    },

    register: async (payload) => {
      set({ status: 'loading', error: null });
      try {
        const res = await authApi.register(payload);
        setInMemoryAccessToken(res.data.accessToken);
        set({
          user: res.data.user,
          status: 'authenticated',
          pendingVerificationEmail: res.data.user.email,
          needsOnboarding: true,
          error: null,
        });
        return true;
      } catch (err) {
        const normalized = normalizeApiError(err);
        set({
          status: 'unauthenticated',
          error: normalized.message,
        });
        return false;
      }
    },

    verifyEmail: async (code) => {
      set({ error: null });
      try {
        await authApi.verifyEmail(code);
        set({ pendingVerificationEmail: null });
        return true;
      } catch (err) {
        const normalized = normalizeApiError(err);
        set({ error: normalized.message });
        return false;
      }
    },

    completeOnboarding: async (payload) => {
      set({ error: null });
      try {
        await authApi.completeOnboarding(payload);
        set({ needsOnboarding: false });
        return true;
      } catch (err) {
        const normalized = normalizeApiError(err);
        set({ error: normalized.message });
        return false;
      }
    },

    logout: () => {
      setInMemoryAccessToken(null);
      set({
        user: null,
        status: 'unauthenticated',
        error: null,
      });
    },

    switchRoleForDemo: async (role) => {
      const res = await authApi.switchDemoRole(role);
      set({
        user: res.data,
        status: 'authenticated',
      });
    },

    clearError: () => set({ error: null }),
  };
});
