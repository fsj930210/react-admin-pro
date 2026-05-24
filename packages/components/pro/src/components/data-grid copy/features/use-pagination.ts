import {
	getPaginationRowModel,
	type ColumnDef,
	type OnChangeFn,
	type PaginationState,
	type RowData,
} from "@tanstack/react-table";
import { useControllableState } from "../hooks/use-controllable-state";
import type { DataGridFeature, PaginationConfig } from "../types";

export function usePagination<TData extends RowData>(
	_: ColumnDef<TData>[],
	config?: PaginationConfig | false,
): DataGridFeature<TData> {
	if (config === false) {
		return {};
	}

	const enabled = config?.enable ?? false;
	const mode = config?.mode ?? "remote";
	const [pagination, setPaginationValue] = useControllableState<PaginationState>(
		{
			pageIndex: Math.max((config?.defaultPage ?? config?.page ?? 1) - 1, 0),
			pageSize: config?.defaultPageSize ?? config?.pageSize ?? 10,
		},
		{
			defaultValue: {
				pageIndex: Math.max((config?.defaultPage ?? 1) - 1, 0),
				pageSize: config?.defaultPageSize ?? 10,
			},
			value: config?.page != null || config?.pageSize != null
				? {
						pageIndex: Math.max((config?.page ?? 1) - 1, 0),
						pageSize: config?.pageSize ?? 10,
					}
				: undefined,
		},
	);

	const setPagination: OnChangeFn<PaginationState> = (updater) => {
		const nextPagination = typeof updater === "function" ? updater(pagination) : updater;
		setPaginationValue(nextPagination);
		config?.onChange?.(nextPagination.pageIndex + 1, nextPagination.pageSize);
	};

	return {
		state: enabled ? { pagination } : {},
		callbacks: enabled ? { onPaginationChange: setPagination } : {},
		api: {
			resetPagination: () => setPagination({
				pageIndex: Math.max((config?.defaultPage ?? 1) - 1, 0),
				pageSize: config?.defaultPageSize ?? 10,
			}),
		},
		tableOptions: enabled
			? {
					manualPagination: mode === "remote",
					autoResetPageIndex: false,
					...(mode === "local" ? { getPaginationRowModel: getPaginationRowModel() } : {}),
				}
			: {},
	};
}
