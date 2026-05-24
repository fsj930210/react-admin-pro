import type { ColumnDef } from "@tanstack/react-table";
import type { CreateColumnFactory, DataGridConfig } from "../types";




export function buildColumnsFromFactories<TData>(
	config: DataGridConfig<TData>,
	factories: CreateColumnFactory<TData>[] = []
): {
	prependColumns: ColumnDef<TData>[];
	appendColumns: ColumnDef<TData>[];
} {
	const prependColumns: ColumnDef<TData>[] = [];
	const appendColumns: ColumnDef<TData>[] = [];

	for (const factory of factories) {
		if (factory.shouldCreate(config)) {
			const column = factory.create(config);
			if (factory.position === "prepend") {
				prependColumns.push(column);
			} else {
				appendColumns.push(column);
			}
		}
	}

	return { prependColumns, appendColumns };
}
