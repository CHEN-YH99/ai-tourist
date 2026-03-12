// Common TypeScript types and interfaces for the backend

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}
