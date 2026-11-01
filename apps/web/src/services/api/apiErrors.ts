import axios from 'axios';
import type { NormalizedApiError } from '@/types/api';

/**
 * Normalizes any AxiosError or runtime exception into a safe, user-presentable NormalizedApiError
 * without leaking raw server stack traces.
 */
export function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data as
      | { code?: string; message?: string; fieldErrors?: Record<string, string[]> }
      | undefined;

    if (status === 401) {
      return {
        status: 401,
        code: payload?.code || 'UNAUTHENTICATED',
        message: payload?.message || 'Your session has expired. Please sign in again.',
      };
    }

    if (status === 403) {
      return {
        status: 403,
        code: payload?.code || 'FORBIDDEN',
        message: payload?.message || 'You do not have permission to perform this action.',
      };
    }

    if (status === 422 || status === 400) {
      return {
        status,
        code: payload?.code || 'VALIDATION_ERROR',
        message: payload?.message || 'Please check the highlighted form fields and try again.',
        fieldErrors: payload?.fieldErrors,
      };
    }

    return {
      status,
      code: payload?.code || 'NETWORK_OR_SERVER_ERROR',
      message:
        payload?.message ||
        (error.code === 'ECONNABORTED'
          ? 'The request timed out. Please check your connection.'
          : 'Unable to reach the server. Please try again.'),
    };
  }

  if (error instanceof Error) {
    return {
      status: 400,
      code: 'APPLICATION_ERROR',
      message: error.message,
    };
  }

  return {
    status: 500,
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred.',
  };
}
