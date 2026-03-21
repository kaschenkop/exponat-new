export type ApiErrorType = {
  message: string;
  code?: string;
};

export type PaginatedResponseType<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
