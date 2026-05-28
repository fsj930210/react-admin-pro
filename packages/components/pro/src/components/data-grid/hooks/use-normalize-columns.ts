import type { ColumnDef, GroupColumnDef } from "@tanstack/react-table";
import { useRef } from "react";

function getAccessorKey(column: ColumnDef<unknown>) {
	const accessorKey = (column as { accessorKey?: string | number | symbol }).accessorKey;
	return accessorKey == null ? undefined : String(accessorKey);
}

function normalizeColumns<TData>(
	columns: ColumnDef<TData>[],
	parentId?: string,
	parentIndex?: string,
): { hasFallbackId: boolean; normalized: ColumnDef<TData>[] } {
	let hasFallbackId = false;

	const normalized = columns.map((column, index) => {
		const currentIndex = parentIndex ? `${parentIndex}-${index}` : String(index);
		const columnWithUnknownData = column as ColumnDef<unknown>;
		const hasExplicitSize = Object.prototype.hasOwnProperty.call(column, "size");
		const explicitId = column.id;
		const accessorKey = getAccessorKey(columnWithUnknownData);
		let id = explicitId ?? accessorKey;

		if (!id) {
			id = `column-${currentIndex}`;
			hasFallbackId = true;
		}

		const alreadyNormalizedForParent =
			parentId != null && explicitId != null && column.meta?.parentId === parentId;
		const normalizedId = alreadyNormalizedForParent ? explicitId : parentId ? `${parentId}-${id}` : id;
		const groupColumn = column as GroupColumnDef<TData>;
		const nestedColumns = groupColumn.columns;
		const nestedResult = nestedColumns?.length
			? normalizeColumns(nestedColumns, normalizedId, currentIndex)
			: undefined;

		if (nestedResult?.hasFallbackId) {
			hasFallbackId = true;
		}

		return {
			...column,
			id: normalizedId,
			meta: {
				...column.meta,
				parentId,
				__rapDataGridExplicitSize: hasExplicitSize,
			},
			...(nestedResult ? { columns: nestedResult.normalized } : {}),
		} as ColumnDef<TData>;
	});

	return { hasFallbackId, normalized };
}

function haveSameColumnStructure<TData>(
	previous: ColumnDef<TData>[],
	next: ColumnDef<TData>[],
): boolean {
	if (previous.length !== next.length) {
		return false;
	}

	return previous.every((previousColumn, index) => {
		const nextColumn = next[index] as GroupColumnDef<TData>;
		const previousGroupColumn = previousColumn as GroupColumnDef<TData>;

		if (previousColumn.id !== nextColumn.id) {
			return false;
		}

		if (previousGroupColumn.columns || nextColumn.columns) {
			if (!previousGroupColumn.columns || !nextColumn.columns) {
				return false;
			}
			return haveSameColumnStructure(previousGroupColumn.columns, nextColumn.columns);
		}

		return true;
	});
}

function syncColumnDefinitions<TData>(target: ColumnDef<TData>[], source: ColumnDef<TData>[]) {
	for (let index = 0; index < target.length; index += 1) {
		const targetColumn = target[index] as GroupColumnDef<TData>;
		const sourceColumn = source[index] as GroupColumnDef<TData>;
		const targetNested = targetColumn.columns;
		const sourceNested = sourceColumn.columns;

		Object.assign(targetColumn, sourceColumn);

		if (targetNested && sourceNested) {
			targetColumn.columns = targetNested;
			syncColumnDefinitions(targetNested, sourceNested);
		}
	}
}

function shouldWarnFallbackId() {
	return (
		(globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV ===
		"development"
	);
}

export function useNormalizeColumns<TData>(columns: ColumnDef<TData>[]) {
	const columnsRef = useRef<ColumnDef<TData>[]>([]);
	const warnedRef = useRef(false);
	const { hasFallbackId, normalized } = normalizeColumns(columns);

	if (hasFallbackId && shouldWarnFallbackId() && !warnedRef.current) {
		warnedRef.current = true;
		// biome-ignore lint/suspicious/noConsole: development-only warning for unstable column ids
		console.warn(
			"[DataGrid]: Some columns are missing an `id` or `accessorKey`. " +
				"Provide one of them to keep column identity stable across renders.",
		);
	}

	if (haveSameColumnStructure(columnsRef.current, normalized)) {
		syncColumnDefinitions(columnsRef.current, normalized);
		return columnsRef.current;
	}

	columnsRef.current = normalized;
	return normalized;
}
