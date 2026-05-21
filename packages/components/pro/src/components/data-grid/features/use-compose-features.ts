import type { ColumnDef, RowData, TableState } from "@tanstack/react-table";
import type { DataGridFeature, ColumnOrderConfig, DataGridConfig } from "../types";
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/abstract";
import { useColumnOrder } from "./use-column-order";

type FeatureHook<TData, TConfig = unknown> = (
	columns: ColumnDef<TData>[],
	config?: TConfig
) => ReturnType<typeof useColumnOrder<TData>>;

interface FeatureHooks {
	columnOrder: FeatureHook<RowData, ColumnOrderConfig>;
}

const featureHooks: FeatureHooks = {
	columnOrder: useColumnOrder,
};

export function useComposeFeatures<TData>(
	columns: ColumnDef<TData>[],
	features: DataGridConfig
): DataGridFeature {
	const composedState: Partial<TableState> = {};
	const composedCallbacks: Record<string, (...args: any[]) => any> = {};
	const composedApi: Record<string, (...args: any[]) => any> = {};
	const dndCallbacksList: Array<ReturnType<FeatureHook<TData>>["dndCallbacks"]> = [];
	let composedEnableDrag = false;
	let composedDragType: 'column' | 'row' | undefined = undefined;

	for (const [featureName, config] of Object.entries(features)) {
		if (config === false) {
			continue;
		}

		const hook = featureHooks[featureName as keyof typeof featureHooks] as FeatureHook<TData>;
		if (!hook) {
			continue;
		}

		const { state, callbacks, api, enableDrag, dndCallbacks, dragType } = hook(columns, config === true ? undefined : config);

		Object.assign(composedState, state);
		Object.assign(composedCallbacks, callbacks);
		Object.assign(composedApi, api);

		if (enableDrag) {
			composedEnableDrag = true;
			composedDragType = dragType;
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
		dragType: composedDragType,
	};
}