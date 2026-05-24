"use client"

import { type Table, type Row } from "@tanstack/react-table"

import { memo, useMemo } from "react"
import { useSortable } from "@dnd-kit/react/sortable"
import { useVirtualizer } from "@tanstack/react-virtual"
import { GridCell, GridRow } from "./grid"
import type { ColumnOrderDragState, DataGridConfig, RowOrderDragState } from "../types"
import { getColumnDragTransforms } from "../utils/column-drag-transform"
import { ROW_ORDER_HANDLE_COLUMN } from "../utils/constants"
import { cn } from "@rap/utils"
import { getColumnPinningClassName, getColumnPinningStyles, getRowPinningStyles } from "../utils/pinning-styles"
import { EditableCell } from "./editable-cell"

interface DataGridBodyProps<TData> {
	table: Table<TData>
	dragType?: 'row' | 'column';
	border?: boolean;
	config: DataGridConfig<TData>;
	columnOrderDrag?: ColumnOrderDragState;
	rowOrderDrag?: RowOrderDragState;
	scrollElement?: HTMLElement | null;
}

export function DataGridBody<TData>({
	table,

	dragType,
	border = false,
	config,
	columnOrderDrag,
	rowOrderDrag,
	scrollElement,
}: DataGridBodyProps<TData>) {
	const topRows = table.getTopRows();
	const centerRows = config.rowPinning?.copyPinnedRows
		? table.getRowModel().rows
		: table.getCenterRows();
	const bottomRows = table.getBottomRows();
	const rows = config.rowPinning?.enable ? centerRows : table.getRowModel().rows;
	const enableDrag = config.rowOrder?.enable ?? false;
	const visibleRows = config.rowPinning?.enable
		? [...topRows, ...rows, ...bottomRows]
		: rows;
	const rowVirtualConfig = typeof config.virtual?.rows === "object"
		? config.virtual.rows
		: { enable: config.virtual?.rows === true };
	const enableRowVirtual = rowVirtualConfig.enable && !config.rowPinning?.enable;
	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => scrollElement ?? null,
		estimateSize: () => rowVirtualConfig.estimateSize ?? 40,
		overscan: rowVirtualConfig.overscan ?? 8,
		enabled: !!enableRowVirtual,
	});
	const virtualItems = rowVirtualizer.getVirtualItems();
	const renderedRows = enableRowVirtual
		? virtualItems.map((virtualItem) => ({
				row: rows[virtualItem.index],
				virtualItem,
			}))
		: rows.map((row, index) => ({ row, virtualItem: { index, start: 0, size: 40 } }));
	const rowTransforms = getRowDragTransforms(visibleRows, rowOrderDrag);
	const renderRow = (
		row: Row<TData>,
		index: number,
		isLast: boolean,
		region: "top" | "center" | "bottom",
		pinnedIndex?: number,
	) => (
		enableDrag && dragType === 'row' ? (
			<SortableRow<TData>
				key={`${region}-${row.id}`}
				row={row}
				index={index}
				border={border}
				isLast={isLast}
				config={config}
				columnOrderDrag={columnOrderDrag}
				rowOrderDrag={rowOrderDrag}
				enableDrag={enableDrag}
				topRowsCount={topRows.length}
				bottomRowsCount={bottomRows.length}
				rowPinningPosition={region === "center" ? undefined : region}
				pinnedIndex={pinnedIndex}
				transform={rowTransforms.get(row.id)}
				isRowDragging={rowOrderDrag?.isDragging}
			/>
		) : (
			<BodyRow<TData>
				key={`${region}-${row.id}`}
				row={row}
				border={border}
				isLast={isLast}
				config={config}
				columnOrderDrag={columnOrderDrag}
				topRowsCount={topRows.length}
				bottomRowsCount={bottomRows.length}
				rowPinningPosition={region === "center" ? undefined : region}
				pinnedIndex={pinnedIndex}
				transform={rowTransforms.get(row.id)}
				isRowDragging={rowOrderDrag?.isDragging}
			/>
		)
	);

	return (
		<>
			{config.rowPinning?.enable
				? topRows.map((row, index) => renderRow(row, index, false, "top", index))
				: null}
			{enableRowVirtual ? (
				<div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
					{renderedRows.map(({ row, virtualItem }) => (
						<div
							key={row.id}
							className="absolute left-0 top-0 w-full"
							style={{ transform: `translateY(${virtualItem.start}px)` }}
						>
							{renderRow(
								row,
								virtualItem.index,
								virtualItem.index === rows.length - 1,
								"center",
							)}
						</div>
					))}
				</div>
			) : renderedRows.map(({ row, virtualItem }) => renderRow(
				row,
				virtualItem.index,
				!config.rowPinning?.enable && virtualItem.index === rows.length - 1,
				"center"
			))}
			{config.rowPinning?.enable
				? bottomRows.map((row, index) =>
					renderRow(row, rows.length + index, index === bottomRows.length - 1, "bottom", index)
				)
				: null}
		</>
	)
}

interface SortableRowProps<TData> {
	row: Row<TData>;
	index: number;
	border?: boolean;
	isLast?: boolean;
	className?: string;
	config: DataGridConfig<TData>;
	columnOrderDrag?: ColumnOrderDragState;
	rowOrderDrag?: RowOrderDragState;
	enableDrag?: boolean;
	topRowsCount: number;
	bottomRowsCount: number;
	rowPinningPosition?: "top" | "bottom";
	pinnedIndex?: number;
	transform?: number;
	isRowDragging?: boolean;
}

function SortableRow<TData>({
	row,
	index,
	border,
	isLast,
	className,
	config,
	columnOrderDrag,
	rowOrderDrag,
	enableDrag,
	topRowsCount,
	bottomRowsCount,
	rowPinningPosition,
	pinnedIndex,
	transform,
	isRowDragging,
}: SortableRowProps<TData>) {
	const computedId = row.id;

	const { ref, isDragging, handleRef } = useSortable({
		id: computedId,
		index,
		type: 'row',
		accept: 'row',
		disabled: !enableDrag,
	});
	const style = {
		boxShadow: isDragging
			? '0 0 0 1px rgba(63, 63, 68, 0.05), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)'
			: undefined,
		opacity: isDragging || rowOrderDrag?.activeRowId === computedId ? 0.35 : 1,
	}
	return (
		<BodyRow<TData>
			row={row}
			border={border}
			isLast={isLast}
			ref={ref}
			style={style}
			className={className}
			config={config}
			columnOrderDrag={columnOrderDrag}
			handleRef={handleRef}
			enableDrag={enableDrag}
			topRowsCount={topRowsCount}
			bottomRowsCount={bottomRowsCount}
			rowPinningPosition={rowPinningPosition}
			pinnedIndex={pinnedIndex}
			transform={transform}
			isRowDragging={isRowDragging}
		/>
	);
}

interface BodyRowProps<TData> {
	row: Row<TData>;
	border?: boolean;
	isLast?: boolean;
	style?: React.CSSProperties;
	className?: string;
	config: DataGridConfig<TData>;
	columnOrderDrag?: ColumnOrderDragState;
	enableDrag?: boolean;
	ref?: (element: Element | null) => void;
	handleRef?: (element: Element | null) => void;
	topRowsCount: number;
	bottomRowsCount: number;
	rowPinningPosition?: "top" | "bottom";
	pinnedIndex?: number;
	transform?: number;
	isRowDragging?: boolean;
}
function BodyRow<TData>({
	row,
	border,
	isLast,
	ref,
	handleRef,
	style,
	className,
	config,
	enableDrag,
	columnOrderDrag,
	topRowsCount,
	bottomRowsCount,
	rowPinningPosition,
	pinnedIndex,
	transform,
	isRowDragging,
}: BodyRowProps<TData>) {
	const enableResizing = config?.columnResizing?.enable;
	const cells = row.getVisibleCells();
	const columnVirtualConfig = typeof config.virtual?.columns === "object"
		? config.virtual.columns
		: { enable: config.virtual?.columns === true };
	const enableColumnVirtual = columnVirtualConfig.enable && !config.columnPinning?.enable;
	const virtualCells = useMemo(() => {
		if (!enableColumnVirtual) return cells;
		const overscan = columnVirtualConfig.overscan ?? 4;
		return cells.slice(0, Math.min(cells.length, 20 + overscan));
	}, [cells, columnVirtualConfig.overscan, enableColumnVirtual]);
	const columnTransforms = getColumnDragTransforms(
		virtualCells.map((cell) => ({
			id: cell.column.id,
			width: cell.column.getSize(),
		})),
		[],
		columnOrderDrag
	);

	return (
		<GridRow
			ref={ref}
			style={{
				...style,
				transform: transform ? `translateY(${transform}px)` : style?.transform,
				transition: isRowDragging ? "transform 180ms cubic-bezier(0.2, 0, 0, 1)" : undefined,
				...(isLast && border ? { borderBottom: '1px solid var(--border)' } : {}),
			}}
			className={cn("group/row", className)}
		>
			{virtualCells.map((cell) => {
				const transform = columnTransforms.get(cell.column.id);
				const pinningStyles = getColumnPinningStyles(cell.column);
				const rowPinningStyles = rowPinningPosition
					? getRowPinningStyles(row, topRowsCount, bottomRowsCount, rowPinningPosition, pinnedIndex)
					: {};
				const isColumnPinned = !!cell.column.getIsPinned();
				const isRowPinned = !!rowPinningPosition;
				const width = enableResizing ? cell.column.getSize() : pinningStyles.width;
				return (
					<GridCell
						key={cell.id}
						className={cn(
							'relative overflow-hidden truncate bg-background group-hover/row:bg-muted/50',
							getColumnPinningClassName(cell.column),
							border ? 'border-r' : ''
						)}
						style={{
							...pinningStyles,
							...rowPinningStyles,
							position: isColumnPinned || isRowPinned ? "sticky" : "relative",
							width,
							minWidth: width,
							maxWidth: width,
							transform: transform ? `translateX(${transform}px)` : undefined,
							transition: columnOrderDrag?.isDragging ? "transform 180ms cubic-bezier(0.2, 0, 0, 1)" : undefined,
							zIndex: (isRowPinned ? 10 : 0) + (isColumnPinned ? 2 : 0) || undefined,
						}}
					>
						<EditableCell
							cell={cell}
							enable={config.editable?.enable}
							handleRef={cell.column.id === ROW_ORDER_HANDLE_COLUMN && enableDrag ? handleRef : undefined}
						/>
					</GridCell>
				)
			})}
			{config.subComponents?.render && row.getIsExpanded() ? (
				<GridCell
					className="col-span-full h-auto border-t bg-muted/30 px-3 py-3"
					style={{ width: "100%" }}
				>
					{config.subComponents.render(row)}
				</GridCell>
			) : null}
		</GridRow>
	);
}

export const MemoizedDataGridBody = memo(
	DataGridBody,
	(prev, next) => prev.table.options.data === next.table.options.data,
) as typeof DataGridBody

function getRowDragTransforms<TData>(
	rows: Row<TData>[],
	rowOrderDrag?: RowOrderDragState,
) {
	const transforms = new Map<string, number>();

	if (!rowOrderDrag?.isDragging || !rowOrderDrag.previewRowOrder?.length) {
		return transforms;
	}

	const rowHeightById = new Map(rows.map((row) => [row.id, 40]));
	const currentOrder = rows.map((row) => row.id).filter((id) => rowHeightById.has(id));
	const previewOrder = rowOrderDrag.previewRowOrder.filter((id) => rowHeightById.has(id));
	const currentTopById = getRowTopById(currentOrder, rowHeightById);
	const previewTopById = getRowTopById(previewOrder, rowHeightById);

	for (const id of currentOrder) {
		const currentTop = currentTopById.get(id);
		const previewTop = previewTopById.get(id);

		if (currentTop == null || previewTop == null) continue;

		const delta = previewTop - currentTop;

		if (delta !== 0) {
			transforms.set(id, delta);
		}
	}

	return transforms;
}

function getRowTopById(order: string[], rowHeightById: Map<string, number>) {
	const topById = new Map<string, number>();
	let top = 0;

	for (const id of order) {
		topById.set(id, top);
		top += rowHeightById.get(id) ?? 0;
	}

	return topById;
}
