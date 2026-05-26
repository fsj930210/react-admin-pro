import type { Column, Table } from "@tanstack/react-table";

export interface DataGridColumnOrderModel {
	leafIds: string[];
	leafIdSet: Set<string>;
	leafIdsById: Map<string, string[]>;
	parentIdById: Map<string, string | undefined>;
	pinZoneById: Map<string, DataGridColumnPinZone>;
}

export type DataGridColumnPinZone = "left" | "center" | "right" | "mixed";

export function createColumnOrderModel<TData>(table: Table<TData>) {
	const leafIds: string[] = [];
	const leafIdSet = new Set<string>();
	const leafIdsById = new Map<string, string[]>();
	const parentIdById = new Map<string, string | undefined>();
	const pinZoneById = new Map<string, DataGridColumnPinZone>();

	const walk = (columns: Column<TData, unknown>[], parentId?: string): string[] => {
		const result: string[] = [];

		for (const column of columns) {
			parentIdById.set(column.id, parentId);

			if (column.columns.length) {
				const childLeafIds = walk(column.columns, column.id);
				leafIdsById.set(column.id, childLeafIds);
				pinZoneById.set(column.id, getSharedPinZone(childLeafIds, pinZoneById));
				result.push(...childLeafIds);
				continue;
			}

			const pinZone = column.getIsPinned() || "center";
			leafIds.push(column.id);
			leafIdSet.add(column.id);
			leafIdsById.set(column.id, [column.id]);
			pinZoneById.set(column.id, pinZone);
			result.push(column.id);
		}

		return result;
	};

	walk(table.getAllColumns());

	return { leafIds, leafIdSet, leafIdsById, parentIdById, pinZoneById };
}

export function normalizeColumnOrder(
	columnOrder: string[] | undefined,
	model: DataGridColumnOrderModel,
) {
	const normalized: string[] = [];
	const sourceOrder = columnOrder?.length ? columnOrder : model.leafIds;

	for (const id of sourceOrder) {
		for (const leafId of getLeafIdsForColumn(id, model)) {
			if (!normalized.includes(leafId)) {
				normalized.push(leafId);
			}
		}
	}

	for (const leafId of model.leafIds) {
		if (!normalized.includes(leafId)) {
			normalized.push(leafId);
		}
	}

	return normalized;
}

export function moveColumnByTarget(
	order: string[],
	sourceId: string,
	targetId: string,
	model: DataGridColumnOrderModel,
) {
	if (!canMoveColumnByTarget(sourceId, targetId, model)) {
		return order;
	}

	const isSourceLeaf = model.leafIdSet.has(sourceId);
	const isTargetLeaf = model.leafIdSet.has(targetId);

	if (isSourceLeaf && isTargetLeaf) {
		return moveBlockToIndex(order, [sourceId], order.indexOf(targetId), model);
	}

	const sourceBlock = getLeafIdsForColumn(sourceId, model);
	const targetBlock = getLeafIdsForColumn(targetId, model);
	return moveBlockToBlock(order, sortByCurrentOrder(sourceBlock, order), targetBlock, model);
}

export function canMoveColumnByTarget(
	sourceId: string,
	targetId: string,
	model: DataGridColumnOrderModel,
) {
	if (sourceId === targetId) return false;

	const sourceZone = model.pinZoneById.get(sourceId);
	const targetZone = model.pinZoneById.get(targetId);
	if (!sourceZone || sourceZone === "mixed" || sourceZone !== targetZone) {
		return false;
	}

	const isSourceLeaf = model.leafIdSet.has(sourceId);
	const isTargetLeaf = model.leafIdSet.has(targetId);

	if (isSourceLeaf || isTargetLeaf) {
		return (
			isSourceLeaf &&
			isTargetLeaf &&
			model.parentIdById.get(sourceId) === model.parentIdById.get(targetId)
		);
	}

	return model.parentIdById.get(sourceId) === model.parentIdById.get(targetId);
}

export function getLeafIdsForColumn(id: string, model: DataGridColumnOrderModel) {
	return model.leafIdsById.get(id) ?? [];
}

export function getColumnDragGroup(id: string, model: DataGridColumnOrderModel) {
	const zone = model.pinZoneById.get(id);
	const parentId = model.parentIdById.get(id) ?? "__root__";
	return zone && zone !== "mixed" ? `${zone}:${parentId}` : undefined;
}

function moveBlockToBlock(
	order: string[],
	sourceBlock: string[],
	targetBlock: string[],
	model: DataGridColumnOrderModel,
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

	return normalizeColumnOrder(insertBlock(strippedOrder, sourceBlock, insertIndex), model);
}

function moveBlockToIndex(
	order: string[],
	sourceBlock: string[],
	toIndex: number,
	model: DataGridColumnOrderModel,
) {
	const existingBlock = sourceBlock.filter((id) => order.includes(id));
	if (!existingBlock.length) return order;

	const strippedOrder = order.filter((id) => !existingBlock.includes(id));
	return normalizeColumnOrder(insertBlock(strippedOrder, existingBlock, toIndex), model);
}

function insertBlock(order: string[], block: string[], index: number) {
	const nextOrder = [...order];
	nextOrder.splice(clampIndex(index, nextOrder.length), 0, ...block);
	return nextOrder;
}

function getSharedPinZone(
	leafIds: string[],
	pinZoneById: Map<string, DataGridColumnPinZone>,
): DataGridColumnPinZone {
	const zones = new Set(leafIds.map((leafId) => pinZoneById.get(leafId)));
	if (zones.size !== 1) return "mixed";
	return (zones.values().next().value ?? "center") as DataGridColumnPinZone;
}

function sortByCurrentOrder(ids: string[], order: string[]) {
	return [...ids].sort((left, right) => order.indexOf(left) - order.indexOf(right));
}

function getRange(order: string[], ids: string[]) {
	const indices = ids.map((id) => order.indexOf(id)).filter((index) => index !== -1);
	if (!indices.length) return undefined;
	return { start: Math.min(...indices), end: Math.max(...indices) };
}

function rangesOverlap(
	left: { start: number; end: number },
	right: { start: number; end: number },
) {
	return left.start <= right.end && right.start <= left.end;
}

function clampIndex(index: number, max: number) {
	if (!Number.isFinite(index)) return 0;
	return Math.min(Math.max(Math.trunc(index), 0), max);
}
