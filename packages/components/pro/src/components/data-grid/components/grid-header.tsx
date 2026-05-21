"use client"

import { flexRender, type Table, type Header } from "@tanstack/react-table"
import { RestrictToHorizontalAxis } from '@dnd-kit/abstract/modifiers';
import { useSortable } from '@dnd-kit/react/sortable';
import { HeaderSeparator } from "./header-separator";
import { cn } from "@rap/utils";
import { GridCell, GridRow } from "./grid";
import type { DataGridConfig } from "../types";


interface DataGridHeaderProps<TData> {
	table: Table<TData>;
	enableDrag?: boolean;
	dragType?: 'row' | 'column';
	border?: boolean;
	config: DataGridConfig;
}

export function DataGridHeader<TData>({ table, enableDrag, dragType, border, config }: DataGridHeaderProps<TData>) {

	return (
		<div className="bg-muted w-full" >
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
		</div>
	)
}


interface SortableCellProps<TData> {
	header: Header<TData, unknown>;
	index: number;
	border?: boolean;
	config: DataGridConfig;
}

function SortableHeaderCell<TData>({ header, index, border, config }: SortableCellProps<TData>) {
	const { ref, } = useSortable({
		id: header.column.id,
		index,
		type: 'column',
		accept: 'column',
		disabled: false,
		modifiers: [RestrictToHorizontalAxis],
	});
	return (
		<HeaderCell
			ref={ref}
			header={header}
			border={border}
			config={config}
		/>
	);
}

interface HeaderCellProps<TData> {
	header: Header<TData, unknown>;
	border?: boolean;
	config: DataGridConfig;
	ref?: (element: Element | null) => void;
}

function HeaderCell<TData>({ header, border, config, ref }: HeaderCellProps<TData>) {
	const enableResizing = config?.columnResizing?.enable;
	return (
		<GridCell
			ref={ref}
			className={cn(
				"relative group/th",
				border && !(header.colSpan && header.colSpan > 1) ? 'border-r' : ''
			)}
			colSpan={header.colSpan}
			rowSpan={header.rowSpan}
			style={{
				width: enableResizing ? header.getSize() : undefined,
			}}
		>

			<div className="size-full flex items-center">
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
