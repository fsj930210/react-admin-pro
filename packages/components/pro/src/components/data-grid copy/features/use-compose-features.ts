import { useRef } from "react";
import type { ColumnDef, ColumnPinningState, RowData, RowPinningState, TableState } from "@tanstack/react-table";
import type { 
	ColumnVisibilityConfig,
	DataGridFeature, 
	ColumnOrderConfig, 
	ColumnPinningConfig,
	ColumnResizingConfig, 
	DataGridConfig, 
	DataGridFeatureContext, 
	ExpandingConfig,
	FilteringConfig,
	PaginationConfig,
	RowOrderConfig, 
	RowPinningConfig,
	RowSelectionConfig, 
	SortingConfig,
	DndCallbacks, 
	FearureReturn } from "../types";
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/abstract";
import { useColumnOrder } from "./use-column-order";
import { useColumnPinning } from "./use-column-pinning";
import { useColumnResizing } from "./use-column-resizing";
import { useColumnVisibility } from "./use-column-visibility";
import { useExpanding } from "./use-expanding";
import { useFiltering } from "./use-filtering";
import { usePagination } from "./use-pagination";
import { useRowOrder } from "./use-row-order";
import { useRowPinning } from "./use-row-pinning";
import { useRowSelection } from "./use-row-selection";
import { useSorting } from "./use-sorting";

type FeatureHook<TData, TConfig = unknown> = (
	columns: ColumnDef<TData>[],
	config?: TConfig,
	context?: DataGridFeatureContext<TData>
) => DataGridFeature<TData>;

interface FeatureHooks {
	columnResizing: FeatureHook<RowData, ColumnResizingConfig>;
	columnOrder: FeatureHook<RowData, ColumnOrderConfig>;
	columnPinning: FeatureHook<RowData, ColumnPinningConfig>;
	columnVisibility: FeatureHook<RowData, ColumnVisibilityConfig>;
	rowOrder: FeatureHook<RowData, RowOrderConfig>;
	rowPinning: FeatureHook<RowData, RowPinningConfig>;
	rowSelection: FeatureHook<RowData, RowSelectionConfig<RowData>>;
	sorting: FeatureHook<RowData, SortingConfig<RowData>>;
	filtering: FeatureHook<RowData, FilteringConfig<RowData>>;
	pagination: FeatureHook<RowData, PaginationConfig | false>;
	expanding: FeatureHook<RowData, ExpandingConfig<RowData>>;
}

const featureHooks: FeatureHooks = {
	columnResizing: useColumnResizing,
	columnOrder: useColumnOrder,
	columnPinning: useColumnPinning,
	columnVisibility: useColumnVisibility,
	rowOrder: useRowOrder,
	rowPinning: useRowPinning,
	rowSelection: useRowSelection,
	sorting: useSorting,
	filtering: useFiltering,
	pagination: usePagination,
	expanding: useExpanding,
};

export function useComposeFeatures<TData>(
	columns: ColumnDef<TData>[],
	features: DataGridConfig<TData>,
	context: DataGridFeatureContext<TData>
): DataGridFeature<TData> {
	const initialColumnPinningRef = useRef<ColumnPinningState | undefined>(undefined);
	const initialRowPinningRef = useRef<RowPinningState | undefined>(undefined);
	const lastColumnPinningSwapRef = useRef<string | undefined>(undefined);
	const lastRowPinningSwapRef = useRef<string | undefined>(undefined);
	const composedState: Partial<TableState> = {};
	const composedCallbacks: Record<string, (...args: any[]) => any> = {};
	const composedApi: Record<string, (...args: any[]) => any> = {};
	const composedTableOptions: Record<string, unknown> = {};
	const dndCallbacksList: DndCallbacks[] = [];
	let composedEnableDrag = false;
	let composedFeatureReturn: FearureReturn<TData> = {};
	for (const [featureName, config] of Object.entries(features)) {
		if (config === false) {
			continue;
		}

		const hook = featureHooks[featureName as keyof typeof featureHooks] as FeatureHook<TData>;
		if (!hook) {
			continue;
		}

		const { state, callbacks, api, dndConfig, fearureReturn, tableOptions } = hook(columns, config === true ? undefined : config, context);

		Object.assign(composedState, state);
		Object.assign(composedCallbacks, callbacks);
		Object.assign(composedApi, api);
		Object.assign(composedFeatureReturn, fearureReturn);
		Object.assign(composedTableOptions, tableOptions);

		if (dndConfig?.enable) {
			composedEnableDrag = true;
		}



		if (dndConfig?.callbacks) {
			dndCallbacksList.push(dndConfig.callbacks);
		}
	}

	const composedDndCallbacks = {
		onDragStart: (event: DragStartEvent) => {
			initialColumnPinningRef.current = composedState.columnPinning;
			initialRowPinningRef.current = composedState.rowPinning;
			lastColumnPinningSwapRef.current = undefined;
			lastRowPinningSwapRef.current = undefined;

			for (const dndCallbacks of dndCallbacksList) {
				dndCallbacks?.onDragStart?.(event);
			}
		},
		onDragOver: (event: DragOverEvent) => {
			for (const dndCallbacks of dndCallbacksList) {
				dndCallbacks?.onDragOver?.(event);
			}

			const columnSwapKey = getSwapKey(event);
			if (event.operation.source?.type === "column" && columnSwapKey !== lastColumnPinningSwapRef.current) {
				const columnPinningUpdate = getColumnPinningSwapForDrag(
					columns,
					event,
				);

				if (columnPinningUpdate) {
					lastColumnPinningSwapRef.current = columnSwapKey;
					composedCallbacks.onColumnPinningChange?.(columnPinningUpdate);
				}
			}

			const rowSwapKey = getSwapKey(event);
			if (event.operation.source?.type === "row" && rowSwapKey !== lastRowPinningSwapRef.current) {
				const rowPinningUpdate = getRowPinningSwapForDrag(event);

				if (rowPinningUpdate) {
					lastRowPinningSwapRef.current = rowSwapKey;
					composedCallbacks.onRowPinningChange?.(rowPinningUpdate);
				}
			}
		},
		onDragEnd: (event: DragEndEvent) => {
			for (const dndCallbacks of dndCallbacksList) {
				dndCallbacks?.onDragEnd?.(event);
			}

			if (event.operation.canceled) {
				if (initialColumnPinningRef.current) {
					composedCallbacks.onColumnPinningChange?.(initialColumnPinningRef.current);
				}
				if (initialRowPinningRef.current) {
					composedCallbacks.onRowPinningChange?.(initialRowPinningRef.current);
				}
			}

			initialColumnPinningRef.current = undefined;
			initialRowPinningRef.current = undefined;
			lastColumnPinningSwapRef.current = undefined;
			lastRowPinningSwapRef.current = undefined;
		},
	};

	return {
		state: composedState,
		callbacks: composedCallbacks,
		api: composedApi,
		dndConfig: {
			enable: composedEnableDrag,
			callbacks: composedDndCallbacks,
		},
		fearureReturn: composedFeatureReturn,
		tableOptions: composedTableOptions,
	};
}

function getSwapKey(event: DragOverEvent | DragEndEvent) {
	const sourceId = event.operation.source?.id;
	const targetId = event.operation.target?.id;
	return sourceId == null || targetId == null ? undefined : `${sourceId}->${targetId}`;
}

function getColumnPinningSwapForDrag<TData>(
	columns: ColumnDef<TData>[],
	event: DragOverEvent,
): ((prev: ColumnPinningState) => ColumnPinningState) | undefined {
	const { source, target } = event.operation;

	if (
		source?.type !== "column" ||
		source.id == null ||
		target?.id == null ||
		source.id === target.id
	) {
		return undefined;
	}

	const sourceIds = getLeafColumnIds(columns, String(source.id));
	const targetIds = getLeafColumnIds(columns, String(target.id));

	if (!sourceIds.length || !targetIds.length) {
		return undefined;
	}

	return (prev: ColumnPinningState): ColumnPinningState => {
		return {
			left: swapPinnedIds(prev.left ?? [], sourceIds, targetIds),
			right: swapPinnedIds(prev.right ?? [], sourceIds, targetIds),
		};
	};
}

function getRowPinningSwapForDrag(
	event: DragOverEvent,
): ((prev: RowPinningState) => RowPinningState) | undefined {
	const { source, target } = event.operation;

	if (
		source?.type !== "row" ||
		source.id == null ||
		target?.id == null ||
		source.id === target.id
	) {
		return undefined;
	}

	const sourceId = String(source.id);
	const targetId = String(target.id);

	return (prev: RowPinningState): RowPinningState => ({
		top: swapPinnedIds(prev.top ?? [], [sourceId], [targetId]),
		bottom: swapPinnedIds(prev.bottom ?? [], [sourceId], [targetId]),
	});
}

function swapPinnedIds(
	pinnedIds: string[],
	sourceIds: string[],
	targetIds: string[],
) {
	const hasSource = sourceIds.some((id) => pinnedIds.includes(id));
	const hasTarget = targetIds.some((id) => pinnedIds.includes(id));

	if (!hasSource && !hasTarget) {
		return pinnedIds;
	}

	const result = pinnedIds.filter(
		(id) => !sourceIds.includes(id) && !targetIds.includes(id),
	);
	const sourceInsertIndex = getFirstPinnedIndex(pinnedIds, sourceIds);
	const targetInsertIndex = getFirstPinnedIndex(pinnedIds, targetIds);

	if (hasTarget) {
		result.splice(
			Math.min(targetInsertIndex, result.length),
			0,
			...sourceIds,
		);
	}

	if (hasSource) {
		result.splice(
			Math.min(sourceInsertIndex, result.length),
			0,
			...targetIds,
		);
	}

	return result;
}

function getFirstPinnedIndex(pinnedIds: string[], ids: string[]) {
	const indices = ids
		.map((id) => pinnedIds.indexOf(id))
		.filter((index) => index >= 0);

	return indices.length ? Math.min(...indices) : pinnedIds.length;
}

function getLeafColumnIds<TData>(columns: ColumnDef<TData>[], columnId: string): string[] {
	for (const column of columns) {
		if (column.id === columnId) {
			return getLeafIds(column);
		}

		const children = (column as { columns?: ColumnDef<TData>[] }).columns;
		if (Array.isArray(children)) {
			const match: string[] = getLeafColumnIds(children, columnId);
			if (match.length) {
				return match;
			}
		}
	}

	return [];
}

function getLeafIds<TData>(column: ColumnDef<TData>): string[] {
	const children = (column as { columns?: ColumnDef<TData>[] }).columns;

	if (Array.isArray(children) && children.length) {
		return children.flatMap((child) => getLeafIds(child));
	}

	return column.id ? [column.id] : [];
}
