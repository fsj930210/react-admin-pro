import { useMemo, useRef } from "react";
import type {
  ColumnDef,
  ColumnOrderState,
  GroupColumnDef,
  OnChangeFn,
} from "@tanstack/react-table";
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/abstract";
import { useControllableState } from "../hooks/use-controllable-state";
import type { ColumnOrderConfig, DataGridFeature } from "../types";

interface ColumnOrderModel {
  leafIds: string[];
  leafIdSet: Set<string>;
  leafIdsById: Map<string, string[]>;
  parentIdById: Map<string, string | undefined>;
}

export function useColumnOrder<TData>(
  columns: ColumnDef<TData>[],
  config?: ColumnOrderConfig
): DataGridFeature {
  const model = useMemo(() => createColumnOrderModel(columns), [columns]);
  const fallbackOrder = model.leafIds;
  const defaultColumnOrder = normalizeColumnOrder(
    config?.defaultColumnOrder,
    model,
    fallbackOrder
  );
  const controlledColumnOrder = config?.columnOrder
    ? normalizeColumnOrder(config.columnOrder, model, fallbackOrder)
    : undefined;

  const [columnOrder, setColumnOrderValue] = useControllableState<string[]>(
    defaultColumnOrder,
    {
      defaultValue: defaultColumnOrder,
      value: controlledColumnOrder,
      onChange: config?.onChange,
    }
  );

  const safeColumnOrder = normalizeColumnOrder(columnOrder, model, fallbackOrder);
  const initialOrderRef = useRef(safeColumnOrder);
  const lastDragTargetRef = useRef<string | undefined>(undefined);

  const setColumnOrder: OnChangeFn<ColumnOrderState> = (updater) => {
    const nextOrder = normalizeColumnOrder(
      typeof updater === "function" ? updater(safeColumnOrder) : updater,
      model,
      fallbackOrder
    );

    if (!isSameOrder(safeColumnOrder, nextOrder)) {
      setColumnOrderValue(nextOrder);
    }
  };

  const handleDragStart = (_: DragStartEvent) => {
    initialOrderRef.current = safeColumnOrder;
    lastDragTargetRef.current = undefined;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { source, target } = event.operation;

    if (source?.type !== "column") return;

    const sourceId = String(source.id);
    const targetId = target?.id == null ? undefined : String(target.id);

    if (!targetId || sourceId === targetId || lastDragTargetRef.current === targetId) {
      return;
    }

    lastDragTargetRef.current = targetId;
    setColumnOrder((order) => moveColumnByTarget(order, sourceId, targetId, model));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    lastDragTargetRef.current = undefined;

    if (event.canceled) {
      setColumnOrder(initialOrderRef.current);
    }
  };

  const moveColumns = (columnIds: string[], toIndex: number) => {
    setColumnOrder((order) => moveColumnsToIndex(order, columnIds, toIndex, model));
  };

  const moveColumnByIndex = (fromIndex: number, toIndex: number) => {
    if (!isValidIndex(fromIndex, safeColumnOrder.length)) return;

    moveColumns([safeColumnOrder[fromIndex]], toIndex);
  };

  const resetColumnOrder = () => {
    setColumnOrder(defaultColumnOrder);
  };

  const enabled = config?.enable ?? false;
  const enableDrag = config?.enableDrag ?? false;
  return {
    state: enabled ? { columnOrder: safeColumnOrder } : {},
    callbacks: enabled ? { onColumnOrderChange: setColumnOrder } : {},
    api: {
      moveColumns,
      moveColumnByIndex,
      resetColumnOrder,
    },
    dndCallbacks: enabled && enableDrag
      ? {
          onDragStart: handleDragStart,
          onDragOver: handleDragOver,
          onDragEnd: handleDragEnd,
        }
      : undefined,
    enableDrag: enabled && enableDrag,
    dragType: "column",
  };
}

function createColumnOrderModel<TData>(columns: ColumnDef<TData>[]): ColumnOrderModel {
  const leafIds: string[] = [];
  const leafIdsById = new Map<string, string[]>();
  const parentIdById = new Map<string, string | undefined>();

  const walk = (items: ColumnDef<TData>[]) => {
    for (const column of items) {
      const id = column.id;
      if (!id) continue;

      const groupColumn = column as GroupColumnDef<TData>;
      const children = Array.isArray(groupColumn.columns) ? groupColumn.columns : undefined;
      const parentId = column.meta?.parentId;
      parentIdById.set(id, parentId);

      if (children?.length) {
        const groupLeafIds = walk(children);
        leafIdsById.set(id, groupLeafIds);
        continue;
      }

      leafIds.push(id);
      leafIdsById.set(id, [id]);
    }

    return items.flatMap((column) => {
      const id = column.id;
      return id ? (leafIdsById.get(id) ?? []) : [];
    });
  };

  walk(columns);

  return {
    leafIds,
    leafIdSet: new Set(leafIds),
    leafIdsById,
    parentIdById,
  };
}

function normalizeColumnOrder(
  columnOrder: string[] | undefined,
  model: ColumnOrderModel,
  fallbackOrder: string[]
) {
  const normalized: string[] = [];
  const sourceOrder = columnOrder?.length ? columnOrder : fallbackOrder;

  for (const id of sourceOrder) {
    for (const leafId of getLeafIdsForColumn(id, model)) {
      if (!normalized.includes(leafId)) {
        normalized.push(leafId);
      }
    }
  }

  for (const leafId of fallbackOrder) {
    if (!normalized.includes(leafId)) {
      normalized.push(leafId);
    }
  }

  return normalized;
}

function moveColumnByTarget(
  order: string[],
  sourceId: string,
  targetId: string,
  model: ColumnOrderModel
) {
  const sourceParentId = model.parentIdById.get(sourceId);
  const targetParentId = model.parentIdById.get(targetId);
  const isSourceLeaf = model.leafIdSet.has(sourceId);
  const isTargetLeaf = model.leafIdSet.has(targetId);

  if (
    sourceParentId &&
    sourceParentId === targetParentId &&
    isSourceLeaf &&
    isTargetLeaf
  ) {
    return moveBlockToIndex(order, [sourceId], order.indexOf(targetId), "at", model);
  }

  const sourceBlock = getMovableBlock(sourceId, model, order);
  const targetBlock = getMovableBlock(targetId, model, order);

  if (!sourceBlock.length || !targetBlock.length) return order;

  return moveBlockToBlock(order, sourceBlock, targetBlock, model);
}

function moveColumnsToIndex(
  order: string[],
  columnIds: string[],
  toIndex: number,
  model: ColumnOrderModel
) {
  const sourceBlock = getUniqueColumnBlock(columnIds, model, order);

  if (!sourceBlock.length) return order;

  return moveBlockToIndex(order, sourceBlock, toIndex, "boundary", model);
}

function moveBlockToBlock(
  order: string[],
  sourceBlock: string[],
  targetBlock: string[],
  model: ColumnOrderModel
) {
  const sourceRange = getRange(order, sourceBlock);
  const targetRange = getRange(order, targetBlock);

  if (!sourceRange || !targetRange || rangesOverlap(sourceRange, targetRange)) {
    return order;
  }

  const strippedOrder = order.filter((id) => !sourceBlock.includes(id));
  const targetIndices = targetBlock
    .map((id) => strippedOrder.indexOf(id))
    .filter((index) => index !== -1);

  if (!targetIndices.length) return order;

  const insertIndex =
    sourceRange.start < targetRange.start
      ? Math.max(...targetIndices) + 1
      : Math.min(...targetIndices);

  return insertBlock(strippedOrder, sourceBlock, clampIndex(insertIndex, strippedOrder.length), model);
}

function moveBlockToIndex(
  order: string[],
  sourceBlock: string[],
  toIndex: number,
  mode: "at" | "boundary",
  model: ColumnOrderModel
) {
  const existingBlock = sourceBlock.filter((id) => order.includes(id));
  if (!existingBlock.length) return order;

  const strippedOrder = order.filter((id) => !existingBlock.includes(id));
  const insertIndex = clampIndex(toIndex, strippedOrder.length);
  const safeIndex =
    mode === "boundary"
      ? getNearestGroupBoundary(strippedOrder, insertIndex, model)
      : insertIndex;

  return insertBlock(strippedOrder, existingBlock, safeIndex, model);
}

function insertBlock(
  order: string[],
  sourceBlock: string[],
  insertIndex: number,
  model: ColumnOrderModel
) {
  const nextOrder = [...order];
  nextOrder.splice(insertIndex, 0, ...sourceBlock);
  return normalizeGroupedOrder(nextOrder, model);
}

function normalizeGroupedOrder(order: string[], model: ColumnOrderModel) {
  const result = [...order];

  for (const [id, block] of model.leafIdsById) {
    if (model.leafIdSet.has(id) || block.length <= 1) continue;

    const indices = block.map((leafId) => result.indexOf(leafId));
    if (indices.some((index) => index === -1)) continue;

    const sortedIndices = [...indices].sort((a, b) => a - b);
    const isContiguous = sortedIndices.every((index, itemIndex) => {
      return itemIndex === 0 || index === sortedIndices[itemIndex - 1] + 1;
    });

    if (isContiguous) continue;

    const orderedBlock = sortByCurrentOrder(block, result);
    const insertIndex = sortedIndices[0];
    const remaining = result.filter((leafId) => !block.includes(leafId));
    remaining.splice(insertIndex, 0, ...orderedBlock);
    return normalizeGroupedOrder(remaining, model);
  }

  return result;
}

function getMovableBlock(id: string, model: ColumnOrderModel, order: string[]) {
  if (model.leafIdsById.has(id) && !model.leafIdSet.has(id)) {
    return sortByCurrentOrder(model.leafIdsById.get(id) ?? [], order);
  }

  const parentId = model.parentIdById.get(id);
  const block = parentId ? getLeafIdsForColumn(parentId, model) : getLeafIdsForColumn(id, model);
  return sortByCurrentOrder(block, order);
}

function getUniqueColumnBlock(ids: string[], model: ColumnOrderModel, order: string[]) {
  const result: string[] = [];

  for (const id of ids) {
    for (const leafId of getMovableBlock(id, model, order)) {
      if (!result.includes(leafId)) {
        result.push(leafId);
      }
    }
  }

  return result;
}

function getLeafIdsForColumn(id: string, model: ColumnOrderModel) {
  return model.leafIdsById.get(id) ?? [];
}

function sortByCurrentOrder(ids: string[], order: string[]) {
  return [...ids].sort((left, right) => order.indexOf(left) - order.indexOf(right));
}

function getNearestGroupBoundary(order: string[], index: number, model: ColumnOrderModel) {
  for (const block of model.leafIdsById.values()) {
    if (block.length <= 1) continue;

    const range = getRange(order, block);
    if (!range || index <= range.start || index >= range.end + 1) continue;

    const distanceToStart = index - range.start;
    const distanceToEnd = range.end + 1 - index;
    return distanceToStart <= distanceToEnd ? range.start : range.end + 1;
  }

  return index;
}

function getRange(order: string[], ids: string[]) {
  const indices = ids.map((id) => order.indexOf(id)).filter((index) => index !== -1);

  if (!indices.length) return undefined;

  return {
    start: Math.min(...indices),
    end: Math.max(...indices),
  };
}

function rangesOverlap(
  left: { start: number; end: number },
  right: { start: number; end: number }
) {
  return left.start <= right.end && right.start <= left.end;
}

function clampIndex(index: number, max: number) {
  if (!Number.isFinite(index)) return 0;
  return Math.min(Math.max(Math.trunc(index), 0), max);
}

function isValidIndex(index: number, length: number) {
  return Number.isInteger(index) && index >= 0 && index < length;
}

function isSameOrder(left: string[], right: string[]) {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}
