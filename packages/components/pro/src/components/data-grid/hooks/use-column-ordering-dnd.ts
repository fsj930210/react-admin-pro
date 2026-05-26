import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/abstract";
import type { Header, Table } from "@tanstack/react-table";
import { useMemo, useRef, useState } from "react";
import {
	canMoveColumnByTarget,
	createColumnOrderModel,
	moveColumnByTarget,
	normalizeColumnOrder,
} from "../utils/column-ordering";

export interface ColumnOrderingDragState<TData> {
	activeColumnId?: string;
	activeColumnTitle?: string;
	canDragHeader: (header: Header<TData, unknown>) => boolean;
	onDragStart: (event: DragStartEvent) => void;
	onDragOver: (event: DragOverEvent) => void;
	onDragEnd: (event: DragEndEvent) => void;
}

export function useColumnOrderingDnd<TData>(
	table: Table<TData>,
	enabled: boolean,
): ColumnOrderingDragState<TData> | undefined {
	const [activeColumnId, setActiveColumnId] = useState<string | undefined>();
	const [activeColumnTitle, setActiveColumnTitle] = useState<string | undefined>();
	const initialOrderRef = useRef<string[]>([]);
	const previewOrderRef = useRef<string[]>([]);
	const lastTargetRef = useRef<string | undefined>(undefined);
	const model = useMemo(() => createColumnOrderModel(table), [table]);

	if (!enabled) {
		return undefined;
	}

	const getSafeOrder = () => normalizeColumnOrder(table.getState().columnOrder, model);

	return {
		activeColumnId,
		activeColumnTitle,
		canDragHeader: (header) => {
			if (header.isPlaceholder) return false;
			const zone = model.pinZoneById.get(header.column.id);
			return Boolean(zone && zone !== "mixed");
		},
		onDragStart: (event) => {
			if (event.operation.source?.type !== "column") return;

			const sourceId = event.operation.source.id;
			const safeOrder = getSafeOrder();
			initialOrderRef.current = safeOrder;
			previewOrderRef.current = safeOrder;
			lastTargetRef.current = undefined;
			const activeId = sourceId == null ? undefined : String(sourceId);
			setActiveColumnId(activeId);
			setActiveColumnTitle(activeId ? getColumnTitle(table, activeId) : undefined);
		},
		onDragOver: (event) => {
			const { source, target } = event.operation;
			if (source?.type !== "column" || source.id == null || target?.id == null) return;

			const sourceId = String(source.id);
			const targetId = String(target.id);
			if (sourceId === targetId || lastTargetRef.current === targetId) return;
			if (!canMoveColumnByTarget(sourceId, targetId, model)) return;
			if (!isTopMostColumnTarget(event, targetId)) return;

			lastTargetRef.current = targetId;
			const nextOrder = moveColumnByTarget(previewOrderRef.current, sourceId, targetId, model);
			previewOrderRef.current = nextOrder;
			table.setColumnOrder(nextOrder);
		},
		onDragEnd: (event) => {
			if (event.operation.source?.type !== "column") return;

			if (event.operation.canceled) {
				table.setColumnOrder(initialOrderRef.current);
			}

			lastTargetRef.current = undefined;
			setActiveColumnId(undefined);
			setActiveColumnTitle(undefined);
		},
	};
}

function isTopMostColumnTarget(event: DragOverEvent, targetId: string) {
	if (typeof document === "undefined") return true;

	const { x, y } = event.operation.position.current;
	const topElement = document.elementFromPoint(x, y);
	const columnElement = topElement?.closest("[data-rap-data-grid-column-id]");

	if (!columnElement) return false;
	return columnElement.getAttribute("data-rap-data-grid-column-id") === targetId;
}

function getColumnTitle<TData>(table: Table<TData>, columnId: string) {
	const column = table.getColumn(columnId);
	const header = column?.columnDef.header;
	const meta = column?.columnDef.meta as { title?: unknown } | undefined;

	if (typeof header === "string") return header;
	if (typeof meta?.title === "string") return meta.title;
	return columnId;
}
