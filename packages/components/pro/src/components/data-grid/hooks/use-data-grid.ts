import { getCoreRowModel, useReactTable, type Row, type Table } from "@tanstack/react-table";
import { useMemo } from "react";
import { useDataGridFeatures } from "../features/use-data-grid-features";
import type { DataGridProps } from "../types";

export function useDataGrid<TData>(props: DataGridProps<TData>) {
	const getRowId = useMemo(() => {
		return (record: TData, index: number, parent?: Row<TData>) => {
			if (typeof props.rowKey === "function") {
				return props.rowKey(record, index, parent);
			}
			return String((record as Record<string, unknown>)[props.rowKey]);
		};
	}, [props.rowKey]);

	const featureContext = useMemo(() => ({
		data: props.data,
		rowKey: props.rowKey,
		getRowId,
	}), [getRowId, props.data, props.rowKey]);

	const features = useDataGridFeatures(props, featureContext);
	const columns = useMemo(
		() => [...features.columnsBefore, ...props.columns, ...features.columnsAfter],
		[features.columnsAfter, features.columnsBefore, props.columns],
	);

	const table = useReactTable<TData>({
		data: props.data,
		columns,
		getRowId,
		getCoreRowModel: getCoreRowModel(),
		state: features.state,
		...features.tableOptions,
		...features.callbacks,
	}) as Table<TData>;

	return {
		table,
		columns,
		api: features.api,
	};
}
