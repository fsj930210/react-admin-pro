import { useState } from "react";
import type { ColumnDef, RowData } from "@tanstack/react-table";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/abstract";
import type { DataGridFeature, DataGridFeatureContext, RowOrderConfig } from "../types";

export function useRowOrder<TData extends RowData>(
	_: ColumnDef<TData>[],
	config?: RowOrderConfig,
	context?: DataGridFeatureContext<TData>
): DataGridFeature<TData> {
	const [activeRowId, setActiveRowId] = useState<string | undefined>();
	const enabled = config?.enable ?? false;
	const enableDrag = config?.enableDrag ?? false;

	const handleDragStart = (event: DragStartEvent) => {
		const source = event.operation.source;

		if (source?.type !== "row") return;

		setActiveRowId(source.id == null ? undefined : String(source.id));
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { source, target, canceled } = event.operation;

		if (source?.type !== "row") return;

		setActiveRowId(undefined);

		if (canceled || !target || source.id == null || target.id == null) {
			return;
		}

		const sourceId = String(source.id);
		const targetId = String(target.id);

		if (sourceId === targetId) return;

		context?.updateData?.((data) => {
			const nextData = moveRowById(data, sourceId, targetId, context);
			config?.onChange?.(nextData.map((row, index) => context.getRowId(row, index)));
			return nextData;
		});
	};

	return {
		dndConfig: {
			enable: enabled && enableDrag,
			callbacks: enabled && enableDrag ? {
					onDragStart: handleDragStart,
					onDragEnd: handleDragEnd,
				}
			: undefined
		},
		fearureReturn: {
			rowOrderDrag: enabled && enableDrag
				? {
						activeRowId,
						isDragging: activeRowId != null,
					}
			: undefined,
		}
	}
}

function moveRowById<TData>(
	data: TData[],
	sourceId: string,
	targetId: string,
	context: DataGridFeatureContext<TData> | undefined
) {
	if (!context) return data;

	const sourceIndex = data.findIndex((row, index) => context.getRowId(row, index) === sourceId);
	const targetIndex = data.findIndex((row, index) => context.getRowId(row, index) === targetId);

	if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
		return data;
	}

	const nextData = data.slice();
	const [sourceRow] = nextData.splice(sourceIndex, 1);
	nextData.splice(targetIndex, 0, sourceRow);

	return nextData;
}
