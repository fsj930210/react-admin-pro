"use client"

import { flexRender, type Table, type Header } from "@tanstack/react-table"
import { useState } from "react";
import { RestrictToHorizontalAxis } from '@dnd-kit/abstract/modifiers';
import { useSortable } from '@dnd-kit/react/sortable';
import { HeaderSeparator } from "./header-separator";
import { cn } from "@rap/utils";
import { GridCell, GridRow } from "./grid";
import type { ColumnOrderDragState, DataGridConfig } from "../types";
import { getColumnDragTransforms } from "../utils/column-drag-transform";
import { getColumnPinningClassName, getColumnPinningStyles } from "../utils/pinning-styles";
import { ColumnMenu } from "./column-menu";


interface DataGridHeaderProps<TData> {
	table: Table<TData>;
	dragType?: 'row' | 'column';
	border?: boolean;
	config: DataGridConfig<TData>;
	columnOrderDrag?: ColumnOrderDragState;
}

export function DataGridHeader<TData>({
	table,

	dragType,
	border,
	config,
	columnOrderDrag
}: DataGridHeaderProps<TData>) {
	const enableDrag = config?.columnOrder?.enable ?? false;
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
									enableDrag={enableDrag}
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
	config: DataGridConfig<TData>;
	isDragSource?: boolean;
	transform?: number;
	isColumnDragging?: boolean;
	enableDrag?: boolean;
}

function SortableHeaderCell<TData>({
	header,
	index,
	border,
	config,
	isDragSource,
	transform,
	isColumnDragging,
	enableDrag
}: SortableCellProps<TData>) {
	const { ref: sortableRef, handleRef: dragHandleRef } = useSortable({
		id: header.column.id,
		index,
		type: 'column',
		accept: 'column',
		disabled: !enableDrag,
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
	config: DataGridConfig<TData>;
	sortableRef?: (element: Element | null) => void;
	dragHandleRef?: (element: HTMLDivElement | null) => void;
	isDragSource?: boolean;
	transform?: number;
	isColumnDragging?: boolean;
}

function HeaderCell<TData>({
	header,
	border,
	config,
	sortableRef,
	dragHandleRef,
	isDragSource,
	transform,
	isColumnDragging
}: HeaderCellProps<TData>) {
	const enableResizing = config?.columnResizing?.enable;
	const enableColumnMenu = config.columnMenu?.enable ?? true;
	const [contextMenuOpen, setContextMenuOpen] = useState(false);
	const enablePinningStyles = header.colSpan === 1;
	const pinningStyles = enablePinningStyles
		? getColumnPinningStyles(header.column)
		: {
			position: "relative" as const,
			width: header.column.getSize(),
			zIndex: 20,
		};
	const width = enableResizing ? header.getSize() : pinningStyles.width;

	const content = (
		<GridCell
			ref={sortableRef}
			className={cn(
				"relative group/th overflow-hidden truncate bg-muted",
				enablePinningStyles && getColumnPinningClassName(header.column),
				isDragSource && "opacity-30",
				border && !(header.colSpan && header.colSpan > 1) ? 'border-r' : ''
			)}
			colSpan={header.colSpan}
			rowSpan={header.rowSpan}
				style={{
					...pinningStyles,
					width,
				minWidth: width,
				maxWidth: width,
				transform: transform ? `translateX(${transform}px)` : undefined,
					transition: isColumnDragging ? "transform 180ms cubic-bezier(0.2, 0, 0, 1)" : undefined,
					zIndex: enablePinningStyles && header.column.getIsPinned() ? 21 : 20,
				}}
				onContextMenu={(event) => {
					if (!enableColumnMenu || header.isPlaceholder || !(config.columnMenu?.contextMenu ?? true)) return;
					event.preventDefault();
					setContextMenuOpen(true);
				}}
		>
			<div ref={dragHandleRef} className="size-full flex items-center justify-between gap-1">
				<div className="min-w-0 flex-1 truncate">
					{header.isPlaceholder
						? null
						: flexRender(header.column.columnDef.header, header.getContext())}
				</div>
				{enableColumnMenu && !header.isPlaceholder && header.colSpan === 1 ? (
					<ColumnMenu
						column={header.column}
						table={header.getContext().table}
						config={config.columnMenu}
						open={contextMenuOpen}
						onOpenChange={setContextMenuOpen}
					/>
				) : null}
			</div>
			{
				border && !enableResizing ? null : (
					<HeaderSeparator<TData> header={header} border={border} />
				)
			}
		</GridCell>
	);

	return content;
}
