import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/abstract";
import type { Header, Table } from "@tanstack/react-table";
import { useMemo, useRef, useState } from "react";
import {
  createColumnOrderModel,
  moveColumnByTarget,
  normalizeColumnOrder,
} from "../utils/column-ordering";

export interface ColumnOrderingDragState<TData> {
  activeColumnId?: string;
  activeColumnTitle?: string;
  sortableColumnIds: string[];
  canDragHeader: (header: Header<TData, unknown>) => boolean;
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export function useColumnOrderingDnd<TData>(
  table: Table<TData>,
  enabled: boolean
): ColumnOrderingDragState<TData> | undefined {
  const [activeColumnId, setActiveColumnId] = useState<string | undefined>();
  const [activeColumnTitle, setActiveColumnTitle] = useState<string | undefined>();
  const initialOrderRef = useRef<string[] | null>(null);
  const hasPreviewOrderRef = useRef(false);
  const model = useMemo(() => createColumnOrderModel(table), [table]);

  if (!enabled) {
    return undefined;
  }

  return {
    activeColumnId,
    activeColumnTitle,
    sortableColumnIds: normalizeColumnOrder(table.getState().columnOrder, model).filter(
      (id) => table.getColumn(id)?.getIsVisible() && canDragColumnId(id, model)
    ),
    canDragHeader: (header) => {
      if (header.isPlaceholder) return false;
      if (!model.leafIdSet.has(header.column.id)) return false;
      return canDragColumnId(header.column.id, model);
    },
    onDragStart: (event) => {
      if (event.operation.source?.type !== "column") return;

      const sourceId = event.operation.source.id;
      const activeId = sourceId == null ? undefined : String(sourceId);
      initialOrderRef.current = normalizeColumnOrder(table.getState().columnOrder, model);
      hasPreviewOrderRef.current = false;
      setActiveColumnId(activeId);
      setActiveColumnTitle(activeId ? getColumnTitle(table, activeId) : undefined);
    },
    onDragOver: (event) => {
      if (event.operation.source?.type !== "column") return;

      const sourceId = event.operation.source.id;
      const targetId = getColumnTargetIdAtPoint(
        event,
        sourceId == null ? undefined : String(sourceId)
      );
      if (sourceId == null || targetId == null || sourceId === targetId) return;

      const order = normalizeColumnOrder(table.getState().columnOrder, model);
      const nextOrder = moveColumnByTarget(order, String(sourceId), targetId, model);
      if (isSameOrder(order, nextOrder)) return;

      hasPreviewOrderRef.current = true;
      table.setColumnOrder(nextOrder);
    },
    onDragEnd: (event) => {
      if (event.operation.source?.type !== "column") return;

      const sourceId = event.operation.source.id;
      const targetId = getColumnTargetIdAtPoint(
        event,
        sourceId == null ? undefined : String(sourceId)
      );
      if (
        !event.operation.canceled &&
        !hasPreviewOrderRef.current &&
        sourceId != null &&
        targetId != null
      ) {
        const order = normalizeColumnOrder(table.getState().columnOrder, model);
        table.setColumnOrder(moveColumnByTarget(order, String(sourceId), targetId, model));
      }
      if (event.operation.canceled && initialOrderRef.current) {
        table.setColumnOrder(initialOrderRef.current);
      }

      initialOrderRef.current = null;
      hasPreviewOrderRef.current = false;
      setActiveColumnId(undefined);
      setActiveColumnTitle(undefined);
    },
  };
}

function canDragColumnId(id: string, model: ReturnType<typeof createColumnOrderModel>) {
  const zone = model.pinZoneById.get(id);
  const parentId = model.parentIdById.get(id);
  const siblingCount = model.leafIds.filter(
    (leafId) =>
      model.pinZoneById.get(leafId) === zone && model.parentIdById.get(leafId) === parentId
  ).length;

  return Boolean(zone && zone !== "mixed" && siblingCount > 1);
}

function getColumnTargetIdAtPoint(event: DragEndEvent | DragOverEvent, sourceId?: string) {
  const fallbackTargetId = event.operation.target?.id;

  if (typeof document === "undefined") {
    return fallbackTargetId == null ? undefined : String(fallbackTargetId);
  }

  const { x, y } = getEventClientPoint(event);
  const targetByRect = getNearestTargetId(
    "[data-rap-data-grid-column-id]",
    "data-rap-data-grid-column-id",
    x,
    y,
    sourceId
  );
  if (targetByRect) return targetByRect;

  return fallbackTargetId == null ? undefined : String(fallbackTargetId);
}

function getEventClientPoint(event: DragEndEvent | DragOverEvent) {
  const nativeEvent = "nativeEvent" in event ? event.nativeEvent : undefined;
  if (
    nativeEvent &&
    "clientX" in nativeEvent &&
    "clientY" in nativeEvent &&
    typeof nativeEvent.clientX === "number" &&
    typeof nativeEvent.clientY === "number"
  ) {
    return { x: nativeEvent.clientX, y: nativeEvent.clientY };
  }

  return event.operation.position.current;
}

function isSameOrder(left: string[], right: string[]) {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

function getNearestTargetId(
  selector: string,
  attribute: string,
  x: number,
  y: number,
  sourceId?: string
) {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>(selector))
    .map((element) => {
      const id = element.getAttribute(attribute);
      const rect = element.getBoundingClientRect();
      return { id, rect };
    })
    .filter(
      (item): item is { id: string; rect: DOMRect } =>
        Boolean(item.id) && item.id !== sourceId && item.rect.width > 0 && item.rect.height > 0
    );

  const containing = candidates.find(
    ({ rect }) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
  );
  if (containing) return containing.id;

  return candidates
    .map((item) => ({
      id: item.id,
      distance: Math.hypot(
        x - (item.rect.left + item.rect.width / 2),
        y - (item.rect.top + item.rect.height / 2)
      ),
    }))
    .sort((left, right) => left.distance - right.distance)[0]?.id;
}

function getColumnTitle<TData>(table: Table<TData>, columnId: string) {
  const column = table.getColumn(columnId);
  const header = column?.columnDef.header;
  const meta = column?.columnDef.meta as { title?: unknown } | undefined;

  if (typeof header === "string") return header;
  if (typeof meta?.title === "string") return meta.title;
  return columnId;
}
