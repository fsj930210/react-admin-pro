import type { ColumnDef, RowData, TableState } from "@tanstack/react-table";
import type { DataGridFeature, ColumnOrderConfig, ColumnResizingConfig, DataGridConfig, DataGridFeatureContext, RowOrderConfig } from "../types";
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/abstract";
import { useColumnOrder } from "./use-column-order";
import { useColumnResizing } from "./use-column-resizing";
import { useRowOrder } from "./use-row-order";

type FeatureHook<TData, TConfig = unknown> = (
	columns: ColumnDef<TData>[],
	config?: TConfig,
	context?: DataGridFeatureContext<TData>
) => DataGridFeature;

interface FeatureHooks {
	columnResizing: FeatureHook<RowData, ColumnResizingConfig>;
	columnOrder: FeatureHook<RowData, ColumnOrderConfig>;
	rowOrder: FeatureHook<RowData, RowOrderConfig>;
}

const featureHooks: FeatureHooks = {
	columnResizing: useColumnResizing,
	columnOrder: useColumnOrder,
	rowOrder: useRowOrder,
};

export function useComposeFeatures<TData>(
	columns: ColumnDef<TData>[],
	features: DataGridConfig,
	context: DataGridFeatureContext<TData>
): DataGridFeature {
	const composedState: Partial<TableState> = {};
	const composedCallbacks: Record<string, (...args: any[]) => any> = {};
	const composedApi: Record<string, (...args: any[]) => any> = {};
	const dndCallbacksList: Array<ReturnType<FeatureHook<TData>>["dndCallbacks"]> = [];
	let composedEnableDrag = false;
	let composedDragType: 'column' | 'row' | undefined = undefined;
	let composedColumnOrderDrag: DataGridFeature["columnOrderDrag"] = undefined;
	let composedRowOrderDrag: DataGridFeature["rowOrderDrag"] = undefined;

	for (const [featureName, config] of Object.entries(features)) {
		if (config === false) {
			continue;
		}

		const hook = featureHooks[featureName as keyof typeof featureHooks] as FeatureHook<TData>;
		if (!hook) {
			continue;
		}

		const { state, callbacks, api, enableDrag, dndCallbacks, dragType, columnOrderDrag, rowOrderDrag } = hook(columns, config === true ? undefined : config, context);

		Object.assign(composedState, state);
		Object.assign(composedCallbacks, callbacks);
		Object.assign(composedApi, api);

		if (enableDrag) {
			composedEnableDrag = true;
			composedDragType = dragType;
		}

		if (columnOrderDrag) {
			composedColumnOrderDrag = columnOrderDrag;
		}

		if (rowOrderDrag) {
			composedRowOrderDrag = rowOrderDrag;
		}

		if (dndCallbacks) {
			dndCallbacksList.push(dndCallbacks);
		}
	}

	const composedDndCallbacks = {
		onDragStart: (event: DragStartEvent) => {
			for (const dndCallbacks of dndCallbacksList) {
				dndCallbacks?.onDragStart?.(event);
			}
		},
		onDragOver: (event: DragOverEvent) => {
			for (const dndCallbacks of dndCallbacksList) {
				dndCallbacks?.onDragOver?.(event);
			}
		},
		onDragEnd: (event: DragEndEvent) => {
			for (const dndCallbacks of dndCallbacksList) {
				dndCallbacks?.onDragEnd?.(event);
			}
		},
	};

	return {
		state: composedState,
		callbacks: composedCallbacks,
		api: composedApi,
		enableDrag: composedEnableDrag,
		dndCallbacks: composedDndCallbacks,
		columnOrderDrag: composedColumnOrderDrag,
		rowOrderDrag: composedRowOrderDrag,
		dragType: composedDragType,
	};
}
