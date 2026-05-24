import { useMemo } from "react";
import type { ColumnDef, OnChangeFn, RowData, VisibilityState } from "@tanstack/react-table";
import { useControllableState } from "../hooks/use-controllable-state";
import type { ColumnVisibilityConfig, DataGridFeature } from "../types";

export function useColumnVisibility<TData extends RowData>(
	columns: ColumnDef<TData>[],
	config?: ColumnVisibilityConfig,
): DataGridFeature<TData> {
	const enabled = config?.enable ?? false;
	const defaultVisibility = useMemo(() => ({
		...getMetaVisibility(columns),
		...config?.defaultVisibility,
	}), [columns, config?.defaultVisibility]);

	const [columnVisibility, setColumnVisibilityValue] = useControllableState<VisibilityState>(
		defaultVisibility,
		{
			defaultValue: defaultVisibility,
			value: config?.visibility,
			onChange: config?.onChange,
		},
	);

	const setColumnVisibility: OnChangeFn<VisibilityState> = (updater) => {
		const nextVisibility = typeof updater === "function" ? updater(columnVisibility) : updater;
		setColumnVisibilityValue(nextVisibility);
	};

	return {
		state: enabled ? { columnVisibility } : {},
		callbacks: enabled ? { onColumnVisibilityChange: setColumnVisibility } : {},
		api: {
			resetColumnVisibility: () => setColumnVisibility(defaultVisibility),
		},
	};
}

function getMetaVisibility<TData>(columns: ColumnDef<TData>[]) {
	const visibility: VisibilityState = {};
	const walk = (items: ColumnDef<TData>[]) => {
		for (const column of items) {
			if (column.id && column.meta?.visibility?.visible === false) {
				visibility[column.id] = false;
			}
			const children = (column as { columns?: ColumnDef<TData>[] }).columns;
			if (children?.length) {
				walk(children);
			}
		}
	};

	walk(columns);
	return visibility;
}
