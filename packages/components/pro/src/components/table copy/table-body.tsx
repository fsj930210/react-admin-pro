"use client"

import { flexRender, type Table, type Row } from "@tanstack/react-table"
import { TableBody, TableCell, TableRow } from "@rap/components-ui/table"
import { memo } from "react"
import { useSortable } from "@dnd-kit/react/sortable"
import { getPinningStyles } from "./utils/pinned-styles"
import { ROW_SORT_COLUMN } from "./utils/constants"
import { useDataTable } from "./data-table"

interface DataGridBodyProps<TData> {
	table: Table<TData>
	rowKey: string | ((row: TData, index: number, parentRow?: Row<TData>) => string)
}

export function DataGridBody<TData>({ table, rowKey }: DataGridBodyProps<TData>) {
	return (
		<TableBody>
			{table.getRowModel().rows.map((row, index) => (
				<SortableRow<TData>
					key={row.id}
					row={row}
					index={index}
					rowKey={rowKey}
				/>
			))}
		</TableBody>
	)
}

interface SortableRowProps<TData = any> {
	row: Row<TData>;
	index: number;
	rowKey: string | ((row: TData, index: number, parentRow?: Row<TData>) => string);
}

function SortableRow<TData = any>({ row, index, rowKey }: SortableRowProps<TData>) {
	const { enableRowOrder } = useDataTable()
	const computedId = typeof rowKey === 'function'
		? rowKey(row.original as TData, index)
		: String((row.original as Record<string, unknown>)[rowKey]);

	const { ref, handleRef, isDragging } = useSortable({
		id: computedId,
		index,
		type: 'row',
		accept: 'row',
		disabled: !enableRowOrder,
	});

	return (
		<TableRow
			ref={enableRowOrder ? ref : undefined}
			style={{
				boxShadow: isDragging
					? '0 0 0 1px rgba(63, 63, 68, 0.05), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)'
					: undefined,
				opacity: isDragging ? 0.9 : undefined,
			}}
		>
			{row.getVisibleCells().map((cell) => {
				const pin = getPinningStyles(cell.column)
				const context = cell.getContext()

				return (
					<TableCell key={cell.id} style={pin.style} className={pin.className}>
						{flexRender(cell.column.columnDef.cell, {
							...context,
							handleRef: cell.column.id === ROW_SORT_COLUMN && enableRowOrder ? handleRef : undefined,
						})}
					</TableCell>
				)
			})}
		</TableRow>
	);
}


export const MemoizedTableBody = memo(
	DataTableBody,
	(prev, next) => prev.table.options.data === next.table.options.data,
) as typeof DataTableBody
