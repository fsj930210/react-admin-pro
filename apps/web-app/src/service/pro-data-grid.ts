import request from "@/service/fetch";
import type { ApiResponse } from "@rap/utils/fetch";

export interface Employee {
  employee_id: string;
  username: string;
  email: string;
  department: string;
  position: string;
  status: "active" | "probation" | "vacation";
  joined_at: string;
  performance: number;
}

export interface EmployeeQuery {
  current: number;
  page_size: number;
  keyword?: string;
  employee_id?: string;
  username?: string;
  email?: string;
  department_code?: string;
  position?: string;
  status?: string | string[];
  joined_start?: string;
  joined_end?: string;
  performance_min?: number;
  performance_max?: number;
  order_field?: string;
  order_direction?: "asc" | "desc";
}

export interface EmployeeResponseData {
  records: Employee[];
  total_count: number;
  current: number;
  page_size: number;
}

export type EmployeeResponse = ApiResponse<EmployeeResponseData>;

export function fetchEmployees(params: EmployeeQuery, context?: { signal?: AbortSignal }) {
  return request.post<EmployeeResponseData>("/api/rap/pro-data-grid/employees", {
    data: params,
    signal: context?.signal,
  });
}
