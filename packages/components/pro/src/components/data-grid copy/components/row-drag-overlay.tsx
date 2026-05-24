import { flexRender, type Table } from "@tanstack/react-table";
import { GridCell, GridRow } from "./grid";
import type { DataGridConfig, RowOrderDragState } from "../types";

interface RowDragOverlayProps<TData> {
	table: Table<TData>;
	config: DataGridConfig<TData>;
	rowOrderDrag?: RowOrderDragState;
	border?: boolean;
}

export function RowDragOverlay<TData>({
	table,
	config,
	rowOrderDrag,
	border,
}: RowDragOverlayProps<TData>) {
	const activeRowId = rowOrderDrag?.activeRowId;

	if (!activeRowId) return null;

	const row = table.getRowModel().rows.find((item) => item.id === activeRowId);

	if (!row) return null;

	const enableResizing = config?.columnResizing?.enable;

	return (
		<GridRow className="bg-background shadow-md pointer-events-none">
			{row.getVisibleCells().map((cell) => {
				const context = cell.getContext();

				return (
					<GridCell
						key={cell.id}
						className={border ? "border-r truncate" : ""}
						style={{
							width: enableResizing ? cell.column.getSize() : undefined,
						}}
					>
						{flexRender(cell.column.columnDef.cell, {
							...context,
						})}
					</GridCell>
				);
			})}
		</GridRow>
	);
}
