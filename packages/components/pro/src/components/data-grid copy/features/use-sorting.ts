import { useRef } from "react";
import {
	getSortedRowModel,
	type ColumnDef,
	type OnChangeFn,
	type RowData,
	type SortingState,
} from "@tanstack/react-table";
import { useControllableState } from "../hooks/use-controllable-state";
import type { DataGridFeature, SortingConfig } from "../types";

export function useSorting<TData extends RowData>(
	_: ColumnDef<TData>[],
	config?: SortingConfig<TData>,
): DataGridFeature<TData> {
	const enabled = config?.enable ?? false;
	const mode = config?.mode ?? "remote";
	const currentSortColumnRef = useRef<string | undefined>(undefined);

	const [sorting, setSortingValue] = useControllableState<SortingState>(
		config?.defaultSorting ?? [],
		{
			defaultValue: config?.defaultSorting ?? [],
			value: config?.sorting,
		},
	);

	const setSorting: OnChangeFn<SortingState> = (updater) => {
		const nextSorting = typeof updater === "function" ? updater(sorting) : updater;
		setSortingValue(nextSorting);
		config?.onChange?.(nextSorting);
	};

	return {
		state: enabled ? { sorting } : {},
		callbacks: enabled ? { onSortingChange: setSorting } : {},
		api: {
			resetSorting: () => setSorting([]),
		},
		tableOptions: enabled
			? {
					manualSorting: mode === "remote",
					enableMultiSort: config?.enableMultiSort ?? true,
					maxMultiSortColCount: config?.maxMultiSortColCount,
					enableSortingRemoval: config?.enableSortingRemoval ?? true,
					...(mode === "local" ? { getSortedRowModel: getSortedRowModel() } : {}),
				}
			: {},
		fearureReturn: {
			currentSortColumnRef,
		},
	};
}
