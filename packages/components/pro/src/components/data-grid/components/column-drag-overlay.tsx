import { flexRender, type Header, type Table } from "@tanstack/react-table";
import { GridCell } from "./grid";
import type { ColumnOrderDragState, DataGridConfig } from "../types";
import { getColumnBlockWidth } from "../utils/column-drag-transform";

interface ColumnDragOverlayProps<TData> {
	table: Table<TData>;
	config: DataGridConfig;
	columnOrderDrag?: ColumnOrderDragState;
}

export function ColumnDragOverlay<TData>({
	table,
	config,
	columnOrderDrag,
}: ColumnDragOverlayProps<TData>) {
	const activeColumnId = columnOrderDrag?.activeColumnId;

	if (!activeColumnId) return null;

	const header = table.getFlatHeaders().find((item) => item.column.id === activeColumnId);

	if (!header) return null;

	return (
		<HeaderOverlayCell<TData>
			header={header}
			config={config}
		/>
	);
}

interface HeaderOverlayCellProps<TData> {
	header: Header<TData, unknown>;
	config: DataGridConfig;
}

function HeaderOverlayCell<TData>({ header, config }: HeaderOverlayCellProps<TData>) {
	const enableResizing = config?.columnResizing?.enable;
	const leafColumns = header.column.getLeafColumns();
	const widthById = new Map(leafColumns.map((column) => [column.id, column.getSize()]));
	const width = getColumnBlockWidth(
		leafColumns.map((column) => column.id),
		widthById
	);

	return (
		<GridCell
			className="bg-muted border shadow-md pointer-events-none"
			colSpan={header.colSpan}
			rowSpan={header.rowSpan}
			style={{
				width: enableResizing ? width : undefined,
			}}
		>
			<div className="size-full flex items-center">
				{header.isPlaceholder
					? null
					: flexRender(header.column.columnDef.header, header.getContext())}
			</div>
		</GridCell>
	);
}
