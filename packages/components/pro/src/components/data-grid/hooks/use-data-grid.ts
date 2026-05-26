import { getCoreRowModel, type Row, type Table, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { useDataGridFeatures } from "../features/use-data-grid-features";
import type { DataGridProps } from "../types";
import { useNormalizeColumns } from "./use-normalize-columns";

export function useDataGrid<TData>(props: DataGridProps<TData>) {
	const normalizedColumns = useNormalizeColumns(props.columns);
	const normalizedFeatureColumns = useNormalizeColumns(props.featureColumns?.columns ?? []);
	const normalizedProps = useMemo<DataGridProps<TData>>(
		() => ({
			...props,
			columns: normalizedColumns,
			featureColumns: props.featureColumns
				? {
						...props.featureColumns,
						columns: normalizedFeatureColumns,
					}
				: props.featureColumns,
		}),
		[normalizedColumns, normalizedFeatureColumns, props],
	);
	const getRowId = useMemo(() => {
		return (record: TData, index: number, parent?: Row<TData>) => {
			if (typeof normalizedProps.rowKey === "function") {
				return normalizedProps.rowKey(record, index, parent);
			}
			return String((record as Record<string, unknown>)[normalizedProps.rowKey]);
		};
	}, [normalizedProps.rowKey]);

	const featureContext = useMemo(
		() => ({
			data: normalizedProps.data,
			rowKey: normalizedProps.rowKey,
			getRowId,
		}),
		[getRowId, normalizedProps.data, normalizedProps.rowKey],
	);

	const features = useDataGridFeatures(normalizedProps, featureContext);
	const composedColumns = useMemo(
		() => [...features.columnsBefore, ...normalizedColumns, ...features.columnsAfter],
		[features.columnsAfter, features.columnsBefore, normalizedColumns],
	);
	const columns = useNormalizeColumns(composedColumns);

	const table = useReactTable<TData>({
		data: normalizedProps.data,
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
