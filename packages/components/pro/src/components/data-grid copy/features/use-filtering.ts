import { useRef } from "react";
import {
	getFilteredRowModel,
	type ColumnDef,
	type ColumnFiltersState,
	type OnChangeFn,
	type RowData,
} from "@tanstack/react-table";
import { useControllableState } from "../hooks/use-controllable-state";
import type { DataGridFeature, FilteringConfig } from "../types";

export function useFiltering<TData extends RowData>(
	_: ColumnDef<TData>[],
	config?: FilteringConfig<TData>,
): DataGridFeature<TData> {
	const enabled = config?.enable ?? false;
	const mode = config?.mode ?? "remote";
	const currentFilterColumnRef = useRef<string | undefined>(undefined);

	const [columnFilters, setColumnFiltersValue] = useControllableState<ColumnFiltersState>(
		config?.defaultColumnFilters ?? [],
		{
			defaultValue: config?.defaultColumnFilters ?? [],
			value: config?.columnFilters,
		},
	);
	const [globalFilter, setGlobalFilterValue] = useControllableState<unknown>(
		config?.defaultGlobalFilter,
		{
			defaultValue: config?.defaultGlobalFilter,
			value: config?.globalFilter,
		},
	);

	const setColumnFilters: OnChangeFn<ColumnFiltersState> = (updater) => {
		const nextFilters = typeof updater === "function" ? updater(columnFilters) : updater;
		setColumnFiltersValue(nextFilters);
		config?.onChange?.(nextFilters);
	};

	const setGlobalFilter: OnChangeFn<unknown> = (updater) => {
		const nextGlobalFilter = typeof updater === "function"
			? (updater as (previous: unknown) => unknown)(globalFilter)
			: updater;
		setGlobalFilterValue(nextGlobalFilter);
		config?.onGlobalFilterChange?.(nextGlobalFilter);
	};

	return {
		state: enabled ? { columnFilters, globalFilter } : {},
		callbacks: enabled
			? {
					onColumnFiltersChange: setColumnFilters,
					onGlobalFilterChange: setGlobalFilter,
				}
			: {},
		api: {
			resetFilters: () => {
				setColumnFilters([]);
				setGlobalFilter(undefined);
			},
		},
		tableOptions: enabled
			? {
					manualFiltering: mode === "remote",
					...(mode === "local" ? { getFilteredRowModel: getFilteredRowModel() } : {}),
					globalFilterFn: config?.fuzzy ? "dataGridGlobalFuzzy" : "dataGridFilter",
				}
			: {},
		fearureReturn: {
			currentFilterColumnRef,
		},
	};
}
