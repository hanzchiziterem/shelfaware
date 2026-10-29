import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from './apiConfig';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
  withCredentials: true, // Supports HttpOnly cookies for secure session auth
});

// Request Interceptor: Attach in-memory access token if present
let inMemoryAccessToken: string | null = null;

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

apiClient.interceptors.request.use(
  (config) => {
    if (inMemoryAccessToken && config.headers) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Normalized handling and auth refresh protection
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Avoid infinite loop on auth refresh failure
    if (error.response?.status === 401 && !error.config?._retry) {
      // Future backend session refresh can be plugged here
    }
    return Promise.reject(error);
  }
);

