import {
	getExpandedRowModel,
	type ColumnDef,
	type ExpandedState,
	type OnChangeFn,
	type RowData,
} from "@tanstack/react-table";
import { useControllableState } from "../hooks/use-controllable-state";
import type { DataGridFeature, ExpandingConfig } from "../types";

export function useExpanding<TData extends RowData>(
	_: ColumnDef<TData>[],
	config?: ExpandingConfig<TData>,
): DataGridFeature<TData> {
	const enabled = config?.enable ?? false;
	const [expanded, setExpandedValue] = useControllableState<ExpandedState>(
		config?.defaultExpanded ?? {},
		{
			defaultValue: config?.defaultExpanded ?? {},
			value: config?.expanded,
			onChange: config?.onChange,
		},
	);

	const setExpanded: OnChangeFn<ExpandedState> = (updater) => {
		const nextExpanded = typeof updater === "function" ? updater(expanded) : updater;
		setExpandedValue(nextExpanded);
	};

	return {
		state: enabled ? { expanded } : {},
		callbacks: enabled ? { onExpandedChange: setExpanded } : {},
		tableOptions: enabled
			? {
					getExpandedRowModel: getExpandedRowModel(),
					getSubRows: config?.getSubRows,
				}
			: {},
		api: {
			toggleRowExpanded: (rowId: string) => {
				setExpanded((previous) => {
					if (previous === true) return {};
					return {
						...previous,
						[rowId]: !previous[rowId],
					};
				});
			},
		},
	};
}
