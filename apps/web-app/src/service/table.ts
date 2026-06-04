import request from "@/service/fetch";

export interface ApiUser {
  user_id: string;
  name: string;
  email: string;
  age: number;
  department: string;
  position: string;
  phone: string;
  address: string;
  joinDate: string;
  salary: number;
  status: string;
  score: number;
}

export interface User extends Omit<ApiUser, "user_id"> {
  id: string;
}

export interface TableResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface FetchUsersParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  sortFields?: { field: string; order: "asc" | "desc" }[];
  filterField?: string;
  filterValue?: string;
  filters?: Record<string, unknown>;
}

export const fetchUsers = (params?: FetchUsersParams) => {
  return request.post<TableResponse<ApiUser>>(`/api/rap/table/users`, { data: params });
};
