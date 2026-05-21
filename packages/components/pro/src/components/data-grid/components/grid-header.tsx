"use client"

import { flexRender, type Table, type Header } from "@tanstack/react-table"
import { RestrictToHorizontalAxis } from '@dnd-kit/abstract/modifiers';
import { useSortable } from '@dnd-kit/react/sortable';
import { HeaderSeparator } from "./header-separator";
import { cn } from "@rap/utils";
import { GridCell, GridRow } from "./grid";
import type { ColumnOrderDragState, DataGridConfig } from "../types";
import { getColumnDragTransforms } from "../utils/column-drag-transform";


interface DataGridHeaderProps<TData> {
	table: Table<TData>;
	enableDrag?: boolean;
	dragType?: 'row' | 'column';
	border?: boolean;
	config: DataGridConfig;
	columnOrderDrag?: ColumnOrderDragState;
}

export function DataGridHeader<TData>({ table, enableDrag, dragType, border, config, columnOrderDrag }: DataGridHeaderProps<TData>) {
	const leafColumns = table.getAllLeafColumns();
	const columnTransforms = getColumnDragTransforms(
		leafColumns.map((column) => ({
			id: column.id,
			width: column.getSize(),
		})),
		table.getFlatHeaders().map((header) => ({
			id: header.column.id,
			leafIds: header.column.getLeafColumns().map((column) => column.id),
		})),
		columnOrderDrag
	);

	return (
		<>
			{table.getHeaderGroups().map((headerGroup) => {
				return (
					<GridRow key={headerGroup.id}>
						{headerGroup.headers.map((header, index) => {
							return enableDrag && dragType === 'column' && !header.isPlaceholder ? (
								<SortableHeaderCell
									key={header.id}
									header={header}
									index={index}
									border={border}
									config={config}
									isDragSource={columnOrderDrag?.activeColumnId === header.column.id}
									transform={columnTransforms.get(header.column.id)}
									isColumnDragging={columnOrderDrag?.isDragging}
								/>
							) : (
								<HeaderCell
									key={header.id}
									header={header}
									border={border}
									config={config}
								/>
							)
						})}
					</GridRow>
				)
			})}
		</>
	)
}


interface SortableCellProps<TData> {
	header: Header<TData, unknown>;
	index: number;
	border?: boolean;
	config: DataGridConfig;
	isDragSource?: boolean;
	transform?: number;
	isColumnDragging?: boolean;
}

function SortableHeaderCell<TData>({ header, index, border, config, isDragSource, transform, isColumnDragging }: SortableCellProps<TData>) {
	const { ref: sortableRef, handleRef: dragHandleRef } = useSortable({
		id: header.column.id,
		index,
		type: 'column',
		accept: 'column',
		disabled: false,
		modifiers: [RestrictToHorizontalAxis],
	});
	return (
		<HeaderCell
			sortableRef={sortableRef}
			header={header}
			border={border}
			config={config}
			dragHandleRef={dragHandleRef}
			isDragSource={isDragSource}
			transform={transform}
			isColumnDragging={isColumnDragging}
		/>
	);
}

interface HeaderCellProps<TData> {
	header: Header<TData, unknown>;
	border?: boolean;
	config: DataGridConfig;
	sortableRef?: (element: Element | null) => void;
	dragHandleRef?: (element: HTMLDivElement | null) => void;
	isDragSource?: boolean;
	transform?: number;
	isColumnDragging?: boolean;
}

function HeaderCell<TData>({ header, border, config, sortableRef, dragHandleRef, isDragSource, transform, isColumnDragging }: HeaderCellProps<TData>) {
	const enableResizing = config?.columnResizing?.enable;
	return (
		<GridCell
			ref={sortableRef}
			className={cn(
				"relative group/th",
				isDragSource && "opacity-30",
				border && !(header.colSpan && header.colSpan > 1) ? 'border-r' : ''
			)}
			colSpan={header.colSpan}
			rowSpan={header.rowSpan}
			style={{
				width: enableResizing ? header.getSize() : undefined,
				transform: transform ? `translateX(${transform}px)` : undefined,
				transition: isColumnDragging ? "transform 180ms cubic-bezier(0.2, 0, 0, 1)" : undefined,
			}}
		>

			<div ref={dragHandleRef} className="size-full flex items-center">
				{header.isPlaceholder
					? null
					: flexRender(header.column.columnDef.header, header.getContext())}

			</div>
			{
				border && !enableResizing ? null : (
					<HeaderSeparator<TData> header={header} border={border} />
				)
			}
		</GridCell>
	);
}
