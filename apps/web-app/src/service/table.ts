import request from "@/service/fetch";

export interface User {
	id: string;
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
	sortFields?: { field: string; order: string }[];
	filters?: Record<string, unknown>;
}

export const fetchUsers = (params?: FetchUsersParams) => {
	return request.post<TableResponse<User>>(`/api/rap/table/users`, { data: params });
};
