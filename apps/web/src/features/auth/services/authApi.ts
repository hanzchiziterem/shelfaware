import { apiClient, setAccessToken } from '../../../services/api/axiosInstance';
import { API_CONFIG } from '../../../services/api/apiConfig';
import { LoginRequest, RegisterRequest, AuthResponse, OnboardingRequest } from '../../../services/api/apiTypes';
import { User, Business } from '../../../types/domain';

const MOCK_ADMIN_USER: User = {
  id: 'usr-001',
  name: 'Adeola Adeleke',
  email: 'adeola@adeolafoods.ng',
  role: 'admin',
  isActive: true,
  phone: '+234 802 345 6789',
  lastActive: new Date().toISOString(),
  createdAt: '2026-01-01T00:00:00Z',
};

const MOCK_BUSINESS: Business = {
  id: 'biz-001',
  name: 'Adeola Foods & Provisions',
  type: 'Retail Foodstuff & Provisions',
  email: 'info@adeolafoods.ng',
  phone: '+234 802 345 6789',
  address: '14 Broad Street, Lagos Island',
  city: 'Lagos',
  state: 'Lagos State',
  country: 'Nigeria',
  currency: 'NGN',
  currencySymbol: '₦',
  locale: 'en-NG',
};

export const authApi = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 200));
      if (payload.password === 'wrong') {
        throw new Error('Invalid email or password.');
      }
      const token = 'mock-jwt-token-12345';
      setAccessToken(token);
      return {
        user: { ...MOCK_ADMIN_USER, email: payload.email || MOCK_ADMIN_USER.email },
        business: MOCK_BUSINESS,
        accessToken: token,
      };
    }
    const res = await apiClient.post<AuthResponse>('/auth/login', payload);
    setAccessToken(res.data.accessToken || null);
    return res.data;
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 250));
      return {
        user: { ...MOCK_ADMIN_USER, name: payload.name, email: payload.email },
        business: { ...MOCK_BUSINESS, name: payload.businessName },
        accessToken: 'mock-jwt-token-reg',
      };
    }
    const res = await apiClient.post<AuthResponse>('/auth/register', payload);
    return res.data;
  },

  async getMe(): Promise<{ user: User; business: Business }> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 100));
      return { user: MOCK_ADMIN_USER, business: MOCK_BUSINESS };
    }
    const res = await apiClient.get<{ user: User; business: Business }>('/auth/me');
    return res.data;
  },

  async logout(): Promise<void> {
    setAccessToken(null);
    if (!API_CONFIG.useMockApi) {
      await apiClient.post('/auth/logout');
    }
  },

  async verifyEmail(code: string): Promise<boolean> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 200));
      return code.length === 6;
    }
    const res = await apiClient.post('/auth/verify-email', { code });
    return res.status === 200;
  },

  async completeOnboarding(payload: OnboardingRequest): Promise<Business> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 200));
      return {
        ...MOCK_BUSINESS,
        name: payload.businessName,
        type: payload.businessType,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
      };
    }
    const res = await apiClient.post<Business>('/businesses', payload);
    return res.data;
  },
};

