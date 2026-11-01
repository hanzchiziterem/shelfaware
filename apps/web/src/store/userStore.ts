import { create } from 'zustand';
import { userApi, type CreateUserPayload } from '@/features/users/services/userApi';
import { normalizeApiError } from '@/services/api/apiErrors';
import type { AccountStatus, User, UserRole } from '@/types/common';

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (payload: CreateUserPayload) => Promise<User | null>;
  updateUser: (
    userId: string,
    payload: Partial<{ fullName: string; phone: string; role: UserRole; status: AccountStatus }>
  ) => Promise<boolean>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await userApi.getUsers();
      set({ users: res.data, isLoading: false });
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message, isLoading: false });
    }
  },

  createUser: async (payload) => {
    set({ error: null });
    try {
      const res = await userApi.createUser(payload);
      set((state) => ({ users: [...state.users, res.data] }));
      return res.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message });
      return null;
    }
  },

  updateUser: async (userId, payload) => {
    set({ error: null });
    try {
      const res = await userApi.updateUser(userId, payload);
      set((state) => ({
        users: state.users.map((u) => (u.id === userId ? res.data : u)),
      }));
      return true;
    } catch (err) {
      const normalized = normalizeApiError(err);
      set({ error: normalized.message });
      return false;
    }
  },
}));
