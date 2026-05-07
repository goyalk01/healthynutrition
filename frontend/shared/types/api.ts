export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  items: T[];
  pagination: PaginationMeta;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
  requestId?: string;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
  };
  requestId?: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
