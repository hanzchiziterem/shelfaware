import { apiClient } from '../../../services/api/axiosInstance';
import { API_CONFIG } from '../../../services/api/apiConfig';
import { User, Role } from '../../../types/domain';

const INITIAL_USERS: User[] = [
  {
    id: 'usr-001',
    name: 'Adeola Adeleke',
    email: 'adeola@adeolafoods.ng',
    role: 'admin',
    isActive: true,
    phone: '+234 802 345 6789',
    lastActive: 'Just now',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'usr-002',
    name: 'Bolanle Alao',
    email: 'bolanle.alao@adeolafoods.ng',
    role: 'manager',
    isActive: true,
    phone: '+234 813 908 1122',
    lastActive: '25m ago',
    createdAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'usr-003',
    name: 'Kehinde Shonibare',
    email: 'kehinde.s@adeolafoods.ng',
    role: 'cashier',
    isActive: true,
    phone: '+234 809 333 4455',
    lastActive: '10m ago',
    createdAt: '2026-03-01T00:00:00Z',
  },
];

let mockUsers = [...INITIAL_USERS];

export const userApi = {
  async getUsers(): Promise<User[]> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 100));
      return [...mockUsers];
    }
    const res = await apiClient.get<User[]>('/users');
    return res.data;
  },

  async createUser(data: { name: string; email: string; role: Role; phone?: string }): Promise<User> {
    if (API_CONFIG.useMockApi) {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        isActive: true,
        lastActive: 'Never',
        createdAt: new Date().toISOString(),
      };
      mockUsers.push(newUser);
      return newUser;
    }
    const res = await apiClient.post<User>('/users', data);
    return res.data;
  },

  async toggleUserActive(userId: string): Promise<User> {
    if (API_CONFIG.useMockApi) {
      const idx = mockUsers.findIndex((u) => u.id === userId);
      if (idx === -1) throw new Error('User not found');
      mockUsers[idx] = { ...mockUsers[idx], isActive: !mockUsers[idx].isActive };
      return mockUsers[idx];
    }
    const res = await apiClient.post<User>(`/users/${userId}/toggle`);
    return res.data;
  },
};

