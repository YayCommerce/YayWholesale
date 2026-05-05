export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface PaginatedResponse<T> {
  currentPage: number;
  totalPage: number;
  totalItems: number;
  data: T;
}
