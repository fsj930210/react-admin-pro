import type { ColumnDef, GroupColumnDef } from "@tanstack/react-table";
import { useRef } from "react";

function normalizeColumns<TData>(
	columns: ColumnDef<TData>[],
	parentId?: string,
	parentIndex?: string
): { normalized: ColumnDef<TData>[]; hasError: boolean } {
	let hasError = false;

	const normalized = columns.map((column, index) => {
		const currentIndex = parentIndex !== undefined ? `${parentIndex}-${index}` : `${index}`;

		let id = column.id;
		if (!id) {
			const accessorKey = (column as { accessorKey?: string }).accessorKey;
			if (accessorKey) {
				id = parentId ? `${parentId}-${accessorKey}` : accessorKey;
			} else {
				id = parentId ? `${parentId}-user-column-${currentIndex}` : currentIndex;
				hasError = true;
			}
		} else if (parentId) {
			id = `${parentId}-${id}`;
		}

		const groupColumn = column as GroupColumnDef<TData>;
		let nestedColumns: ColumnDef<TData>[] | undefined;
		if (groupColumn.columns && groupColumn.columns.length > 0) {
			const result = normalizeColumns(groupColumn.columns, id, currentIndex);
			nestedColumns = result.normalized;
			if (result.hasError) {
				hasError = true;
			}
		}

		return {
			...column,
			id,
			...(nestedColumns !== undefined && { columns: nestedColumns }),
		};
	});

	return { normalized, hasError };
}

function areColumnsEqual<TData>(
	prev: ColumnDef<TData>[],
	next: ColumnDef<TData>[]
): boolean {
	if (prev.length !== next.length) return false;
	return prev.every((col, index) => {
		const nextCol = next[index] as GroupColumnDef<TData>;
		if (col.id !== nextCol.id) return false;
		const groupCol = col as GroupColumnDef<TData>;
		if (groupCol.columns || nextCol.columns) {
			if (!groupCol.columns || !nextCol.columns) return false;
			return areColumnsEqual(groupCol.columns, nextCol.columns);
		}
		return true;
	});
}

export function useNormalizeColumns<TData>(userColumns: ColumnDef<TData>[]) {
	const previousColumnsRef = useRef<ColumnDef<TData>[]>([]);

	const { normalized, hasError } = normalizeColumns(userColumns);

	if (hasError && process.env.NODE_ENV === "development") {
		console.warn(
			"[useNormalizeColumns]: Some columns are missing an `id` or `accessorKey`. " +
				"Please provide an `id` or `accessorKey` for each column to ensure stable column identity."
		);
	}

	const prev = previousColumnsRef.current;
	if (areColumnsEqual(prev, normalized)) {
		return prev;
	}

	previousColumnsRef.current = normalized;
	return normalized;
}