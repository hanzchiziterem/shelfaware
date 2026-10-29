import { create } from 'zustand';
import { User, Business, Role } from '../types/domain';
import { authApi } from '../features/auth/services/authApi';
import { LoginRequest, RegisterRequest, OnboardingRequest } from '../services/api/apiTypes';
import { normalizeApiError } from '../services/api/apiErrors';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  business: Business | null;
  status: AuthStatus;
  error: string | null;
  isInitialized: boolean;

  init: () => Promise<void>;
  login: (payload: LoginRequest) => Promise<boolean>;
  register: (payload: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  completeOnboarding: (payload: OnboardingRequest) => Promise<boolean>;
  switchRoleForDemo: (role: Role) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  business: null,
  status: 'idle',
  error: null,
  isInitialized: false,

  init: async () => {
    try {
      set({ status: 'loading' });
      const { user, business } = await authApi.getMe();
      set({ user, business, status: 'authenticated', isInitialized: true, error: null });
    } catch {
      set({ user: null, business: null, status: 'unauthenticated', isInitialized: true });
    }
  },

  login: async (payload: LoginRequest) => {
    try {
      set({ status: 'loading', error: null });
      const res = await authApi.login(payload);
      set({ user: res.user, business: res.business, status: 'authenticated', error: null });
      return true;
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message, status: 'unauthenticated' });
      return false;
    }
  },

  register: async (payload: RegisterRequest) => {
    try {
      set({ status: 'loading', error: null });
      const res = await authApi.register(payload);
      set({ user: res.user, business: res.business, status: 'authenticated', error: null });
      return true;
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message, status: 'unauthenticated' });
      return false;
    }
  },

  logout: async () => {
    await authApi.logout();
    set({ user: null, business: null, status: 'unauthenticated', error: null });
  },

  completeOnboarding: async (payload: OnboardingRequest) => {
    try {
      set({ status: 'loading', error: null });
      const updatedBiz = await authApi.completeOnboarding(payload);
      set({ business: updatedBiz, status: 'authenticated' });
      return true;
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message });
      return false;
    }
  },

  switchRoleForDemo: (role: Role) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, role } });
    }
  },

  clearError: () => set({ error: null }),
}));

