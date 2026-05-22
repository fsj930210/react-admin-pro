import type { ColumnDef, OnChangeFn, RowData, RowSelectionState } from "@tanstack/react-table";
import { useControllableState } from "../hooks/use-controllable-state";
import type { DataGridFeature, DataGridFeatureContext, RowSelectionConfig } from "../types";

export function useRowSelection<TData extends RowData>(
	_: ColumnDef<TData>[],
	config?: RowSelectionConfig<TData>,
	context?: DataGridFeatureContext<TData>
): DataGridFeature<TData> {
	const enabled = config?.enable ?? false;

	const defaultSelectedRowKeys = config?.defaultSelectedRowKeys ?? [];
	const controlledSelectedRowKeys = config?.selectedRowKeys;

	const [rowSelection, setRowSelectionValue] = useControllableState<RowSelectionState>(
		defaultSelectedRowKeys.reduce<RowSelectionState>((acc, key) => {
			acc[key] = true;
			return acc;
		}, {}),
		{
			defaultValue: defaultSelectedRowKeys.reduce<RowSelectionState>((acc, key) => {
				acc[key] = true;
				return acc;
			}, {}),
			value: controlledSelectedRowKeys?.reduce<RowSelectionState>((acc, key) => {
				acc[key] = true;
				return acc;
			}, {}),
		}
	);

	const setRowSelection: OnChangeFn<RowSelectionState> = (updater) => {
		const nextSelection = typeof updater === "function" ? updater(rowSelection) : updater;
		setRowSelectionValue(nextSelection);

		if (config?.onChange && context) {
			const selectedRowKeys = Object.keys(nextSelection);
			const selectedRows = context.data.filter((row, index) =>
				nextSelection[context.getRowId(row, index)]
			);
			config.onChange(selectedRowKeys, selectedRows);
		}
	};

	return {
		state: enabled ? { rowSelection } : {},
		callbacks: enabled ? { onRowSelectionChange: setRowSelection } : {},
	};
}
