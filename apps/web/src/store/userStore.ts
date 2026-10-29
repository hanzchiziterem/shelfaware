import { create } from 'zustand';
import { User, Role } from '../types/domain';
import { userApi } from '../features/users/services/userApi';

interface UserState {
  users: User[];
  isLoading: boolean;
  isCreateModalOpen: boolean;

  fetchUsers: () => Promise<void>;
  createUser: (data: { name: string; email: string; role: Role; phone?: string }) => Promise<boolean>;
  toggleActive: (id: string) => Promise<void>;
  setCreateModalOpen: (open: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  isLoading: false,
  isCreateModalOpen: false,

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const users = await userApi.getUsers();
      set({ users, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createUser: async (data) => {
    try {
      const user = await userApi.createUser(data);
      set((state) => ({ users: [...state.users, user], isCreateModalOpen: false }));
      return true;
    } catch {
      return false;
    }
  },

  toggleActive: async (id) => {
    try {
      const updated = await userApi.toggleUserActive(id);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updated : u)),
      }));
    } catch (err) {
      console.error(err);
    }
  },

  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
}));

