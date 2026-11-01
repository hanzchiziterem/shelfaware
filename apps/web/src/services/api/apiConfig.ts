/**
 * Centralized API environment configuration.
 * Defaults to deterministic mock mode unless VITE_USE_MOCK_API is explicitly set to "false".
 */

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const rawMockFlag = import.meta.env.VITE_USE_MOCK_API as string | undefined;

export const API_CONFIG = {
  baseURL: rawBaseUrl && rawBaseUrl.trim() !== '' ? rawBaseUrl.trim() : 'http://localhost:4000/api/v1',
  timeoutMs: 15000,
  useMockApi: rawMockFlag !== 'false',
} as const;
