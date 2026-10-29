/**
 * Common shared utility types for API and tables.
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface DateRange {
  from: string;
  to: string;
}

export type SortOrder = 'asc' | 'desc';

export interface SortParams {
  sortBy: string;
  sortOrder: SortOrder;
}

