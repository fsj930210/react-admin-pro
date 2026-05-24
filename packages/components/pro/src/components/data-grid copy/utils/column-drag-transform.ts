import type { ColumnOrderDragState } from "../types";

interface ColumnTransformItem {
	id: string;
	width: number;
}

interface ColumnTransformGroup {
	id: string;
	leafIds: string[];
}

export function getColumnDragTransforms(
	items: ColumnTransformItem[],
	groups: ColumnTransformGroup[] = [],
	columnOrderDrag?: ColumnOrderDragState
) {
	const transforms = new Map<string, number>();

	if (!columnOrderDrag?.isDragging) {
		return transforms;
	}

	const widthById = new Map(items.map((item) => [item.id, item.width]));
	const currentOrder = columnOrderDrag.columnOrder.filter((id) => widthById.has(id));
	const previewOrder = columnOrderDrag.previewColumnOrder.filter((id) => widthById.has(id));
	const currentLeftById = getColumnLeftById(currentOrder, widthById);
	const previewLeftById = getColumnLeftById(previewOrder, widthById);

	for (const id of currentOrder) {
		const currentLeft = currentLeftById.get(id);
		const previewLeft = previewLeftById.get(id);

		if (currentLeft == null || previewLeft == null) continue;

		const delta = previewLeft - currentLeft;

		if (delta !== 0) {
			transforms.set(id, delta);
		}
	}

	for (const group of groups) {
		const currentLeft = getBlockLeft(group.leafIds, currentLeftById);
		const previewLeft = getBlockLeft(group.leafIds, previewLeftById);

		if (currentLeft == null || previewLeft == null) continue;

		const delta = previewLeft - currentLeft;

		if (delta !== 0) {
			transforms.set(group.id, delta);
		}
	}

	return transforms;
}

export function getColumnBlockWidth(
	leafIds: string[],
	widthById: Map<string, number>
) {
	return leafIds.reduce((width, id) => width + (widthById.get(id) ?? 0), 0);
}

function getBlockLeft(leafIds: string[], leftById: Map<string, number>) {
	const lefts = leafIds
		.map((id) => leftById.get(id))
		.filter((left) => left != null);

	if (!lefts.length) return undefined;

	return Math.min(...lefts);
}

function getColumnLeftById(order: string[], widthById: Map<string, number>) {
	const leftById = new Map<string, number>();
	let left = 0;

	for (const id of order) {
		leftById.set(id, left);
		left += widthById.get(id) ?? 0;
	}

	return leftById;
}
