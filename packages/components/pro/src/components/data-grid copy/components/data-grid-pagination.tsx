"use client"

import type { Table } from "@tanstack/react-table";
import { Pagination } from "../../pagination";
import type { PaginationConfig } from "../types";

interface DataGridPaginationProps<TData> {
	table: Table<TData>;
	config?: PaginationConfig | false;
	total?: number;
	loading?: boolean;
}

export function DataGridPagination<TData>({
	table,
	config,
	total,
	loading,
}: DataGridPaginationProps<TData>) {
	if (!config || !(config.enable ?? false)) return null;
	const paginationConfig = config;

	const state = table.getState().pagination;
	const resolvedTotal = paginationConfig.total ?? total ?? (
		paginationConfig.mode === "local"
			? table.getFilteredRowModel().rows.length
			: table.getRowModel().rows.length
	);

	return (
		<div className="border-t px-3 py-2">
			<Pagination
				{...paginationConfig}
				disabled={paginationConfig.disabled || loading}
				page={state.pageIndex + 1}
				pageSize={state.pageSize}
				total={resolvedTotal}
				onChange={(page, pageSize) => {
					table.setPagination({ pageIndex: page - 1, pageSize });
					paginationConfig.onChange?.(page, pageSize);
				}}
			/>
		</div>
	);
}
