import axios, { AxiosError } from 'axios';

export interface NormalizedApiError {
  message: string;
  statusCode?: number;
  fieldErrors?: Record<string, string>;
  isNetworkError: boolean;
  isAuthError: boolean;
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) {
      return {
        message: error.message,
        isNetworkError: false,
        isAuthError: false,
      };
    }
    return {
      message: 'An unexpected system error occurred.',
      isNetworkError: false,
      isAuthError: false,
    };
  }

  const axiosErr = error as AxiosError<{ message?: string; errors?: Record<string, string> }>;
  const status = axiosErr.response?.status;
  const isNetwork = !axiosErr.response && Boolean(axiosErr.request);
  const isAuth = status === 401 || status === 403;

  const serverMessage = axiosErr.response?.data?.message;
  const message =
    serverMessage ||
    (isNetwork
      ? 'Unable to reach the server. Please check your network connection.'
      : status === 404
      ? 'The requested resource was not found.'
      : status === 401
      ? 'Your session has expired. Please log in again.'
      : status === 403
      ? 'You do not have permission to perform this action.'
      : 'A server error occurred. Please try again later.');

  return {
    message,
    statusCode: status,
    fieldErrors: axiosErr.response?.data?.errors,
    isNetworkError: isNetwork,
    isAuthError: isAuth,
  };
}

