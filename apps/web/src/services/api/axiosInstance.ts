import axios from 'axios';
import { API_CONFIG } from '@/services/api/apiConfig';
import { attachInterceptors } from '@/services/api/interceptors';

/**
 * Single centralized Axios instance for all REST API communication.
 */
export const axiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeoutMs,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

attachInterceptors(axiosInstance);
