/** Pagination query params. */
export interface ListQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/** Paginated response wrapper. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** API error shape. */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
