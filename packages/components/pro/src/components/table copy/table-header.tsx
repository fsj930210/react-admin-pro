"use client"

import { flexRender, type Table, type Header } from "@tanstack/react-table"
import { TableHead, TableHeader, TableRow } from "@rap/components-ui/table"
import { getPinningStyles } from "./utils/pinned-styles"
import { cn } from "@rap/utils"
import { RestrictToHorizontalAxis } from '@dnd-kit/abstract/modifiers';
import { useSortable } from '@dnd-kit/react/sortable';
import type { CSSProperties } from "react";
import { DataTableResizer } from "./column/column-resizer"
import { useDataTable } from "./data-table"



export function DataTableHeader<TData>({ table, }: { table: Table<TData>, }) {

	return (
		<TableHeader>
			{table.getHeaderGroups().map((headerGroup) => {
				const pinnedIds = new Set<string>();
				headerGroup.headers.forEach((header) => {
					if (header.column.getIsPinned()) {
						pinnedIds.add(String(header.column.id));
					}
				});


				let nonPinnedIndex = 0;
				return (
					<TableRow key={headerGroup.id}>
						{headerGroup.headers.map((header) => {
							const pin = getPinningStyles(header.column)
							const isPinned = pinnedIds.has(String(header.column.id));
							const currentIndex = isPinned ? -1 : nonPinnedIndex;
							if (!isPinned) {
								nonPinnedIndex++;
							}
							return (
								<SortableHead
									key={header.id}
									header={header}
									index={currentIndex}
									style={{ ...(pin.style ?? {}) }}
									className={cn("group/th", pin.className)}
									isPinned={isPinned}
								/>
							)
						})}
					</TableRow>
				)
			})}
		</TableHeader >
	)
}


interface SortableHeaderProps<TData> {
	header: Header<TData, unknown>;
	index: number;
	style: CSSProperties;
	className?: string;
	isPinned: boolean;
}

function SortableHead<TData>({ header, index, style, className, isPinned }: SortableHeaderProps<TData>) {
	const { enableColumnOrder } = useDataTable()
	const { ref, isDragging, sourceRef } = useSortable({
		id: header.column.id,
		index,
		type: 'column',
		accept: 'column',
		disabled: isPinned || !enableColumnOrder,
		modifiers: [RestrictToHorizontalAxis],
	});
	console.log(sourceRef)
	return (
		<TableHead
			ref={ref}
			style={{
				...style,
				cursor: enableColumnOrder && !isPinned ? 'grab' : undefined,
				userSelect: enableColumnOrder ? 'none' : undefined,
				opacity: isDragging ? 0.5 : undefined,
				backgroundColor: isDragging ? '#f1f5f9' : style.backgroundColor,
			}}
			className={className}
		>
			{header.isPlaceholder
				? null
				: flexRender(header.column.columnDef.header, header.getContext())}
			{header.column.columnDef.enableResizing && header.column.getCanResize() && (
				<DataTableResizer header={header} />
			)}
		</TableHead>
	);
}
