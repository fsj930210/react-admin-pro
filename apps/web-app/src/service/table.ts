import request from "@/service/fetch";

export interface UserTableData {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  expenses: number;
  total_amount: string;
  joined: string;
}

export interface OrderItem {
  id: string;
  product: string;
  price: string;
  qty: number;
  subtotal: string;
}

export interface OrderTableData {
  id: string;
  customer: string;
  product: string;
  qty: number;
  price: string;
  subtotal: string;
  items: number;
  total: string;
  status: string;
  date: string;
  subRows: OrderItem[];
}

export interface TablePagination {
  page: number;
  limit: number;
  total_pages: number;
  total_items: number;
}

export interface TableResponse<T> {
  data: T[];
  pagination: TablePagination;
}

/**
 * Get user table data
 */
export const fetchUsers = async (params: {
  page: number;
  limit: number;
  search: string;
  from_date: string;
  to_date: string;
  sort_by: string;
  sort_order: string;
}): Promise<{ data: UserTableData[]; pagination: TablePagination }> => {
  const response = await request.get("/api/rap/table/users", { params });
  return response as unknown as { data: UserTableData[]; pagination: TablePagination };
};

/**
 * Get orders table data
 */
export const fetchOrders = async (params: {
  page: number;
  limit: number;
  search: string;
  from_date: string;
  to_date: string;
  sort_by: string;
  sort_order: string;
}): Promise<{ data: OrderTableData[]; pagination: TablePagination }> => {
  const response = await request.get("/api/rap/table/orders", { params });
  return response as unknown as { data: OrderTableData[]; pagination: TablePagination };
};
