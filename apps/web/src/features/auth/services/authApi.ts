import { INITIAL_USERS } from '@/mocks/inventory';
import { loadMockDb, saveMockDb } from '@/mocks/mockDb';
import { API_CONFIG } from '@/services/api/apiConfig';
import { API_ENDPOINTS, type ApiResponse } from '@/services/api/apiTypes';
import { axiosInstance } from '@/services/api/axiosInstance';
import type { User, UserRole } from '@/types/common';
import { getInitials } from '@/utils/formatters';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface OnboardingPayload {
  businessName: string;
  businessType: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  locale: string;
}

export interface AuthSessionResponse {
  user: User;
  accessToken: string;
  needsOnboarding?: boolean;
  needsEmailVerification?: boolean;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<ApiResponse<AuthSessionResponse>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.post<ApiResponse<AuthSessionResponse>>(
        API_ENDPOINTS.AUTH.LOGIN,
        payload
      );
      return data;
    }

    const db = loadMockDb();
    const emailNorm = payload.email.trim().toLowerCase();
    const matched =
      INITIAL_USERS.find((u) => u.email.toLowerCase() === emailNorm) ||
      db.users.find((u) => u.email.toLowerCase() === emailNorm);

    if (!matched) {
      throw new Error('Invalid email or password. Use one of the store staff accounts.');
    }
    if (matched.status === 'inactive') {
      throw new Error('This staff account has been deactivated by an administrator.');
    }

    return {
      success: true,
      data: {
        user: matched,
        accessToken: `mock-jwt-${matched.id}-${Date.now()}`,
      },
    };
  },

  async register(payload: RegisterPayload): Promise<ApiResponse<AuthSessionResponse>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.post<ApiResponse<AuthSessionResponse>>(
        API_ENDPOINTS.AUTH.REGISTER,
        payload
      );
      return data;
    }

    const db = loadMockDb();
    const newUser: User = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      fullName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: '+234 803 000 0000',
      role: 'super_business_admin',
      status: 'active',
      businessId: 'biz-01',
      lastActiveAt: new Date().toISOString(),
      avatarInitials: getInitials(payload.fullName),
    };

    db.users.unshift(newUser);
    saveMockDb(db);

    return {
      success: true,
      data: {
        user: newUser,
        accessToken: `mock-jwt-${newUser.id}-${Date.now()}`,
        needsEmailVerification: true,
        needsOnboarding: true,
      },
    };
  },

  async completeOnboarding(payload: OnboardingPayload): Promise<ApiResponse<{ completed: boolean }>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.post<ApiResponse<{ completed: boolean }>>(
        API_ENDPOINTS.BUSINESS.CREATE,
        payload
      );
      return data;
    }

    const db = loadMockDb();
    db.settings = {
      ...db.settings,
      businessName: payload.businessName,
      businessType: payload.businessType,
      phone: payload.phone,
      email: payload.email,
      address: payload.address,
      currency: payload.currency,
      locale: payload.locale,
    };
    saveMockDb(db);

    return {
      success: true,
      data: { completed: true },
    };
  },

  async verifyEmail(code: string): Promise<ApiResponse<{ verified: boolean }>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.post<ApiResponse<{ verified: boolean }>>(
        API_ENDPOINTS.AUTH.VERIFY_EMAIL,
        { code }
      );
      return data;
    }

    if (code.trim().length !== 6) {
      throw new Error('Please enter the 6-digit verification code.');
    }
    return {
      success: true,
      data: { verified: true },
    };
  },

  async requestPasswordReset(email: string): Promise<ApiResponse<{ sent: boolean }>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.post<ApiResponse<{ sent: boolean }>>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email }
      );
      return data;
    }

    return {
      success: true,
      message: `Simulated password reset instructions prepared for ${email}.`,
      data: { sent: true },
    };
  },

  async switchDemoRole(role: UserRole): Promise<ApiResponse<User>> {
    const db = loadMockDb();
    const userForRole =
      INITIAL_USERS.find((u) => u.role === role && u.status === 'active') ||
      db.users.find((u) => u.role === role && u.status === 'active') ||
      INITIAL_USERS[0];
    return {
      success: true,
      data: userForRole,
    };
  },
};
