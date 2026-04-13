export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
