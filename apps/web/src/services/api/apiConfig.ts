/**
 * API configuration reading from environment variables.
 * Never hardcodes base URLs. Defaults to mock mode for standalone demo.
 */

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1',
  useMockApi: import.meta.env.VITE_USE_MOCK_API !== 'false',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

