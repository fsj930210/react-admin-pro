import { When } from "@rap/components-ui/when";
import type { Table } from "@tanstack/react-table";
import { Pagination } from "../../pagination";
import type { DataGridPaginationConfig } from "../types";

interface DataGridPaginationProps<TData> {
	table: Table<TData>;
	config?: DataGridPaginationConfig | false;
	total?: number;
	loading?: boolean;
}

function getFallbackTotal<TData>(table: Table<TData>, mode: DataGridPaginationConfig["mode"]) {
	const totals = {
		local: table.getFilteredRowModel().rows.length,
		remote: table.getRowModel().rows.length,
	};

	return totals[mode ?? "remote"];
}

export function DataGridPagination<TData>({
	table,
	config,
	total,
	loading,
}: DataGridPaginationProps<TData>) {
	const paginationConfig = config || {};
	const state = table.getState().pagination;
	const resolvedTotal = paginationConfig.total ?? total ?? getFallbackTotal(table, paginationConfig.mode);

	return (
		<When condition={Boolean(config) && config !== false && paginationConfig.enable !== false}>
			<div className="border-t px-3 py-2">
				<Pagination
					{...paginationConfig}
					disabled={paginationConfig.disabled || loading}
					page={state.pageIndex + 1}
					pageSize={state.pageSize}
					total={resolvedTotal}
					onChange={(page, pageSize) => {
						table.setPagination({ pageIndex: page - 1, pageSize });
					}}
				/>
			</div>
		</When>
	);
}
