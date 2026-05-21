"use client"

import { flexRender, type Table, type Row } from "@tanstack/react-table"

import { memo } from "react"
import { useSortable } from "@dnd-kit/react/sortable"
import { GridCell, GridRow } from "./grid"
import type { DataGridConfig } from "../types"

interface DataGridBodyProps<TData> {
	table: Table<TData>
	rowKey: string | ((row: TData, index: number, parentRow?: Row<TData>) => string)
	enableDrag?: boolean;
	dragType?: 'row' | 'column';
	border?: boolean;
	config: DataGridConfig;
}

export function DataGridBody<TData>({
	table,
	rowKey,
	enableDrag,
	dragType,
	border = false,
	config
}: DataGridBodyProps<TData>) {
	const rows = table.getRowModel().rows
	return (
		<div className="w-full">
			{rows.map((row, index) => (
				enableDrag && dragType === 'row' ? (
					<SortableRow<TData>
						key={row.id}
						row={row}
						index={index}
						rowKey={rowKey}
						border={border}
						isLast={index === rows.length - 1}
						config={config}
					/>
				) : (
					<BodyRow<TData> key={row.id} row={row} border={border} isLast={index === rows.length - 1} config={config} />
				)
			))}
		</div>
	)
}

interface SortableRowProps<TData> {
	row: Row<TData>;
	index: number;
	rowKey: string | ((row: TData, index: number, parentRow?: Row<TData>) => string);
	border?: boolean;
	isLast?: boolean;
	className?: string;
	config: DataGridConfig;
}

function SortableRow<TData>({
	row,
	index,
	rowKey,
	border,
	isLast,
	className,
	config
}: SortableRowProps<TData>) {
	const computedId = typeof rowKey === 'function'
		? rowKey(row.original as TData, index)
		: String((row.original as Record<string, unknown>)[rowKey]);

	const { ref, isDragging } = useSortable({
		id: computedId,
		index,
		type: 'row',
		accept: 'row',
		disabled: false,
	});
	const style = {
		boxShadow: isDragging
			? '0 0 0 1px rgba(63, 63, 68, 0.05), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)'
			: undefined,
		opacity: isDragging ? 0.5 : 1,
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
		/>
	);
}

interface BodyRowProps<TData> {
	row: Row<TData>;
	border?: boolean;
	isLast?: boolean;
	style?: React.CSSProperties;
	className?: string;
	config: DataGridConfig;
	ref?: (element: Element | null) => void;
}
function BodyRow<TData>({ row, border, isLast, ref, style, className, config }: BodyRowProps<TData>) {
	const enableResizing = config?.columnResizing?.enable;
	return (
		<GridRow
			ref={ref}
			style={{
				...style,
				...(isLast && border ? { borderBottom: '1px solid var(--border)' } : {}),
			}}
			className={className}
		>
			{row.getVisibleCells().map((cell) => {
				const context = cell.getContext()
				return (
					<GridCell
						key={cell.id}
						className={border ? 'border-r truncate' : ''}
						style={{
							width: enableResizing ? cell.column.getSize() : undefined,
						}}
					>
						{flexRender(cell.column.columnDef.cell, {
							...context,
						})}
					</GridCell>
				)
			})}
		</GridRow>
	);
}

export const MemoizedDataGridBody = memo(
	DataGridBody,
	(prev, next) => prev.table.options.data === next.table.options.data,
) as typeof DataGridBody
