import type { ColumnDef, RowData, TableState } from "@tanstack/react-table";
import type { 
	DataGridFeature, 
	ColumnOrderConfig, 
	ColumnPinningConfig,
	ColumnResizingConfig, 
	DataGridConfig, 
	DataGridFeatureContext, 
	RowOrderConfig, 
	RowPinningConfig,
	RowSelectionConfig, 
	DndCallbacks, 
	FearureReturn } from "../types";
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/abstract";
import { useColumnOrder } from "./use-column-order";
import { useColumnPinning } from "./use-column-pinning";
import { useColumnResizing } from "./use-column-resizing";
import { useRowOrder } from "./use-row-order";
import { useRowPinning } from "./use-row-pinning";
import { useRowSelection } from "./use-row-selection";

type FeatureHook<TData, TConfig = unknown> = (
	columns: ColumnDef<TData>[],
	config?: TConfig,
	context?: DataGridFeatureContext<TData>
) => DataGridFeature<TData>;

interface FeatureHooks {
	columnResizing: FeatureHook<RowData, ColumnResizingConfig>;
	columnOrder: FeatureHook<RowData, ColumnOrderConfig>;
	columnPinning: FeatureHook<RowData, ColumnPinningConfig>;
	rowOrder: FeatureHook<RowData, RowOrderConfig>;
	rowPinning: FeatureHook<RowData, RowPinningConfig>;
	rowSelection: FeatureHook<RowData, RowSelectionConfig<RowData>>;
}

const featureHooks: FeatureHooks = {
	columnResizing: useColumnResizing,
	columnOrder: useColumnOrder,
	columnPinning: useColumnPinning,
	rowOrder: useRowOrder,
	rowPinning: useRowPinning,
	rowSelection: useRowSelection,
};

export function useComposeFeatures<TData>(
	columns: ColumnDef<TData>[],
	features: DataGridConfig<TData>,
	context: DataGridFeatureContext<TData>
): DataGridFeature<TData> {
	const composedState: Partial<TableState> = {};
	const composedCallbacks: Record<string, (...args: any[]) => any> = {};
	const composedApi: Record<string, (...args: any[]) => any> = {};
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

		const { state, callbacks, api, dndConfig, fearureReturn } = hook(columns, config === true ? undefined : config, context);

		Object.assign(composedState, state);
		Object.assign(composedCallbacks, callbacks);
		Object.assign(composedApi, api);
		Object.assign(composedFeatureReturn, fearureReturn);

		if (dndConfig?.enable) {
			composedEnableDrag = true;
		}



		if (dndConfig?.callbacks) {
			dndCallbacksList.push(dndConfig.callbacks);
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
		dndConfig: {
			enable: composedEnableDrag,
			callbacks: composedDndCallbacks,
		},
		fearureReturn: composedFeatureReturn,
	};
}
