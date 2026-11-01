import { loadMockDb, saveMockDb } from '@/mocks/mockDb';
import { API_CONFIG } from '@/services/api/apiConfig';
import { API_ENDPOINTS, type ApiResponse } from '@/services/api/apiTypes';
import { axiosInstance } from '@/services/api/axiosInstance';
import type { AccountStatus, User, UserRole } from '@/types/common';
import { getInitials } from '@/utils/formatters';

export interface CreateUserPayload {
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
}

export const userApi = {
  async getUsers(): Promise<ApiResponse<User[]>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.get<ApiResponse<User[]>>(API_ENDPOINTS.USERS.BASE);
      return data;
    }

    const db = loadMockDb();
    return {
      success: true,
      data: [...db.users],
    };
  },

  async createUser(payload: CreateUserPayload): Promise<ApiResponse<User>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.post<ApiResponse<User>>(
        API_ENDPOINTS.USERS.BASE,
        payload
      );
      return data;
    }

    const db = loadMockDb();
    const newUser: User = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      fullName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      role: payload.role,
      status: 'active',
      businessId: 'biz-01',
      lastActiveAt: new Date().toISOString(),
      avatarInitials: getInitials(payload.fullName),
    };

    db.users.push(newUser);
    saveMockDb(db);
    return {
      success: true,
      data: newUser,
    };
  },

  async updateUser(
    userId: string,
    payload: Partial<{ fullName: string; phone: string; role: UserRole; status: AccountStatus }>
  ): Promise<ApiResponse<User>> {
    const db = loadMockDb();
    const idx = db.users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('Staff user not found.');

    db.users[idx] = {
      ...db.users[idx],
      ...payload,
      avatarInitials: payload.fullName
        ? getInitials(payload.fullName)
        : db.users[idx].avatarInitials,
    };
    saveMockDb(db);

    return {
      success: true,
      data: { ...db.users[idx] },
    };
  },
};
