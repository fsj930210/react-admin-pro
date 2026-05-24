import { useRef, useState } from "react";
import type { ColumnDef, RowData } from "@tanstack/react-table";
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/abstract";
import type { DataGridFeature, DataGridFeatureContext, RowOrderConfig } from "../types";

export function useRowOrder<TData extends RowData>(
	_: ColumnDef<TData>[],
	config?: RowOrderConfig,
	context?: DataGridFeatureContext<TData>
): DataGridFeature<TData> {
	const [activeRowId, setActiveRowId] = useState<string | undefined>();
	const [previewRowOrder, setPreviewRowOrder] = useState<string[]>([]);
	const lastDragTargetRef = useRef<string | undefined>(undefined);
	const enabled = config?.enable ?? false;
	const enableDrag = config?.enableDrag ?? false;

	const handleDragStart = (event: DragStartEvent) => {
		const source = event.operation.source;

		if (source?.type !== "row") return;

		lastDragTargetRef.current = undefined;
		setPreviewRowOrder(getRowOrder(context));
		setActiveRowId(source.id == null ? undefined : String(source.id));
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { source, target } = event.operation;

		if (source?.type !== "row" || source.id == null || target?.id == null) return;

		const sourceId = String(source.id);
		const targetId = String(target.id);

		if (sourceId === targetId || lastDragTargetRef.current === targetId) {
			return;
		}

		lastDragTargetRef.current = targetId;
		setPreviewRowOrder((order) => {
			const sourceIndex = order.indexOf(sourceId);
			const targetIndex = order.indexOf(targetId);

			if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
				return order;
			}

			const nextOrder = order.slice();
			const [sourceItem] = nextOrder.splice(sourceIndex, 1);
			nextOrder.splice(targetIndex, 0, sourceItem);
			return nextOrder;
		});
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { source, canceled } = event.operation;

		if (source?.type !== "row") return;

		setActiveRowId(undefined);
		lastDragTargetRef.current = undefined;

		if (canceled) {
			setPreviewRowOrder(getRowOrder(context));
			return;
		}

		const nextOrder = previewRowOrder.length ? previewRowOrder : getRowOrder(context);

		context?.updateData?.((data) => {
			const rowById = new Map(data.map((row, index) => [context.getRowId(row, index), row]));
			const orderedRows = nextOrder
				.map((id) => rowById.get(id))
				.filter((row): row is TData => row != null);
			const missingRows = data.filter((row, index) => !nextOrder.includes(context.getRowId(row, index)));
			const nextData = [...orderedRows, ...missingRows];
			config?.onChange?.(nextData.map((row, index) => context.getRowId(row, index)));
			return nextData;
		});
		setPreviewRowOrder(nextOrder);
	};

	return {
		dndConfig: {
			enable: enabled && enableDrag,
			callbacks: enabled && enableDrag ? {
					onDragStart: handleDragStart,
					onDragOver: handleDragOver,
					onDragEnd: handleDragEnd,
				}
			: undefined
		},
		fearureReturn: {
			rowOrderDrag: enabled && enableDrag
					? {
						activeRowId,
						rowOrder: getRowOrder(context),
						previewRowOrder,
						isDragging: activeRowId != null,
					}
			: undefined,
		}
	}
}

function getRowOrder<TData>(
	context: DataGridFeatureContext<TData> | undefined
) {
	return context?.data.map((row, index) => context.getRowId(row, index)) ?? [];
}
