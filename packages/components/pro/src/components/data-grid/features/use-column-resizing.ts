import { useCallback, useRef, useState } from "react";
import type { ColumnDef, ColumnSizingState, OnChangeFn } from "@tanstack/react-table";
import type { ColumnResizingConfig, DataGridFeature } from "../types";

export function useColumnResizing<TData>(
	_: ColumnDef<TData>[],
	config?: ColumnResizingConfig
): DataGridFeature {
	const [columnSizing, setColumnSizingState] = useState<ColumnSizingState>({});
	const columnSizingRef = useRef(columnSizing);

	const setColumnSizing = useCallback<OnChangeFn<ColumnSizingState>>((updater) => {
		const nextSizing = typeof updater === "function" ? updater(columnSizingRef.current) : updater;
		columnSizingRef.current = nextSizing;
		setColumnSizingState(nextSizing);
		config?.onChange?.(nextSizing);
	}, [config?.onChange]);

	const enabled = config?.enable ?? false;

	return {
		state: enabled ? { columnSizing } : {},
		callbacks: enabled ? { onColumnSizingChange: setColumnSizing } : {},
	};
}
