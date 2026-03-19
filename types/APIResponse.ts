export interface BaseResponse<T> {
  success: boolean;
  code: number;
  message: string;
  error?: {
    code?: string | number;
    message?: string;
  };
  data?: T | null;
}

export interface BasePaginatedResponse<T> {
  success: boolean;
  code: number;
  message: string;
  error?: {
    code?: string | number;
    message?: string;
  };
  data?: {
    items: T | null;
    totalCount?: number;
    pageNumber?: number;
    pageSize?: number;
    totalPages?: number;
  } | null;
}
